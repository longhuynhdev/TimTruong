"""ETL điểm chuẩn: admissionrequirements/*.csv → bảng AdmissionRequirements.

Chạy SAU khi đã review tay CSV (xem extract_admissions.py) và đã nạp majors
(etl_majors.py). Upsert theo key (MajorId, ExamType, SubjectCombination, Year),
xoá orphan trong phạm vi các (major, year) có trong file — giống cơ chế etl_majors.

Dùng: uv run etl_admissions.py
"""

import csv
import glob
import os
from decimal import Decimal, InvalidOperation

from db import get_connection
from enums import parse_exam_type, parse_subject_combination

AR_DIR = os.path.join(os.path.dirname(__file__), "admissionrequirements")

COL_CODE = "Mã ngành xét tuyển"
COL_METHOD = "Phương thức"
COL_COMBO = "Tổ hợp"
COL_SCORE = "Điểm"

INSERT_SQL = """
    INSERT INTO "AdmissionRequirements"
        ("MajorId", "ExamType", "Score", "SubjectCombination", "Year")
    VALUES (%(major_id)s, %(exam_type)s, %(score)s, %(combo)s, %(year)s)
"""
UPDATE_SQL = 'UPDATE "AdmissionRequirements" SET "Score" = %(score)s WHERE "Id" = %(id)s'


def parse_uni_code(filename: str) -> str:
    """'DLS-ULSA2-2025.csv' → 'DLS'."""
    return os.path.basename(filename).split("-", 1)[0].strip()


def parse_year(filename: str):
    """'DLS-ULSA2-2025.csv' → 2025 (phần cuối tên file). None nếu không hợp lệ."""
    stem = os.path.splitext(os.path.basename(filename))[0]
    last = stem.rsplit("-", 1)[-1].strip()
    return int(last) if last.isdigit() else None


def load_file(path: str, year: int):
    """Đọc 1 CSV → list dòng đã chuẩn hoá/convert. Trả (rows, errors)."""
    rows, errors = [], []
    with open(path, encoding="utf-8") as f:
        for lineno, raw in enumerate(csv.DictReader(f), start=2):
            code = (raw.get(COL_CODE) or "").strip()
            if not code:
                continue

            exam_type = parse_exam_type(raw.get(COL_METHOD, ""))
            if exam_type is None:
                errors.append(f"dòng {lineno}: phương thức lạ '{raw.get(COL_METHOD)}' — bỏ")
                continue

            combo = parse_subject_combination(raw.get(COL_COMBO, ""))
            if combo == "UNKNOWN":
                errors.append(f"dòng {lineno} ({code}): tổ hợp lạ '{raw.get(COL_COMBO)}' — bỏ (mở rộng enum trước)")
                continue

            try:
                score = Decimal((raw.get(COL_SCORE) or "").strip())
            except (InvalidOperation, ValueError):
                errors.append(f"dòng {lineno} ({code}): điểm không hợp lệ '{raw.get(COL_SCORE)}' — bỏ")
                continue

            rows.append({
                "code": code,
                "exam_type": exam_type,
                "combo": combo,
                "score": score,
                "year": year,
            })
    return rows, errors


def process_uni(cur, uni_code, uni_id, rows):
    """Upsert AdmissionRequirements cho 1 trường. Trả (ins, upd, deleted, skipped)."""
    cur.execute('SELECT "Id", "Code" FROM "Majors" WHERE "UniversityId" = %s', (uni_id,))
    major_id_by_code = {code: id_ for id_, code in cur.fetchall()}

    # Lọc dòng có major khớp
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

    # Tải các requirement hiện có trong phạm vi (major ∈ file, year ∈ file)
    cur.execute(
        '''SELECT "Id", "MajorId", "ExamType", "SubjectCombination", "Year"
             FROM "AdmissionRequirements"
            WHERE "MajorId" = ANY(%s) AND "Year" = ANY(%s)''',
        (list(major_ids), list(years)),
    )
    existing = {(mid, et, sc, yr): id_ for id_, mid, et, sc, yr in cur.fetchall()}

    ins = upd = 0
    csv_keys = set()
    for r in valid:
        key = (r["major_id"], r["exam_type"], r["combo"], r["year"])
        csv_keys.add(key)
        if key in existing:
            cur.execute(UPDATE_SQL, {"id": existing[key], "score": r["score"]})
            upd += 1
        else:
            cur.execute(INSERT_SQL, r)
            ins += 1

    # Orphan: requirement cũ trong phạm vi (major, year) của file nhưng không còn trong CSV
    deleted = 0
    for key, id_ in existing.items():
        if key not in csv_keys:
            cur.execute('DELETE FROM "AdmissionRequirements" WHERE "Id" = %s', (id_,))
            deleted += 1

    return ins, upd, deleted, skipped


def run():
    files = sorted(glob.glob(os.path.join(AR_DIR, "*.csv")))
    if not files:
        print(f"Không thấy CSV nào trong {AR_DIR}")
        return
    print(f"Tìm thấy {len(files)} file điểm chuẩn")

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
            print(f"  {uni_code}: +{ins} ~{upd} -{deleted} (skip {skipped})")
            tot_ins += ins
            tot_upd += upd
            tot_del += deleted
            tot_skip += skipped

        conn.commit()

    print(f"Done — inserted: {tot_ins}, updated: {tot_upd}, deleted: {tot_del}, skipped: {tot_skip}")


if __name__ == "__main__":
    run()
