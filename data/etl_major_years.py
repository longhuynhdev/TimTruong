"""ETL dữ liệu ngành theo năm: major_years/*.csv → bảng MajorYears."""

import csv
import glob
import os
from decimal import Decimal, InvalidOperation

from db import get_connection
from enums import parse_tuition_fee_unit

MY_DIR = os.path.join(os.path.dirname(__file__), "major_years")

COL_CODE = "MajorCode"
COL_FEE_MIN = "TuitionFeeMin"
COL_FEE_MAX = "TuitionFeeMax"
COL_UNIT = "TuitionFeeUnit"
COL_QUOTA = "EnrollmentQuota"

INSERT_SQL = """
    INSERT INTO "MajorYears"
        ("MajorId", "Year", "TuitionFeeMin", "TuitionFeeMax", "TuitionFeeUnit", "EnrollmentQuota")
    VALUES (%(major_id)s, %(year)s, %(fee_min)s, %(fee_max)s, %(unit)s, %(quota)s)
"""
UPDATE_SQL = """
    UPDATE "MajorYears"
       SET "TuitionFeeMin" = %(fee_min)s, "TuitionFeeMax" = %(fee_max)s,
           "TuitionFeeUnit" = %(unit)s, "EnrollmentQuota" = %(quota)s
     WHERE "Id" = %(id)s
"""


def parse_uni_code(filename: str) -> str:
    """'QST-HCMUS-2026.csv' → 'QST'."""
    return os.path.basename(filename).split("-", 1)[0].strip()


def parse_year(filename: str):
    """'QST-HCMUS-2026.csv' → 2026 (phần cuối tên file). None nếu không hợp lệ."""
    stem = os.path.splitext(os.path.basename(filename))[0]
    last = stem.rsplit("-", 1)[-1].strip()
    return int(last) if last.isdigit() else None


def parse_money(value: str):
    """Chuỗi tiền VND → Decimal. Rỗng → None; không parse được → 'INVALID' sentinel.

    Hỗ trợ: '25'/'28.5'/'28,5' (số nhỏ hoặc có 'triệu' → hiểu là triệu đồng),
    '25 triệu', '25.000.000'/'25,000,000', '25000000'. Quy ước locale VN: '.' là dấu
    phân tách hàng nghìn, ',' là dấu thập phân — nhưng vẫn nhận '28.5' (1 dấu chấm, ≤2 chữ
    số thập phân) là số thập phân để tiện nhập tay. Số < 1000 hoặc có 'triệu' → ×1_000_000.
    """
    v = (value or "").strip().lower()
    if not v:
        return None
    has_trieu = "tr" in v  # 'triệu' / 'tr'
    num_str = "".join(ch for ch in v if ch.isdigit() or ch in ".,")
    if not num_str:
        return "INVALID"
    # Chuẩn hoá dấu phân tách về một dấu chấm thập phân duy nhất.
    if "," in num_str and "." in num_str:
        # Dấu xuất hiện sau cùng là dấu thập phân.
        if num_str.rfind(",") > num_str.rfind("."):
            num_str = num_str.replace(".", "").replace(",", ".")
        else:
            num_str = num_str.replace(",", "")
    elif num_str.count(",") > 1:
        num_str = num_str.replace(",", "")  # nhiều ',' = phân tách nghìn (25,000,000)
    elif "," in num_str:
        num_str = num_str.replace(",", ".")  # 1 dấu ',' kiểu VN = thập phân
    elif num_str.count(".") > 1:
        num_str = num_str.replace(".", "")  # nhiều '.' = phân tách nghìn (25.000.000)
    elif "." in num_str:
        intpart, frac = num_str.split(".")
        if len(frac) == 3:  # '25.000' = phân tách nghìn
            num_str = intpart + frac
        # còn lại (vd '28.5') giữ làm số thập phân
    try:
        num = Decimal(num_str)
    except InvalidOperation:
        return "INVALID"
    if has_trieu or num < 1000:
        num *= 1_000_000
    return num


def parse_quota(value: str):
    v = (value or "").strip()
    if not v:
        return None
    digits = "".join(ch for ch in v if ch.isdigit())
    return int(digits) if digits else None


