import csv
import os
from db import get_connection

CSV_FILE = os.path.join(os.path.dirname(__file__), "dormitories.csv")

# Upsert a single dormitory row by Name (unique); returns its Id.
UPSERT_DORM_SQL = """
    INSERT INTO "Dormitories" ("Name", "Address", "Note", "RegistrationUrl")
    VALUES (%(name)s, %(address)s, %(note)s, %(registration_url)s)
    ON CONFLICT ("Name") DO UPDATE SET
        "Address"         = EXCLUDED."Address",
        "Note"            = EXCLUDED."Note",
        "RegistrationUrl" = EXCLUDED."RegistrationUrl"
    RETURNING "Id"
"""

# Add a university ↔ dormitory link (ignore if already exists).
LINK_SQL = """
    INSERT INTO "UniversityDormitories" ("DormitoriesId", "UniversitiesId")
    VALUES (%s, %s)
    ON CONFLICT DO NOTHING
"""

# Remove all university links for a dormitory not present in the CSV (cleanup).
DELETE_LINKS_SQL = """
    DELETE FROM "UniversityDormitories"
    WHERE "DormitoriesId" = %s AND "UniversitiesId" = ANY(%s)
"""

# Remove a dormitory that has no university links left.
DELETE_ORPHAN_DORM_SQL = """
    DELETE FROM "Dormitories"
    WHERE "Id" = %s
    AND NOT EXISTS (
        SELECT 1 FROM "UniversityDormitories" WHERE "DormitoriesId" = %s
    )
"""


def load_csv():
    """Read dormitories.csv → list of { uni_codes: [str], name, address, ... }."""
    rows = []
    with open(CSV_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_codes = (row.get("UniCodes") or "").strip()
            name = (row.get("Name") or "").strip()
            if not raw_codes or not name:
                continue
            uni_codes = [c.strip() for c in raw_codes.split(",") if c.strip()]
            rows.append({
                "uni_codes": uni_codes,
                "name": name,
                "address": (row.get("Address") or "").strip() or None,
                "note": (row.get("Note") or "").strip() or None,
                "registration_url": (row.get("RegistrationUrl") or "").strip() or None,
            })
    return rows


def run():
    rows = load_csv()
    print(f"Loaded {len(rows)} dormitories from CSV")

    upserted = linked = unlinked = orphans_removed = skipped_codes = 0

    with get_connection() as conn, conn.cursor() as cur:
        # Build university code → id map
        cur.execute('SELECT "Id", "Code" FROM "Universities"')
        uni_id_by_code = {code: id_ for id_, code in cur.fetchall()}

        # Track which (dorm_id, uni_id) pairs are in the CSV this run
        csv_links: dict[int, set[int]] = {}  # dorm_id → set of uni_ids from CSV

        for row in rows:
            # Resolve university ids
            uni_ids = []
            for code in row["uni_codes"]:
                uid = uni_id_by_code.get(code)
                if uid is None:
                    print(f"  SKIP code '{code}' for dorm '{row['name']}' — không tìm thấy University")
                    skipped_codes += 1
                else:
                    uni_ids.append(uid)

            if not uni_ids:
                print(f"  SKIP dorm '{row['name']}' — tất cả UniCodes không hợp lệ")
                continue

            # Upsert the dormitory by Name
            cur.execute(UPSERT_DORM_SQL, {
                "name": row["name"],
                "address": row["address"],
                "note": row["note"],
                "registration_url": row["registration_url"],
            })
            dorm_id = cur.fetchone()[0]
            upserted += 1

            # Upsert join table entries
            for uid in uni_ids:
                cur.execute(LINK_SQL, (dorm_id, uid))
                linked += 1

            csv_links.setdefault(dorm_id, set()).update(uni_ids)

        # Cleanup: remove join rows for universities no longer listed in CSV for each dorm
        cur.execute('SELECT "DormitoriesId", "UniversitiesId" FROM "UniversityDormitories"')
        existing_links: dict[int, set[int]] = {}
        for dorm_id, uni_id in cur.fetchall():
            existing_links.setdefault(dorm_id, set()).add(uni_id)

        for dorm_id, existing_unis in existing_links.items():
            csv_unis = csv_links.get(dorm_id, set())
            stale_unis = existing_unis - csv_unis
            if stale_unis:
                cur.execute(DELETE_LINKS_SQL, (dorm_id, list(stale_unis)))
                unlinked += len(stale_unis)

            # If no links remain and dorm is no longer in CSV at all, delete the dorm row
            if dorm_id not in csv_links:
                cur.execute(DELETE_ORPHAN_DORM_SQL, (dorm_id, dorm_id))
                if cur.rowcount:
                    orphans_removed += 1

        conn.commit()

    print(
        f"Done — upserted: {upserted}, links added/kept: {linked}, "
        f"links removed: {unlinked}, orphan dorms removed: {orphans_removed}, "
        f"skipped codes: {skipped_codes}"
    )


if __name__ == "__main__":
    run()
