import csv
import glob
import os
from db import get_connection

MAJORS_DIR = os.path.join(os.path.dirname(__file__), "majors")

# CSV column headers in each majors file
COL_CODE = "MajorCode"
COL_NAME = "MajorName"

INSERT_SQL = """
    INSERT INTO "Majors" ("Name", "Code", "UniversityId")
    VALUES (%(name)s, %(code)s, %(university_id)s)
"""

UPDATE_SQL = """
    UPDATE "Majors" SET "Name" = %(name)s
    WHERE "UniversityId" = %(university_id)s AND "Code" = %(code)s
"""


def parse_uni_code(filename: str) -> str:
    """Mã trường là phần đầu tên file, vd 'SGD-SGU - Trường...' → 'SGD'."""
    return os.path.basename(filename).split("-", 1)[0].strip()


def load_majors_by_uni():
    """Duyệt majors/*.csv → { uni_code: [ {code, name}, ... ] }."""
    by_uni = {}

    for path in sorted(glob.glob(os.path.join(MAJORS_DIR, "*.csv"))):
        uni_code = parse_uni_code(path)
        rows = []
        seen_codes = set()

        with open(path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                code = (row.get(COL_CODE) or "").strip()
                name = (row.get(COL_NAME) or "").strip()
                if not code or code in seen_codes:
                    continue
                seen_codes.add(code)
                rows.append({"code": code, "name": name})

        by_uni[uni_code] = rows

    return by_uni


def run():
    majors_by_uni = load_majors_by_uni()
    total = sum(len(rows) for rows in majors_by_uni.values())
    print(f"Loaded {total} majors across {len(majors_by_uni)} universities from CSV")

    inserted = updated = deleted = skipped = 0

    with get_connection() as conn, conn.cursor() as cur:
        cur.execute('SELECT "Id", "Code" FROM "Universities"')
        uni_id_by_code = {code: id_ for id_, code in cur.fetchall()}

        for uni_code, majors in majors_by_uni.items():
            uni_id = uni_id_by_code.get(uni_code)
            if uni_id is None:
                print(f"  SKIP file '{uni_code}' — không tìm thấy University có Code này")
                continue

            cur.execute(
                'SELECT "Id", "Code" FROM "Majors" WHERE "UniversityId" = %s',
                (uni_id,),
            )
            existing = {code: id_ for id_, code in cur.fetchall()}
            csv_codes = {m["code"] for m in majors}

            for major in majors:
                params = {
                    "name": major["name"],
                    "code": major["code"],
                    "university_id": uni_id,
                }
                if major["code"] in existing:
                    cur.execute(UPDATE_SQL, params)
                    updated += 1
                else:
                    cur.execute(INSERT_SQL, params)
                    inserted += 1

            # Remove majors no longer in CSV for this university
            orphan_codes = set(existing.keys()) - csv_codes
            for code in orphan_codes:
                major_id = existing[code]
                cur.execute(
                    'SELECT EXISTS(SELECT 1 FROM "AdmissionRequirements" WHERE "MajorId" = %s)',
                    (major_id,),
                )
                has_requirements = cur.fetchone()[0]
                if has_requirements:
                    print(f"  SKIP delete major '{code}' (uni {uni_code}) — có AdmissionRequirements, xóa thủ công")
                    skipped += 1
                else:
                    cur.execute('DELETE FROM "Majors" WHERE "Id" = %s', (major_id,))
                    deleted += 1

        conn.commit()

    print(f"Done — inserted: {inserted}, updated: {updated}, deleted: {deleted}, skipped: {skipped}")


if __name__ == "__main__":
    run()
