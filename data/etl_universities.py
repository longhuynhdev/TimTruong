import csv
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

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


def get_connection():
    return psycopg2.connect(
        host=os.environ["POSTGRES_HOST"],
        port=int(os.environ.get("POSTGRES_PORT", 5432)),
        dbname=os.environ["POSTGRES_DATABASE"],
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
    )


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
    print(f"Loaded {len(universities)} unique universities from CSV")

    inserted = updated = 0

    with get_connection() as conn, conn.cursor() as cur:
        cur.execute('SELECT "Code" FROM "Universities"')
        existing_codes = {r[0] for r in cur.fetchall()}

        for uni in universities:
            if uni["code"] in existing_codes:
                cur.execute(UPDATE_SQL, uni)
                updated += 1
            else:
                cur.execute(INSERT_SQL, uni)
                inserted += 1

        conn.commit()

    print(f"Done — inserted: {inserted}, updated: {updated}")


if __name__ == "__main__":
    run()
