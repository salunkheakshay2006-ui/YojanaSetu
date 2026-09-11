import csv
import os
import sys
from typing import Any, Dict, List, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
PARENT_DIR = os.path.dirname(BACKEND_DIR)

for path in [PARENT_DIR, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

try:
    from backend.database import get_connection, init_db
    from backend.crud import insert_scheme
except ImportError:
    from database import get_connection, init_db
    from crud import insert_scheme

COLUMN_MAPPING = {
    "Scheme_ID": "scheme_id",
    "Scheme_Name": "scheme_name",
    "Category": "category",
    "State": "state",
    "Central_or_State": "central_or_state",
    "Benefit": "benefit",
    "Age_Min": "age_min",
    "Age_Max": "age_max",
    "Income_Limit": "income_limit",
    "Gender": "gender",
    "Occupation": "occupation",
    "Education": "education",
    "SC": "sc",
    "ST": "st",
    "OBC": "obc",
    "EWS": "ews",
    "General": "general",
    "Farmer": "farmer",
    "Student": "student",
    "Business": "business",
    "Disability": "disability",
    "Widow": "widow",
    "Minority": "minority",
    "Required_Documents": "required_documents",
    "Official_Link": "official_link",
    "Description": "description",
    "Eligibility_Text": "eligibility_text",
    "Missing_Documents": "missing_documents",
    "AI_Tags": "ai_tags"
}

CORE_COLUMNS = list(COLUMN_MAPPING.values())

BOOL_COLUMNS = [
    "sc", "st", "obc", "ews", "general", "farmer", "student",
    "business", "disability", "widow", "minority"
]

NUMERIC_COLUMNS = ["age_min", "age_max", "income_limit"]

def to_binary(val: Any) -> int:
    """Convert yes/no, boolean, or numeric representations to 0 or 1."""
    if val is None:
        return 0
    if isinstance(val, bool):
        return 1 if val else 0
    val_str = str(val).strip().lower()
    if val_str in ["true", "yes", "y", "1", "1.0"]:
        return 1
    return 0

def parse_float(val: Any) -> Optional[float]:
    """Safely convert value to float or return None."""
    if val is None:
        return None
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ["nan", "none", "null", "<na>"]:
        return None
    try:
        return float(val_str)
    except (ValueError, TypeError):
        return None

def clean_dataset(raw_csv_path: str, cleaned_csv_path: str) -> List[Dict[str, Any]]:
    """Load raw CSV dataset, clean and normalize fields, save cleaned CSV."""
    if not os.path.exists(raw_csv_path):
        fallback_path = os.path.join(BACKEND_DIR, "data", "raw_schemes.csv")
        if os.path.exists(fallback_path):
            raw_csv_path = fallback_path
        else:
            raise FileNotFoundError(f"Raw scheme data not found at {raw_csv_path}")

    cleaned_rows: List[Dict[str, Any]] = []
    seen_ids = set()
    seen_names = set()

    with open(raw_csv_path, mode="r", encoding="utf-8-sig") as infile:
        reader = csv.DictReader(infile)

        for idx, row in enumerate(reader):
            norm_row = {}
            for k, v in row.items():
                if k:
                    clean_k = k.strip()
                    target_col = COLUMN_MAPPING.get(clean_k, clean_k.lower())
                    norm_row[target_col] = str(v).strip() if v is not None else ""

            clean_row = {}
            for col in CORE_COLUMNS:
                clean_row[col] = norm_row.get(col, "")

            scheme_name = clean_row.get("scheme_name", "")
            if not scheme_name or scheme_name.lower() in ["nan", "none", "null"]:
                continue

            scheme_id = clean_row.get("scheme_id") if clean_row.get("scheme_id") else f"SCH{idx+1:04d}"
            clean_row["scheme_id"] = scheme_id

            if scheme_id in seen_ids or scheme_name.lower() in seen_names:
                continue
            seen_ids.add(scheme_id)
            seen_names.add(scheme_name.lower())

            for col in BOOL_COLUMNS:
                clean_row[col] = to_binary(clean_row.get(col))

            for col in NUMERIC_COLUMNS:
                clean_row[col] = parse_float(clean_row.get(col))

            if clean_row["age_min"] is None:
                clean_row["age_min"] = 0.0

            cleaned_rows.append(clean_row)

    os.makedirs(os.path.dirname(cleaned_csv_path), exist_ok=True)
    with open(cleaned_csv_path, mode="w", encoding="utf-8", newline="") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=CORE_COLUMNS)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    print(f"[Cleaner] Cleaned dataset saved successfully to {cleaned_csv_path} ({len(cleaned_rows)} records)")
    return cleaned_rows

def seed_db(cleaned_rows: List[Dict[str, Any]], conn=None):
    """Seed the SQLite database with cleaned scheme records."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        init_db()
        for row in cleaned_rows:
            insert_scheme(conn, row)
        print(f"[Cleaner] Successfully inserted {len(cleaned_rows)} schemes into database.")
    except Exception as e:
        print(f"[Cleaner] Error seeding database: {e}")
        raise e
    finally:
        if close_conn and conn:
            conn.close()

def run_cleaning_pipeline():
    """Execute complete data cleaning and DB seeding pipeline."""
    raw_path = os.path.join(BACKEND_DIR, "data", "raw_schemes.csv")
    cleaned_path = os.path.join(BACKEND_DIR, "data", "cleaned_schemes.csv")

    cleaned_rows = clean_dataset(raw_path, cleaned_path)
    seed_db(cleaned_rows)

if __name__ == "__main__":
    run_cleaning_pipeline()
