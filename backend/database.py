import os
import sys
import sqlite3
from typing import Optional

try:
    from sqlalchemy.orm import declarative_base
    Base = declarative_base()
except ImportError:
    Base = object

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "db")
DATABASE_PATH = os.path.join(DB_DIR, "government_schemes.db")

def get_connection() -> sqlite3.Connection:
    """
    Creates database directory if missing and returns a fresh SQLite connection
    configured with dict-like row access.
    """
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables(conn: Optional[sqlite3.Connection] = None):
    """
    Creates 'schemes' and 'future_opportunities' SQLite tables if they do not exist,
    using consistent lowercase column names.
    """
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        cursor = conn.cursor()

        # Create main schemes table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS schemes (
            scheme_id TEXT PRIMARY KEY,
            scheme_name TEXT NOT NULL,
            category TEXT,
            state TEXT,
            central_or_state TEXT,
            benefit TEXT,
            age_min REAL DEFAULT 0.0,
            age_max REAL DEFAULT 100.0,
            income_limit REAL,
            gender TEXT,
            occupation TEXT,
            education TEXT,
            sc INTEGER DEFAULT 0,
            st INTEGER DEFAULT 0,
            obc INTEGER DEFAULT 0,
            ews INTEGER DEFAULT 0,
            general INTEGER DEFAULT 0,
            farmer INTEGER DEFAULT 0,
            student INTEGER DEFAULT 0,
            business INTEGER DEFAULT 0,
            disability INTEGER DEFAULT 0,
            widow INTEGER DEFAULT 0,
            minority INTEGER DEFAULT 0,
            required_documents TEXT,
            official_link TEXT,
            description TEXT,
            eligibility_text TEXT,
            missing_documents TEXT,
            ai_tags TEXT
        );
        """)

        # Create future_opportunities table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS future_opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scheme_name TEXT NOT NULL,
            missing_requirement TEXT,
            missing_document TEXT,
            estimated_time TEXT,
            reason TEXT,
            priority TEXT DEFAULT 'Medium'
        );
        """)

        conn.commit()
    finally:
        if close_conn and conn:
            conn.close()

def init_db():
    """Initializes the database schema."""
    conn = get_connection()
    try:
        create_tables(conn)
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized at:", DATABASE_PATH)
