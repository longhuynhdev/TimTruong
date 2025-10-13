from google.oauth2 import service_account
from googleapiclient.discovery import build
import csv
import psycopg2
import os
import hashlib
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Config
CREDENTIALS_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# Subject combination mapping
SUBJECT_COMBINATION_MAP = {
    'A00': 100, 'A01': 101, 'A02': 102, 'A03': 103, 'A04': 104,
    'A05': 105, 'A06': 106, 'A07': 107, 'A08': 108, 'A09': 109,
    'A10': 110, 'A11': 111, 'A12': 112, 'A14': 114, 'A15': 115,
    'A16': 116, 'A17': 117, 'A18': 118,
    'B00': 200, 'B01': 201, 'B02': 202, 'B03': 203, 'B04': 204,
    'B05': 205, 'B08': 208,
    'C00': 300, 'C01': 301, 'C02': 302, 'C03': 303,
    'D01': 401, 'D02': 402, 'D03': 403, 'D04': 404, 'D05': 405,
    'D06': 406, 'D07': 407, 'D08': 408, 'D09': 409, 'D10': 410,
    'X06': 506, 'X26': 526
}

def connect_to_sheets():
    print("⏳ Connecting to Google Sheets API...")
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=SCOPES
    )
    service = build('sheets', 'v4', credentials=credentials)
    print("✅ Connection successful!")
    return service

def connect_to_postgres():
    print("⏳ Connecting to PostgreSQL database...")
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            database=os.getenv('POSTGRES_DATABASE'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            port=int(os.getenv('POSTGRES_PORT', 5432))
        )
        print("✅ Database connection successful!")
        return conn
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return None

def load_config(csv_file='universities.csv'):
    """Return dict {university_code: spreadsheet_id}"""
    config = {}
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            config[row['university_code']] = row['spreadsheet_id']
    return config

def read_sheet(service, spreadsheet_id, range_name='A1:Z1000'):
    print(f"📖 Reading spreadsheet...")
    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id,
        range=range_name
    ).execute()
    values = result.get('values', [])
    print(f"✅ Read {len(values)} rows")
    return values

def create_hash(*args):
    """Create SHA256 hash from arguments"""
    content = '|'.join(str(arg) for arg in args)
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def parse_sheet_data(rows, university_id):
    """
    Parse sheet data and return structured major and admission requirement data

    Returns:
        tuple: (majors_list, admission_requirements_list)
    """
    if len(rows) < 2:
        print("❌ Not enough rows in sheet")
        return [], []

    # Parse headers
    header_row = rows[0]
    subject_combo_row = rows[1]

    # Find column indices
    col_major_code = 1      # Mã ngành xét tuyển
    col_major_name = 2      # Tên ngành
    col_field_of_study = 3  # Lĩnh vực
    col_year = 4            # Năm
    col_enrollment_quota = 5 # Chỉ tiêu
    col_dgnl_score = 6      # Điểm ĐGNL
    col_thptqg_start = 7    # Start of THPTQG combinations

    # Get THPTQG subject combinations from row 1
    thptqg_combinations = []
    for i in range(col_thptqg_start, len(subject_combo_row)):
        combo_code = subject_combo_row[i].strip()
        if combo_code and combo_code in SUBJECT_COMBINATION_MAP:
            thptqg_combinations.append((i, combo_code, SUBJECT_COMBINATION_MAP[combo_code]))

    print(f"📊 Found {len(thptqg_combinations)} THPTQG subject combinations: {[c[1] for c in thptqg_combinations]}")

    majors = []
    admission_requirements = []

    # Process data rows (skip header rows 0 and 1)
    for row_idx, row in enumerate(rows[2:], start=2):
        if len(row) < col_enrollment_quota + 1:
            continue

        # Extract major data
        major_code = row[col_major_code].strip() if col_major_code < len(row) else ''
        major_name = row[col_major_name].strip() if col_major_name < len(row) else ''
        field_of_study = row[col_field_of_study].strip() if col_field_of_study < len(row) else 'Chưa phân loại'
        year_str = row[col_year].strip() if col_year < len(row) else '2025'
        enrollment_quota_str = row[col_enrollment_quota].strip() if col_enrollment_quota < len(row) else ''

        if not major_code or not major_name:
            continue

        # Handle empty field of study
        if not field_of_study:
            field_of_study = 'Chưa phân loại'

        try:
            year = int(year_str)
            enrollment_quota = int(enrollment_quota_str) if enrollment_quota_str else None
        except ValueError:
            print(f"⚠️  Row {row_idx}: Invalid year or quota for {major_code}")
            continue

        # Create major record
        major_hash = create_hash(major_code, major_name, field_of_study, enrollment_quota, university_id)
        major = {
            'code': major_code,
            'name': major_name,
            'field_of_study': field_of_study,
            'enrollment_quota': enrollment_quota,
            'university_id': university_id,
            'source_hash': major_hash
        }
        majors.append(major)

        # Process ĐGNL score
        if col_dgnl_score < len(row):
            dgnl_score_str = row[col_dgnl_score].strip()
            if dgnl_score_str and dgnl_score_str != '-':
                try:
                    dgnl_score = float(dgnl_score_str)
                    req_hash = create_hash(major_code, 'ĐGNL', dgnl_score, None, year)
                    admission_requirements.append({
                        'major_code': major_code,
                        'exam_type': 1,  # ĐGNL
                        'score': dgnl_score,
                        'subject_combination': None,
                        'year': year,
                        'source_hash': req_hash
                    })
                except ValueError:
                    pass

        # Process THPTQG scores
        for col_idx, combo_code, combo_enum in thptqg_combinations:
            if col_idx < len(row):
                score_str = row[col_idx].strip()
                if score_str and score_str != '-':
                    try:
                        score = float(score_str)
                        req_hash = create_hash(major_code, 'THPTQG', score, combo_enum, year)
                        admission_requirements.append({
                            'major_code': major_code,
                            'exam_type': 0,  # THPTQG
                            'score': score,
                            'subject_combination': combo_enum,
                            'year': year,
                            'source_hash': req_hash
                        })
                    except ValueError:
                        pass

    print(f"✅ Parsed {len(majors)} majors and {len(admission_requirements)} admission requirements")
    return majors, admission_requirements

