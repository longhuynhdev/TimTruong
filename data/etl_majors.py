"""ETL ngành theo năm: majors/{Code}-{Short}-{Year}.csv → bảng Majors + MajorYears."""

import csv
import glob
import os
from decimal import Decimal, InvalidOperation

from db import get_connection
from enums import parse_tuition_fee_unit

MAJORS_DIR = os.path.join(os.path.dirname(__file__), "majors")

COL_CODE = "MajorCode"
COL_OLD = "OldCode"
COL_NAME = "MajorName"
COL_QUOTA = "EnrollmentQuota"
COL_FEE_MIN = "TuitionFeeMin"
COL_FEE_MAX = "TuitionFeeMax"
COL_UNIT = "TuitionFeeUnit"

MAJOR_INSERT_SQL = """
    INSERT INTO "Majors" ("Name", "Code", "OldCode", "UniversityId")
    VALUES (%(name)s, %(code)s, %(oldcode)s, %(uni_id)s)
    RETURNING "Id"
"""
MAJOR_UPDATE_SQL = """
    UPDATE "Majors" SET "Name" = %(name)s, "Code" = %(code)s, "OldCode" = %(oldcode)s
     WHERE "Id" = %(id)s
"""

MY_INSERT_SQL = """
    INSERT INTO "MajorYears"
        ("MajorId", "Year", "TuitionFeeMin", "TuitionFeeMax", "TuitionFeeUnit", "EnrollmentQuota")
    VALUES (%(major_id)s, %(year)s, %(fee_min)s, %(fee_max)s, %(unit)s, %(quota)s)
"""
MY_UPDATE_SQL = """
    UPDATE "MajorYears"
       SET "TuitionFeeMin" = %(fee_min)s, "TuitionFeeMax" = %(fee_max)s,
           "TuitionFeeUnit" = %(unit)s, "EnrollmentQuota" = %(quota)s
     WHERE "Id" = %(id)s
"""


def parse_uni_code(filename: str) -> str:
    """'QSC-UIT-2026.csv' → 'QSC'."""
    return os.path.basename(filename).split("-", 1)[0].strip()


def parse_year(filename: str):
    """'QSC-UIT-2026.csv' → 2026 (phần cuối tên file). None nếu không hợp lệ."""
    stem = os.path.splitext(os.path.basename(filename))[0]
    last = stem.rsplit("-", 1)[-1].strip()
    return int(last) if last.isdigit() else None


def parse_money(value: str):
    """Chuỗi tiền VND → Decimal. Rỗng → None; không parse được → 'INVALID' sentinel.

    Hỗ trợ '25'/'28.5'/'28,5' (số nhỏ hoặc có 'triệu' → triệu đồng), '25 triệu',
    '41.800.000'/'41,800,000', '41800000'. Locale VN: '.' phân tách nghìn, ',' thập phân —
    nhưng vẫn nhận '28.5' (1 chấm, ≤2 chữ số) là thập phân. Số < 1000 hoặc có 'triệu' → ×1e6.
    """
    v = (value or "").strip().lower()
    if not v:
        return None
    has_trieu = "tr" in v
    num_str = "".join(ch for ch in v if ch.isdigit() or ch in ".,")
    if not num_str:
        return "INVALID"
    if "," in num_str and "." in num_str:
        if num_str.rfind(",") > num_str.rfind("."):
            num_str = num_str.replace(".", "").replace(",", ".")
        else:
            num_str = num_str.replace(",", "")
    elif num_str.count(",") > 1:
        num_str = num_str.replace(",", "")
    elif "," in num_str:
        num_str = num_str.replace(",", ".")
    elif num_str.count(".") > 1:
        num_str = num_str.replace(".", "")
    elif "." in num_str:
        intpart, frac = num_str.split(".")
        if len(frac) == 3:
            num_str = intpart + frac
    try:
        num = Decimal(num_str)
    except InvalidOperation:
        return "INVALID"
    if has_trieu or num < 1000:
        num *= 1_000_000
    return num


def parse_quota(value: str):
    digits = "".join(ch for ch in (value or "") if ch.isdigit())
    return int(digits) if digits else None


def load_file(path: str, year: int):
    """Đọc 1 CSV → (rows, errors). Mỗi row: code, oldcode, name, quota, fee_min/max, unit."""
    rows, errors = [], []
    with open(path, encoding="utf-8") as f:
        for lineno, raw in enumerate(csv.DictReader(f), start=2):
            code = (raw.get(COL_CODE) or "").strip()
            if not code:
                continue

            fee_min = parse_money(raw.get(COL_FEE_MIN, ""))
            fee_max = parse_money(raw.get(COL_FEE_MAX, ""))
            if fee_min == "INVALID" or fee_max == "INVALID":
                errors.append(f"dòng {lineno} ({code}): học phí không hợp lệ — bỏ học phí")
                fee_min = fee_max = None
            elif fee_max is not None and fee_min is not None and fee_max <= fee_min:
                errors.append(f"dòng {lineno} ({code}): 'TuitionFeeMax' ≤ 'Min' — bỏ Max (số cụ thể để trống Max)")
                fee_max = None

            unit = parse_tuition_fee_unit(raw.get(COL_UNIT, ""))
            if unit == "UNKNOWN":
                errors.append(f"dòng {lineno} ({code}): đơn vị lạ '{raw.get(COL_UNIT)}' — bỏ đơn vị")
                unit = None

            rows.append({
                "code": code,
                "oldcode": (raw.get(COL_OLD) or "").strip() or None,
                "name": (raw.get(COL_NAME) or "").strip(),
                "quota": parse_quota(raw.get(COL_QUOTA, "")),
                "fee_min": fee_min,
                "fee_max": fee_max,
                "unit": unit,
            })
    return rows, errors


