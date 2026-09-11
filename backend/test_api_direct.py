import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
for p in [PARENT_DIR, BASE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.database import get_connection, init_db, DATABASE_PATH
    from backend.main import health_check, list_schemes, get_scheme, search_schemes_endpoint, recommend_endpoint, list_future_opportunities
    from backend.schemas import CitizenProfileInput
except ImportError:
    from database import get_connection, init_db, DATABASE_PATH
    from main import health_check, list_schemes, get_scheme, search_schemes_endpoint, recommend_endpoint, list_future_opportunities
    from schemas import CitizenProfileInput

def run_direct_tests():
    print("=== Direct Backend Integration Test Suite ===")

    # Step 1: Database Check
    init_db()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM schemes")
    schemes_count = cur.fetchone()[0]
    conn.close()
    print(f"1. Database connected! Total schemes in DB: {schemes_count}")
    assert os.path.exists(DATABASE_PATH), "Database file path check failed"

    # Step 2: Health Check Route
    res_health = health_check()
    print("2. Health Check status:", res_health.success, "| Service:", res_health.data.get("service"))
    assert res_health.success is True

    # Step 3: Schemes List Route
    res_list = list_schemes(skip=0, limit=5)
    print(f"3. List Schemes status: {res_list.success} | Retrieved: {len(res_list.data)} items")
    assert res_list.success is True
    assert len(res_list.data) > 0

    first_scheme_id = res_list.data[0]["scheme_id"]

    # Step 4: Single Scheme Route
    res_get = get_scheme(scheme_id=first_scheme_id)
    print(f"4. Get Scheme ('{first_scheme_id}') status: {res_get.success} | Name: '{res_get.data.get('scheme_name')}'")
    assert res_get.success is True
    assert res_get.data["scheme_id"] == first_scheme_id

    # Step 5: Search Route
    res_search = search_schemes_endpoint(category="Agriculture")
    print(f"5. Search Schemes status: {res_search.success} | Found: {len(res_search.data)} items")
    assert res_search.success is True

    # Step 6: Recommend Route
    profile = CitizenProfileInput(age=28, gender="Female", state="Maharashtra", income=180000, farmer=1)
    res_rec = recommend_endpoint(profile)
    print(f"6. Recommend Schemes status: {res_rec.success} | Eligible: {len(res_rec.data.get('eligible_schemes', []))}")
    assert res_rec.success is True

    print("\n=== ALL DIRECT INTEGRATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_direct_tests()