def upsert_majors_to_staging(conn, majors):
    """
    Insert or update majors in staging table
    Only updates if source_hash has changed
    """
    cur = conn.cursor()

    new_count = 0
    updated_count = 0
    unchanged_count = 0

    for major in majors:
        # Check if major exists in staging
        cur.execute(
            """
            SELECT id, source_hash FROM majors_staging
            WHERE code = %s AND university_id = %s
            """,
            (major['code'], major['university_id'])
        )
        existing = cur.fetchone()

        if existing:
            existing_id, existing_hash = existing
            if existing_hash != major['source_hash']:
                # Update if hash changed
                cur.execute(
                    """
                    UPDATE majors_staging
                    SET name = %s, field_of_study = %s, enrollment_quota = %s,
                        source_hash = %s, etl_timestamp = NOW()
                    WHERE id = %s
                    """,
                    (major['name'], major['field_of_study'], major['enrollment_quota'],
                     major['source_hash'], existing_id)
                )
                updated_count += 1
            else:
                unchanged_count += 1
        else:
            # Insert new record
            cur.execute(
                """
                INSERT INTO majors_staging
                (name, code, field_of_study, enrollment_quota, university_id, source_hash, etl_timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """,
                (major['name'], major['code'], major['field_of_study'],
                 major['enrollment_quota'], major['university_id'], major['source_hash'])
            )
            new_count += 1

    conn.commit()
    cur.close()

    print(f"✅ Majors staging: {new_count} new, {updated_count} updated, {unchanged_count} unchanged")
    return new_count, updated_count, unchanged_count