def upsert_major(cur, uni_id, code_to_id, row):
    """Tìm major theo mã (khớp đúng nguyên văn) hoặc OldCode; cập nhật/tạo. Trả major_id."""
    keys = {k for k in (row["code"], row["oldcode"]) if k}
    candidate_ids = {code_to_id[k] for k in keys if k in code_to_id}

    if len(candidate_ids) > 1:
        print(f"  WARN {row['code']}: khớp nhiều Major {candidate_ids} — chọn id nhỏ nhất")
    major_id = min(candidate_ids) if candidate_ids else None

    if major_id is None:
        cur.execute(MAJOR_INSERT_SQL, {
            "name": row["name"], "code": row["code"],
            "oldcode": row["oldcode"], "uni_id": uni_id,
        })
        major_id = cur.fetchone()[0]
    else:
        # OldCode = mã của file (nếu có), nếu không thì mã hiện hành cũ khi đổi mã.
        cur.execute('SELECT "Code", "OldCode" FROM "Majors" WHERE "Id" = %s', (major_id,))
        cur_code, cur_old = cur.fetchone()
        old_code = row["oldcode"] or cur_old
        if cur_code and cur_code != row["code"]:
            old_code = cur_code
        if old_code == row["code"]:
            old_code = None
        cur.execute(MAJOR_UPDATE_SQL, {
            "id": major_id, "name": row["name"], "code": row["code"],
            "oldcode": old_code,
        })

    # Cập nhật map để các dòng sau cùng file nhận diện được
    for k in keys:
        code_to_id[k] = major_id
    return major_id


def process_uni(cur, uni_code, uni_id, year, rows):
    """Upsert Majors + MajorYears cho 1 trường/năm. Trả (major_upd, my_ins, my_upd, my_del)."""
    cur.execute('SELECT "Id", "Code", "OldCode" FROM "Majors" WHERE "UniversityId" = %s', (uni_id,))
    code_to_id = {}
    for id_, code, oldcode in cur.fetchall():
        if code:
            code_to_id[code] = id_
        if oldcode:
            code_to_id[oldcode] = id_

    # 1) Majors (danh tính)
    major_ids = []
    for r in rows:
        major_ids.append(upsert_major(cur, uni_id, code_to_id, r))

    # 2) MajorYears (chỉ tiêu + học phí năm này)
    cur.execute(
        'SELECT "Id", "MajorId" FROM "MajorYears" WHERE "MajorId" = ANY(%s) AND "Year" = %s',
        (major_ids, year),
    )
    my_existing = {mid: id_ for id_, mid in cur.fetchall()}

    my_ins = my_upd = 0
    seen = set()
    for r, major_id in zip(rows, major_ids):
        seen.add(major_id)
        params = {"major_id": major_id, "year": year, "fee_min": r["fee_min"],
                  "fee_max": r["fee_max"], "unit": r["unit"], "quota": r["quota"]}
        if major_id in my_existing:
            cur.execute(MY_UPDATE_SQL, {**params, "id": my_existing[major_id]})
            my_upd += 1
        else:
            cur.execute(MY_INSERT_SQL, params)
            my_ins += 1

    # Orphan: MajorYear năm này của ngành (trong file) nhưng ngành không còn trong file
    my_del = 0
    for mid, id_ in my_existing.items():
        if mid not in seen:
            cur.execute('DELETE FROM "MajorYears" WHERE "Id" = %s', (id_,))
            my_del += 1

    return len(rows), my_ins, my_upd, my_del


def run():
    files = sorted(glob.glob(os.path.join(MAJORS_DIR, "*.csv")))
    if not files:
        print(f"Không thấy CSV nào trong {MAJORS_DIR}")
        return
    print(f"Tìm thấy {len(files)} file ngành")

    tot_major = tot_ins = tot_upd = tot_del = 0
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
                print(f"  SKIP file '{os.path.basename(path)}' — không suy được Năm từ tên file (cần {{Code}}-{{ShortName}}-{{Năm}}.csv)")
                continue

            rows, errors = load_file(path, year)
            for e in errors:
                print(f"  [{uni_code}] {e}")
            n_major, my_ins, my_upd, my_del = process_uni(cur, uni_code, uni_id, year, rows)
            print(f"  {uni_code} {year}: {n_major} ngành | MajorYear +{my_ins} ~{my_upd} -{my_del}")
            tot_major += n_major
            tot_ins += my_ins
            tot_upd += my_upd
            tot_del += my_del

        conn.commit()

    print(f"Done — {tot_major} dòng ngành; MajorYear inserted: {tot_ins}, updated: {tot_upd}, deleted: {tot_del}")


if __name__ == "__main__":
    run()
