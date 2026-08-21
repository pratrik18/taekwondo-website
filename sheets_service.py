import os
import json
import time
import gspread
from datetime import datetime
from zoneinfo import ZoneInfo
from google.oauth2.service_account import Credentials

import config

_service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")

if _service_account_json:
    creds_info = json.loads(_service_account_json)
    creds = Credentials.from_service_account_info(
        creds_info,
        scopes=config.SCOPES,
    )
else:
    creds = Credentials.from_service_account_file(
        config.CREDENTIALS_FILE,
        scopes=config.SCOPES,
    )

client = gspread.authorize(creds)

book = client.open_by_key(config.SPREADSHEET_ID)
landing = book.worksheet("Landing")
database = book.worksheet("Database")

_cache = {}


def _get_landing_values():

    now = time.time()
    if "data" not in _cache or now - _cache["time"] > config.CACHE_TTL:
        _cache["data"] = landing.get_all_values()
        _cache["time"] = now
    return _cache["data"]


def get_cell(row, col):

    all_values = _get_landing_values()
    try:
        return all_values[row][col]
    except IndexError:
        return ""

def card_accent_change(stav1, stav2, stav3):
    card1 = 0
    card2 = 0
    card3 = 0

    if 'Nezobraziť' not in (stav1, stav2, stav3):
        card1+=1
        card2+=1+card1
        card3+=1+card2
    elif 'Nezobraziť' not in (stav1, stav2):
        card1+=1
        card2+=1+card1
    elif 'Nezobraziť' not in (stav2, stav3):
        card2+=1
        card3+=1+card2
    elif 'Nezobraziť' not in (stav1, stav3):
        card1+=1
        card3+=1+card1
    else:
        card1 = 1
        card2 = 1
        card3 = 1

    return card1, card2, card3

def get_landing_data():

    stav1 = get_cell(10, 2).strip()
    stav2 = get_cell(10, 3).strip()
    stav3 = get_cell(10, 4).strip()

    stavOnas1 = get_cell(1, 2).strip()
    stavOnas2 = get_cell(1, 3).strip()
    stavOnas3 = get_cell(1, 4).strip()

    c1, c2, c3 = card_accent_change(
        stav1,
        stav2,
        stav3
    )

    return {

        'c1': c1,
        'c2': c2,
        'c3': c3,

        "roky": get_cell(3, 2),
        "clenovia": get_cell(3, 3),
        "treningy": get_cell(3, 4),

        "nadpis1": get_cell(12, 2),
        "nadpis2": get_cell(12, 3),
        "nadpis3": get_cell(12, 4),

        "popis1": get_cell(15, 2),
        "popis2": get_cell(15, 3),
        "popis3": get_cell(15, 4),

        "slots1": [
            (get_cell(22, 2), get_cell(24, 2)),
            (get_cell(27, 2), get_cell(29, 2)),
            (get_cell(32, 2), get_cell(34, 2)),
        ],
        "slots2": [
            (get_cell(22, 3), get_cell(24, 3)),
            (get_cell(27, 3), get_cell(29, 3)),
            (get_cell(32, 3), get_cell(34, 3)),
        ],
        "slots3": [
            (get_cell(22, 4), get_cell(24, 4)),
            (get_cell(27, 4), get_cell(29, 4)),
            (get_cell(32, 4), get_cell(34, 4)),
        ],

        'nazovInfo': get_cell(37, 2),
        'popisInfo': get_cell(39, 2),

        "zobrazit1": stav1 != "Nezobraziť",
        "zobrazit2": stav2 != "Nezobraziť",
        "zobrazit3": stav3 != "Nezobraziť",

        "zobrazitOnas1": stavOnas1 != "Nezobraziť",
        "zobrazitOnas2": stavOnas2 != "Nezobraziť",
        "zobrazitOnas3": stavOnas3 != "Nezobraziť"
    }

def sanitize_sheet_value(value):
    if value is None:
        return ""

    value = str(value)

    if value.startswith(("=", "+", "-", "@")):
        return "'" + value

    return value

def contact_exists(email, telefon):
    all_rows = database.get_all_values()

    email_norm = email.strip().lower()
    telefon_norm = telefon.strip()

    for row in all_rows:
        for cell in row:
            cell_norm = cell.strip().lower()
            if email_norm and cell_norm == email_norm:
                return True
            if telefon_norm and cell.strip() == telefon_norm:
                return True
    return False

def _get_next_id():
    ids_col = database.col_values(1)
    numeric_ids = [int(v) for v in ids_col[1:] if v.strip().isdigit()]
    return max(numeric_ids, default=0) + 1

def append_contact(meno, priezvisko, telefon, email):
    if contact_exists(email, telefon):
        return False

    suhlas_udeleny_o = datetime.now(ZoneInfo("Europe/Bratislava")).strftime("%Y-%m-%d %H:%M:%S")

    new_id = _get_next_id()
    database.append_row([new_id,
                         sanitize_sheet_value(meno),
                         sanitize_sheet_value(priezvisko),
                         sanitize_sheet_value(telefon),
                         sanitize_sheet_value(email),
                         suhlas_udeleny_o])
    return True
