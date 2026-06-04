"""ETL xếp hạng đại học: data/_shared/university_rankings.csv → bảng UniversityRankings."""

import csv
import os

from db import get_connection
from enums import parse_rank, parse_ranking_system

CSV_FILE = os.path.join(os.path.dirname(__file__), "data", "_shared", "university_rankings.csv")

# Upsert 1 dòng xếp hạng theo (UniversityId, RankingSystem, Year).
UPSERT_SQL = """
    INSERT INTO "UniversityRankings"
        ("UniversityId", "RankingSystem", "Year", "RankFrom", "RankTo", "SourceUrl")
    VALUES (%(uni_id)s, %(system)s, %(year)s, %(rank_from)s, %(rank_to)s, %(source_url)s)
    ON CONFLICT ("UniversityId", "RankingSystem", "Year") DO UPDATE SET
        "RankFrom"  = EXCLUDED."RankFrom",
        "RankTo"    = EXCLUDED."RankTo",
        "SourceUrl" = EXCLUDED."SourceUrl"
"""


def load_csv():
    """Đọc university_rankings.csv → (rows, errors). Mỗi row đã convert sẵn."""
    rows, errors = [], []
    with open(CSV_FILE, encoding="utf-8") as f:
        for lineno, raw in enumerate(csv.DictReader(f), start=2):
            codes_raw = (raw.get("UniCodes") or "").strip()
            if not codes_raw:
                continue

            system = parse_ranking_system(raw.get("System", ""))
            if system is None:
                errors.append(f"dòng {lineno}: hệ thống lạ '{raw.get('System')}' — bỏ (mở rộng enum trước)")
                continue

            year_raw = (raw.get("Year") or "").strip()
            if not year_raw.isdigit():
                errors.append(f"dòng {lineno}: năm không hợp lệ '{raw.get('Year')}' — bỏ")
                continue

            rank = parse_rank(raw.get("Rank", ""))
            if rank is None:
                errors.append(f"dòng {lineno}: rank không hợp lệ '{raw.get('Rank')}' — bỏ")
                continue

            rows.append({
                "uni_codes": [c.strip() for c in codes_raw.split(",") if c.strip()],
                "system": system,
                "year": int(year_raw),
                "rank_from": rank[0],
                "rank_to": rank[1],
                "source_url": (raw.get("SourceUrl") or "").strip() or None,
            })
    return rows, errors


def run():
    rows, errors = load_csv()
    for e in errors:
        print(f"  {e}")
    print(f"Đọc {len(rows)} dòng xếp hạng từ CSV")

    upserted = deleted = skipped = 0
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute('SELECT "Id", "Code" FROM "Universities"')
        uni_id_by_code = {code: id_ for id_, code in cur.fetchall()}

        csv_keys: set[tuple[int, int, int]] = set()   # (uni_id, system, year) có trong file
        editions: set[tuple[int, int]] = set()        # (system, year) có trong file

        for r in rows:
            editions.add((r["system"], r["year"]))
            for code in r["uni_codes"]:
                uid = uni_id_by_code.get(code)
                if uid is None:
                    print(f"  SKIP code '{code}' (system {r['system']}, {r['year']}) — không tìm thấy University")
                    skipped += 1
                    continue
                cur.execute(UPSERT_SQL, {
                    "uni_id": uid,
                    "system": r["system"],
                    "year": r["year"],
                    "rank_from": r["rank_from"],
                    "rank_to": r["rank_to"],
                    "source_url": r["source_url"],
                })
                upserted += 1
                csv_keys.add((uid, r["system"], r["year"]))

        # Orphan: dòng cũ thuộc các edition (system, year) có trong file nhưng không còn trong CSV
        if editions:
            systems = list({s for s, _ in editions})
            years = list({y for _, y in editions})
            cur.execute(
                '''SELECT "Id", "UniversityId", "RankingSystem", "Year"
                     FROM "UniversityRankings"
                    WHERE "RankingSystem" = ANY(%s) AND "Year" = ANY(%s)''',
                (systems, years),
            )
            for id_, uid, sys_, yr in cur.fetchall():
                if (sys_, yr) in editions and (uid, sys_, yr) not in csv_keys:
                    cur.execute('DELETE FROM "UniversityRankings" WHERE "Id" = %s', (id_,))
                    deleted += 1

        conn.commit()

    print(f"Done — upsert: {upserted}, orphan xoá: {deleted}, skip codes: {skipped}")


if __name__ == "__main__":
    run()
