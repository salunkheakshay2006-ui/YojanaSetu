"""
One-time import script: loads all 20 schemes from schemes.csv into PostgreSQL.

Run from the backend/ directory:
    python data/import_schemes.py

Safety rules:
- Skips any scheme whose name already exists in the database (no duplicates).
- Never modifies the citizens table or any other table.
- Never guesses eligibility values -- only stores what the CSV explicitly provides.
- All unstructured eligibility fields are left at their safe defaults (NULL / "any").
"""

import csv
import os
import sys
import uuid

# Allow imports of database.py and models/ when run from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database import SessionLocal

CSV_PATH = os.path.join(os.path.dirname(__file__), "schemes.csv")

INSERT_SQL = text("""
    INSERT INTO schemes (
        id, name, description, benefit, source_url,
        category, scope, source, last_verified, documents_summary,
        gender, caste_eligibility, occupation, state,
        is_student_required, is_farmer_required, is_disabled_required,
        min_age, max_age, min_income, max_income, documents_required
    ) VALUES (
        :id, :name, :description, :benefit, :source_url,
        :category, :scope, :source, :last_verified, :documents_summary,
        :gender, :caste_eligibility, :occupation, :state,
        :is_student_required, :is_farmer_required, :is_disabled_required,
        :min_age, :max_age, :min_income, :max_income, :documents_required
    )
""")


def import_schemes() -> None:
    """Read the CSV and insert each scheme, skipping duplicates by name."""

    if not os.path.exists(CSV_PATH):
        print(f"ERROR: CSV not found at {CSV_PATH}")
        sys.exit(1)

    with open(CSV_PATH, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if r.get("scheme_name", "").strip()]

    print(f"CSV rows found: {len(rows)}")
    print()

    inserted = 0
    skipped = 0

    with SessionLocal() as db:
        for row in rows:
            name = row["scheme_name"].strip()

            already_exists = db.execute(
                text("SELECT 1 FROM schemes WHERE name = :name"),
                {"name": name},
            ).first()

            if already_exists:
                print(f"  SKIP  (already in DB): {name}")
                skipped += 1
                continue

            db.execute(INSERT_SQL, {
                # --- Fields directly from CSV ---
                "id":                   str(uuid.uuid4()),
                "name":                 name,
                "description":          row["eligibility_summary"].strip(),
                "benefit":              row["benefit_summary"].strip(),
                "source_url":           row["official_myscheme_url"].strip(),
                "category":             row["category"].strip(),
                "scope":                row["scope"].strip(),
                "source":               row["source"].strip(),
                "last_verified":        row["last_verified"].strip(),
                "documents_summary":    row["documents_summary"].strip(),
                # --- Eligibility fields: safe defaults only, never guessed ---
                "gender":               "any",
                "caste_eligibility":    "any",
                "occupation":           "any",
                "state":                "all",
                "is_student_required":  False,
                "is_farmer_required":   False,
                "is_disabled_required": False,
                "min_age":              None,
                "max_age":              None,
                "min_income":           None,
                "max_income":           None,
                "documents_required":   None,
            })

            print(f"  INSERT: {name}")
            inserted += 1

        db.commit()

    print()
    print(f"Result  =>  Inserted: {inserted}  |  Skipped: {skipped}")
    print()

    # Verification
    with SessionLocal() as db:
        total = db.execute(text("SELECT COUNT(*) FROM schemes")).scalar()
        print(f"SELECT COUNT(*) FROM schemes  =>  {total}")
        if total == 20:
            print("PASS: exactly 20 schemes in the database.")
        else:
            print(f"WARNING: expected 20, got {total}.")


if __name__ == "__main__":
    import_schemes()
