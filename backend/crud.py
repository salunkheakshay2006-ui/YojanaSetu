import os
import sys
from typing import Any, Dict, List, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
for p in [PARENT_DIR, BASE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.database import get_connection
except ImportError:
    from database import get_connection

def _row_to_dict(row: Any) -> Optional[Dict[str, Any]]:
    """Convert SQLite row object to plain dictionary."""
    if row is None:
        return None
    if isinstance(row, dict):
        return dict(row)
    if hasattr(row, "keys"):
        return {key: row[key] for key in row.keys()}
    return dict(row)

def get_all_schemes(conn=None, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieve all schemes with pagination."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes LIMIT ? OFFSET ?", (limit, skip))
        rows = cursor.fetchall()
        return [_row_to_dict(r) for r in rows if r is not None]
    finally:
        if close_conn and conn:
            conn.close()

def get_scheme_by_id(scheme_id: str, conn=None) -> Optional[Dict[str, Any]]:
    """Retrieve a single scheme by scheme_id."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM schemes WHERE scheme_id = ?", (scheme_id,))
        row = cursor.fetchone()
        return _row_to_dict(row)
    finally:
        if close_conn and conn:
            conn.close()

def search_schemes(
    category: Optional[str] = None,
    state: Optional[str] = None,
    age: Optional[float] = None,
    income: Optional[float] = None,
    occupation: Optional[str] = None,
    education: Optional[str] = None,
    conn=None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Search schemes using filters."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        query = "SELECT * FROM schemes WHERE 1=1"
        params = []

        if category:
            query += " AND (category LIKE ? OR category IS NULL OR category = '')"
            params.append(f"%{category}%")

        if state:
            query += " AND (state LIKE ? OR state LIKE '%All India%' OR state LIKE '%All%' OR state IS NULL OR state = '')"
            params.append(f"%{state}%")

        if age is not None:
            query += " AND (age_min IS NULL OR age_min <= ?) AND (age_max IS NULL OR age_max = 0 OR age_max >= ?)"
            params.extend([age, age])

        if income is not None:
            query += " AND (income_limit IS NULL OR income_limit = 0 OR income_limit >= ?)"
            params.append(income)

        if occupation:
            query += " AND (occupation LIKE ? OR occupation LIKE '%General%' OR occupation LIKE '%All%' OR occupation IS NULL OR occupation = '')"
            params.append(f"%{occupation}%")

        if education:
            query += " AND (education LIKE ? OR education LIKE '%All%' OR education IS NULL OR education = '')"
            params.append(f"%{education}%")

        query += " LIMIT ?"
        params.append(limit)

        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [_row_to_dict(r) for r in rows if r is not None]
    finally:
        if close_conn and conn:
            conn.close()

def insert_scheme(conn, scheme_data: Dict[str, Any]) -> str:
    """Inserts a single scheme dictionary into the schemes table."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    columns = [
        "scheme_id", "scheme_name", "category", "state", "central_or_state",
        "benefit", "age_min", "age_max", "income_limit", "gender",
        "occupation", "education", "sc", "st", "obc", "ews", "general",
        "farmer", "student", "business", "disability", "widow", "minority",
        "required_documents", "official_link", "description", "eligibility_text",
        "missing_documents", "ai_tags"
    ]

    try:
        cursor = conn.cursor()
        placeholders = ", ".join(["?"] * len(columns))
        col_names = ", ".join(columns)
        values = [scheme_data.get(col) for col in columns]

        sql = f"INSERT OR REPLACE INTO schemes ({col_names}) VALUES ({placeholders})"
        cursor.execute(sql, values)
        conn.commit()
        return str(scheme_data.get("scheme_id", ""))
    finally:
        if close_conn and conn:
            conn.close()

def insert_future_opportunity(conn, opportunity_data: Dict[str, Any]) -> int:
    """Inserts a future opportunity dictionary into the future_opportunities table."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    columns = [
        "scheme_name", "missing_requirement", "missing_document",
        "estimated_time", "reason", "priority"
    ]

    try:
        cursor = conn.cursor()
        placeholders = ", ".join(["?"] * len(columns))
        col_names = ", ".join(columns)
        values = [opportunity_data.get(col) for col in columns]

        sql = f"INSERT INTO future_opportunities ({col_names}) VALUES ({placeholders})"
        cursor.execute(sql, values)
        conn.commit()
        return cursor.lastrowid or 0
    finally:
        if close_conn and conn:
            conn.close()

def get_future_opportunities(conn=None) -> List[Dict[str, Any]]:
    """Retrieve all future opportunities from database."""
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM future_opportunities")
        rows = cursor.fetchall()
        return [_row_to_dict(r) for r in rows if r is not None]
    finally:
        if close_conn and conn:
            conn.close()