def upsert_admission_requirements_to_staging(conn, admission_requirements):
    """
    Insert or update admission requirements in staging table
    Only updates if source_hash has changed

    Note: We need to link to major_id from staging table using major_code
    """
    cur = conn.cursor()

    # First, get mapping of major_code to staging major_id
    major_code_to_id = {}
    cur.execute("SELECT id, code FROM majors_staging")
    for row in cur.fetchall():
        major_code_to_id[row[1]] = row[0]

    new_count = 0
    updated_count = 0
    unchanged_count = 0
    skipped_count = 0

    for req in admission_requirements:
        # Get major_id from staging table
        major_id = major_code_to_id.get(req['major_code'])
        if not major_id:
            print(f"⚠️  Skipping requirement for unknown major code: {req['major_code']}")
            skipped_count += 1
            continue

        # Check if requirement exists in staging
        cur.execute(
            """
            SELECT id, source_hash FROM admission_requirements_staging
            WHERE major_id = %s AND exam_type = %s AND year = %s
                AND (subject_combination = %s OR (subject_combination IS NULL AND %s IS NULL))
            """,
            (major_id, req['exam_type'], req['year'],
             req['subject_combination'], req['subject_combination'])
        )
        existing = cur.fetchone()

        if existing:
            existing_id, existing_hash = existing
            if existing_hash != req['source_hash']:
                # Update if hash changed
                cur.execute(
                    """
                    UPDATE admission_requirements_staging
                    SET score = %s, source_hash = %s, etl_timestamp = NOW()
                    WHERE id = %s
                    """,
                    (req['score'], req['source_hash'], existing_id)
                )
                updated_count += 1
            else:
                unchanged_count += 1
        else:
            # Insert new record
            cur.execute(
                """
                INSERT INTO admission_requirements_staging
                (major_id, exam_type, score, subject_combination, year, source_hash, etl_timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """,
                (major_id, req['exam_type'], req['score'],
                 req['subject_combination'], req['year'], req['source_hash'])
            )
            new_count += 1

    conn.commit()
    cur.close()

    print(f"✅ Admission requirements staging: {new_count} new, {updated_count} updated, {unchanged_count} unchanged, {skipped_count} skipped")
    return new_count, updated_count, unchanged_count, skipped_count

def merge_majors_to_production(conn):
    """
    Merge majors from staging to production table
    - Insert new majors
    - Update changed majors (based on source_hash)
    """
    cur = conn.cursor()

    new_count = 0
    updated_count = 0

    # Get all staging majors
    cur.execute('''
        SELECT id, name, code, field_of_study, enrollment_quota, university_id, source_hash
        FROM majors_staging
    ''')
    staging_majors = cur.fetchall()

    print(f"Processing {len(staging_majors)} majors from staging...")

    for staging_major in staging_majors:
        staging_id, name, code, field_of_study, enrollment_quota, university_id, source_hash = staging_major

        # Check if major exists in production
        cur.execute(
            'SELECT "Id" FROM "Majors" WHERE "Code" = %s AND "UniversityId" = %s',
            (code, university_id)
        )
        existing = cur.fetchone()

        if existing:
            prod_id = existing[0]
            # Update production record
            cur.execute(
                '''
                UPDATE "Majors"
                SET "Name" = %s, "FieldOfStudy" = %s, "EnrollmentQuota" = %s
                WHERE "Id" = %s
                ''',
                (name, field_of_study, enrollment_quota, prod_id)
            )
            updated_count += 1
        else:
            # Insert new record
            cur.execute(
                '''
                INSERT INTO "Majors" ("Name", "Code", "FieldOfStudy", "EnrollmentQuota", "UniversityId")
                VALUES (%s, %s, %s, %s, %s)
                ''',
                (name, code, field_of_study, enrollment_quota, university_id)
            )
            new_count += 1

    conn.commit()
    cur.close()

    print(f"✅ Majors production: {new_count} new, {updated_count} updated")
    return new_count, updated_count

