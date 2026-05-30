import csv
import os
from db import get_connection

CSV_FILE = os.path.join(os.path.dirname(__file__), "Universities.csv")

def _parse_bool(value: str):
    """'1'/'true' → True, '0'/'false' → False, empty/unknown → None."""
    v = value.strip().lower()
    if v in ("1", "true", "yes"):
        return True
    if v in ("0", "false", "no"):
        return False
    return None


# UniType enum values (matches C# enum order: Public=0, Private=1)
UNI_TYPE_MAP = {
    "0": 0,  # Public
    "1": 1,  # Private
}

INSERT_SQL = """
    INSERT INTO "Universities" ("Name", "ShortName", "EnglishName", "Code", "Type", "ImageUrl", "IsFinanciallyAutonomous")
    VALUES (%(name)s, %(short_name)s, %(english_name)s, %(code)s, %(type)s, %(image_url)s, %(is_financially_autonomous)s)
"""

UPDATE_SQL = """
    UPDATE "Universities" SET
        "Name"                   = %(name)s,
        "ShortName"              = %(short_name)s,
        "EnglishName"            = %(english_name)s,
        "Type"                   = %(type)s,
        "ImageUrl"               = %(image_url)s,
        "IsFinanciallyAutonomous" = %(is_financially_autonomous)s
    WHERE "Code" = %(code)s
"""


def load_universities():
    rows = []
    seen_codes = set()

    with open(CSV_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row["Code"].strip()
            if not code or code in seen_codes:
                continue
            seen_codes.add(code)

            rows.append({
                "name": row["Name"].strip(),
                "short_name": row["ShortName"].strip() or None,
                "english_name": row["EnglishName"].strip() or None,
                "code": code,
                "type": UNI_TYPE_MAP.get(row["Type"].strip(), 0),
                "image_url": row["ImageUrl"].strip() or None,
                "is_financially_autonomous": _parse_bool(row.get("IsFinanciallyAutonomous", "")),
            })

    return rows


def run():
    universities = load_universities()
    csv_codes = {u["code"] for u in universities}
    print(f"Loaded {len(universities)} unique universities from CSV")

    inserted = updated = deleted = 0

    with get_connection() as conn, conn.cursor() as cur:
        cur.execute('SELECT "Id", "Code", "Name" FROM "Universities"')
        existing = {code: (id_, name) for id_, code, name in cur.fetchall()}

        for uni in universities:
            if uni["code"] in existing:
                cur.execute(UPDATE_SQL, uni)
                updated += 1
            else:
                cur.execute(INSERT_SQL, uni)
                inserted += 1

        # Remove universities no longer in CSV
        orphan_codes = set(existing.keys()) - csv_codes
        for code in orphan_codes:
            uni_id, uni_name = existing[code]
            cur.execute(
                """SELECT EXISTS(SELECT 1 FROM "Campuses" WHERE "UniversityId" = %s)
                        OR EXISTS(SELECT 1 FROM "Majors"    WHERE "UniversityId" = %s)""",
                (uni_id, uni_id),
            )
            has_children = cur.fetchone()[0]
            if has_children:
                print(f"  SKIP delete '{code}' ({uni_name}) — has linked Campuses/Majors, remove manually")
            else:
                cur.execute('DELETE FROM "Universities" WHERE "Code" = %s', (code,))
                deleted += 1
                print(f"  Deleted '{code}' ({uni_name})")

        conn.commit()

    print(f"Done — inserted: {inserted}, updated: {updated}, deleted: {deleted}")


if __name__ == "__main__":
    run()
