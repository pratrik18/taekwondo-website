import os
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

CREDENTIALS_FILE = "credentials.json"
SPREADSHEET_ID = os.environ.get("SPREADSHEET_ID")
CACHE_TTL = 30

DEBUG = os.environ.get("DEBUG", "False") == "True"