def load_file(path: str, year: int):
    """Đọc 1 CSV → (rows, errors)."""
    rows, errors = [], []
    with open(path, encoding="utf-8") as f:
        for lineno, raw in enumerate(csv.DictReader(f), start=2):
            code = (raw.get(COL_CODE) or "").strip()
            if not code:
                continue

            fee_min = parse_money(raw.get(COL_FEE_MIN, ""))
            fee_max = parse_money(raw.get(COL_FEE_MAX, ""))
            if fee_min == "INVALID" or fee_max == "INVALID":
                errors.append(f"dòng {lineno} ({code}): học phí không hợp lệ — bỏ")
                continue
            if fee_min is None and fee_max is not None:
                errors.append(f"dòng {lineno} ({code}): có 'Học phí đến' nhưng thiếu 'Học phí từ' — bỏ")
                continue
            if fee_max is not None and fee_min is not None and fee_max <= fee_min:
                errors.append(f"dòng {lineno} ({code}): 'Học phí đến' ≤ 'Học phí từ' — bỏ (số cụ thể thì để trống cột đến)")
                continue

            unit = parse_tuition_fee_unit(raw.get(COL_UNIT, ""))
            if unit == "UNKNOWN":
                errors.append(f"dòng {lineno} ({code}): đơn vị lạ '{raw.get(COL_UNIT)}' — bỏ")
                continue

            rows.append({
                "code": code,
                "year": year,
                "fee_min": fee_min,
                "fee_max": fee_max,
                "unit": unit,
                "quota": parse_quota(raw.get(COL_QUOTA, "")),
            })
    return rows, errors


def process_uni(cur, uni_code, uni_id, rows):
    """Upsert MajorYears cho 1 trường. Trả (ins, upd, deleted, skipped)."""
    cur.execute('SELECT "Id", "Code" FROM "Majors" WHERE "UniversityId" = %s', (uni_id,))
    major_id_by_code = {code: id_ for id_, code in cur.fetchall()}

    valid, skipped = [], 0
    for r in rows:
        major_id = major_id_by_code.get(r["code"])
        if major_id is None:
            print(f"  SKIP {uni_code}/{r['code']} — không có Major khớp (chạy etl_majors trước)")
            skipped += 1
            continue
        valid.append({**r, "major_id": major_id})

    if not valid:
        return 0, 0, 0, skipped

    major_ids = {r["major_id"] for r in valid}
    years = {r["year"] for r in valid}

    cur.execute(
        'SELECT "Id", "MajorId", "Year" FROM "MajorYears" WHERE "MajorId" = ANY(%s) AND "Year" = ANY(%s)',
        (list(major_ids), list(years)),
    )
    existing = {(mid, yr): id_ for id_, mid, yr in cur.fetchall()}

    ins = upd = 0
    csv_keys = set()
    for r in valid:
        key = (r["major_id"], r["year"])
        csv_keys.add(key)
        if key in existing:
            cur.execute(UPDATE_SQL, {**r, "id": existing[key]})
            upd += 1
        else:
            cur.execute(INSERT_SQL, r)
            ins += 1

    deleted = 0
    for key, id_ in existing.items():
        if key not in csv_keys:
            cur.execute('DELETE FROM "MajorYears" WHERE "Id" = %s', (id_,))
            deleted += 1

    return ins, upd, deleted, skipped


def run():
    files = sorted(glob.glob(os.path.join(MY_DIR, "*.csv")))
    if not files:
        print(f"Không thấy CSV nào trong {MY_DIR}")
        return
    print(f"Tìm thấy {len(files)} file major-years")

    tot_ins = tot_upd = tot_del = tot_skip = 0
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute('SELECT "Id", "Code" FROM "Universities"')
        uni_id_by_code = {code: id_ for id_, code in cur.fetchall()}

        for path in files:
            uni_code = parse_uni_code(path)
            uni_id = uni_id_by_code.get(uni_code)
            if uni_id is None:
                print(f"  SKIP file '{os.path.basename(path)}' — không có University Code '{uni_code}'")
                continue

            year = parse_year(path)
            if year is None:
                print(f"  SKIP file '{os.path.basename(path)}' — không suy được Năm từ tên file (cần dạng {{Code}}-{{ShortName}}-{{Năm}}.csv)")
                continue

            rows, errors = load_file(path, year)
            for e in errors:
                print(f"  [{uni_code}] {e}")
            ins, upd, deleted, skipped = process_uni(cur, uni_code, uni_id, rows)
            print(f"  {uni_code} {year}: +{ins} ~{upd} -{deleted} (skip {skipped})")
            tot_ins += ins
            tot_upd += upd
            tot_del += deleted
            tot_skip += skipped

        conn.commit()

    print(f"Done — inserted: {tot_ins}, updated: {tot_upd}, deleted: {tot_del}, skipped: {tot_skip}")


if __name__ == "__main__":
    run()
