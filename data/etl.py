from google.oauth2 import service_account
from googleapiclient.discovery import build
import csv
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
# Config
CREDENTIALS_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def connect_to_sheets():
    print("⏳Connecting to Google Sheets API...")
    
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
        print("✅ Connection successful!")
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
    print(f"📖 Reading the spreadsheet: {spreadsheet_id[:]}...")
    
    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id,
        range=range_name
    ).execute()
    
    values = result.get('values', [])
    print(f"✅ Read {len(values)} lines")
    
    return values

def load_config(csv_file='universities.csv'):
    """Return dict {university_code: spreadsheet_id}"""
    config = {}
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            config[row['university_code']] = row['spreadsheet_id']
    return config


if __name__ == '__main__':

    service = connect_to_sheets()
    config = load_config()
    data = read_sheet(service, config['QST'])

    print("\n" + "="*70)
    print("DATA:")
    print("="*70)
    for i, row in enumerate(data[:]):
        print(f"Line {i}: {row}")