def merge_admission_requirements_to_production(conn):
    """
    Merge admission requirements from staging to production table
    - Insert new requirements
    - Update changed requirements (based on source_hash)
    """
    cur = conn.cursor()

    new_count = 0
    updated_count = 0

    # Get all staging admission requirements with major info
    cur.execute('''
        SELECT ar.id, m.code, ar.exam_type, ar.score, ar.subject_combination, ar.year, ar.source_hash
        FROM admission_requirements_staging ar
        JOIN majors_staging m ON ar.major_id = m.id
    ''')
    staging_reqs = cur.fetchall()

    print(f"Processing {len(staging_reqs)} admission requirements from staging...")

    for staging_req in staging_reqs:
        staging_id, major_code, exam_type, score, subject_combination, year, source_hash = staging_req

        # Get production major_id from major_code
        cur.execute(
            'SELECT "Id" FROM "Majors" WHERE "Code" = %s',
            (major_code,)
        )
        prod_major_result = cur.fetchone()

        if not prod_major_result:
            print(f"⚠️  Skipping requirement for unknown major code in production: {major_code}")
            continue

        prod_major_id = prod_major_result[0]

        # Check if requirement exists in production
        cur.execute(
            '''
            SELECT "Id" FROM "AdmissionRequirements"
            WHERE "MajorId" = %s AND "ExamType" = %s AND "Year" = %s
                AND ("SubjectCombination" = %s OR ("SubjectCombination" IS NULL AND %s IS NULL))
            ''',
            (prod_major_id, exam_type, year, subject_combination, subject_combination)
        )
        existing = cur.fetchone()

        if existing:
            prod_id = existing[0]
            # Update production record
            cur.execute(
                '''
                UPDATE "AdmissionRequirements"
                SET "Score" = %s
                WHERE "Id" = %s
                ''',
                (score, prod_id)
            )
            updated_count += 1
        else:
            # Insert new record
            cur.execute(
                '''
                INSERT INTO "AdmissionRequirements" ("MajorId", "ExamType", "Score", "SubjectCombination", "Year")
                VALUES (%s, %s, %s, %s, %s)
                ''',
                (prod_major_id, exam_type, score, subject_combination, year)
            )
            new_count += 1

    conn.commit()
    cur.close()

    print(f"✅ Admission requirements production: {new_count} new, {updated_count} updated")
    return new_count, updated_count


def process_university(service, conn, university_code, spreadsheet_id):
    """
    Process ETL for a single university

    Args:
        service: Google Sheets API service
        conn: PostgreSQL connection
        university_code: University code (e.g., 'QST', 'KMA')
        spreadsheet_id: Google Sheets spreadsheet ID

    Returns:
        bool: True if successful, False otherwise
    """
    print("\n" + "="*70)
    print(f"PROCESSING UNIVERSITY: {university_code}")
    print("="*70)

    # Get university ID from database
    cur = conn.cursor()
    cur.execute('SELECT "Id", "Name" FROM "Universities" WHERE "Code" = %s', (university_code,))
    result = cur.fetchone()

    if not result:
        print(f"❌ University {university_code} not found in database. Skipping...")
        cur.close()
        return False

    university_id, university_name = result
    print(f"✅ Found university: {university_name} (ID: {university_id})")
    cur.close()

    # Read sheet data
    try:
        data = read_sheet(service, spreadsheet_id)
    except Exception as e:
        print(f"❌ Failed to read sheet for {university_code}: {e}")
        return False

    # Parse data
    print("\n📊 Parsing data...")
    majors, admission_requirements = parse_sheet_data(data, university_id)

    if not majors:
        print(f"⚠️  No majors found for {university_code}. Skipping...")
        return False

    # Load to staging tables
    print("\n📥 Loading to staging tables...")
    upsert_majors_to_staging(conn, majors)
    upsert_admission_requirements_to_staging(conn, admission_requirements)

    # Merge to production tables
    print("\n📤 Merging to production tables...")
    merge_majors_to_production(conn)
    merge_admission_requirements_to_production(conn)

    print(f"\n✅ Successfully processed university: {university_code}")
    return True


if __name__ == '__main__':
    print("="*70)
    print("ETL PROCESS STARTED")
    print("="*70)

    # Connect to services
    service = connect_to_sheets()
    conn = connect_to_postgres()
    if not conn:
        print("❌ Failed to connect to database. Exiting...")
        exit(1)

    # Load university configuration
    config = load_config()
    print(f"\n📋 Found {len(config)} universities in configuration:")
    for uni_code in config.keys():
        print(f"  - {uni_code}")

    # Process each university
    print("\n" + "="*70)
    print("PROCESSING UNIVERSITIES")
    print("="*70)

    success_count = 0
    failed_count = 0

    for university_code, spreadsheet_id in config.items():
        try:
            if process_university(service, conn, university_code, spreadsheet_id):
                success_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"❌ Error processing {university_code}: {e}")
            failed_count += 1

    # Summary
    print("\n" + "="*70)
    print("ETL PROCESS COMPLETED")
    print("="*70)
    print(f"✅ Successfully processed: {success_count} universities")
    if failed_count > 0:
        print(f"❌ Failed: {failed_count} universities")

    conn.close()

