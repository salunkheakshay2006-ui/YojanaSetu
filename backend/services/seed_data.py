import csv
import os
import sys
from typing import Any, Dict, List, Optional, Tuple

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
PARENT_DIR = os.path.dirname(BACKEND_DIR)

for p in [PARENT_DIR, BACKEND_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.database import get_connection, init_db
    from backend.crud import insert_scheme, insert_future_opportunity, get_all_schemes, get_future_opportunities
    from backend.services.cleaner import clean_dataset, to_binary, parse_float
except ImportError:
    from database import get_connection, init_db
    from crud import insert_scheme, insert_future_opportunity, get_all_schemes, get_future_opportunities
    from services.cleaner import clean_dataset, to_binary, parse_float

def load_raw_csv(file_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Loads raw schemes dataset CSV safely."""
    if not file_path:
        file_path = os.path.join(BACKEND_DIR, "data", "raw_schemes.csv")

    if not os.path.exists(file_path):
        alt_path = os.path.join(BACKEND_DIR, "data", "raw_dataset.csv")
        if os.path.exists(alt_path):
            file_path = alt_path
        else:
            raise FileNotFoundError(f"Raw dataset CSV file not found at: {file_path}")

    print(f"[SeedData] Reading raw dataset from: {file_path}")
    raw_rows = []
    try:
        import pandas as pd
        df = pd.read_csv(file_path, encoding="utf-8-sig", dtype=str)
        raw_rows = df.to_dict(orient="records")
    except Exception:
        with open(file_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                raw_rows.append(dict(row))

    print(f"[SeedData] Loaded {len(raw_rows)} raw rows.")
    return raw_rows

def seed_cleaned_schemes(raw_file_path: Optional[str] = None) -> Tuple[int, int, int]:
    """Cleans dataset and seeds scheme records into SQLite schemes table while skipping duplicates."""
    if not raw_file_path:
        raw_file_path = os.path.join(BACKEND_DIR, "data", "raw_schemes.csv")
    cleaned_file_path = os.path.join(BACKEND_DIR, "data", "cleaned_schemes.csv")

    raw_rows = load_raw_csv(raw_file_path)
    cleaned_rows = clean_dataset(raw_file_path, cleaned_file_path)

    conn = get_connection()
    try:
        existing_schemes = get_all_schemes(conn=conn, limit=10000)
        existing_ids = {s.get("scheme_id") for s in existing_schemes if s.get("scheme_id")}

        inserted = 0
        skipped = 0

        for row in cleaned_rows:
            sid = row.get("scheme_id")
            if sid in existing_ids:
                skipped += 1
                continue

            insert_scheme(conn, row)
            existing_ids.add(sid)
            inserted += 1

        print(f"[SeedData] Rows loaded: {len(raw_rows)} | Rows cleaned: {len(cleaned_rows)} | Rows inserted: {inserted} | Duplicates skipped: {skipped}")
        return len(raw_rows), inserted, skipped
    finally:
        conn.close()

def seed_future_opportunities_if_available(conn=None) -> int:
    """Seeds initial future opportunity records into database if table is empty."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        existing_opps = get_future_opportunities(conn=conn)
        if len(existing_opps) > 0:
            print(f"[SeedData] Future opportunities already seeded ({len(existing_opps)} records exist).")
            return 0

        sample_opps = [
            {
                "scheme_name": "Pradhan Mantri Awas Yojana (Urban)",
                "missing_requirement": "Income Certificate below threshold",
                "missing_document": "Income Certificate & Revenue Land Certificate",
                "estimated_time": "2-3 weeks",
                "reason": "Family annual income documentation requires revenue office update.",
                "priority": "High"
            },
            {
                "scheme_name": "PM Kisan Samman Nidhi",
                "missing_requirement": "Land ownership record mutation",
                "missing_document": "Updated 7/12 Extract or RoR",
                "estimated_time": "1-2 weeks",
                "reason": "e-KYC and land record verification pending on portal.",
                "priority": "Medium"
            },
            {
                "scheme_name": "National Means-cum-Merit Scholarship",
                "missing_requirement": "Grade 8 academic mark sheet submission",
                "missing_document": "School Bonafide Certificate & Marksheet",
                "estimated_time": "1 week",
                "reason": "Requires school principal signature on eligibility form.",
                "priority": "Low"
            }
        ]

        inserted = 0
        for opp in sample_opps:
            insert_future_opportunity(conn, opp)
            inserted += 1

        print(f"[SeedData] Seeded {inserted} future opportunity records.")
        return inserted
    finally:
        if close_conn and conn:
            conn.close()

def main():
    """Main execution function for dataset seeding."""
    print("=== Starting Database Seeding Pipeline ===")
    init_db()

    loaded, inserted, skipped = seed_cleaned_schemes()
    opps = seed_future_opportunities_if_available()

    print("=== Database Seeding Complete ===")
    print(f"Summary -> Loaded: {loaded} | Inserted: {inserted} | Skipped: {skipped} | Opportunities: {opps}")

if __name__ == "__main__":
    main()
