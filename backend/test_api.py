import sys
import os

# Ensure hack and backend directories are in Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
for p in [PARENT_DIR, BASE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.database import DATABASE_PATH, init_db, get_connection
    from backend.main import app, health_check, list_schemes, get_scheme, search_schemes_endpoint, recommend_endpoint, list_future_opportunities
    from backend.schemas import CitizenProfileInput
except ImportError:
    from database import DATABASE_PATH, init_db, get_connection
    from main import app, health_check, list_schemes, get_scheme, search_schemes_endpoint, recommend_endpoint, list_future_opportunities
    from schemas import CitizenProfileInput

def test_imports_and_database():
    print("[Test 1/6] Verifying app imports and database initialization...")
    assert app is not None, "FastAPI app failed to import"
    init_db()
    assert os.path.exists(DATABASE_PATH), f"Database file not found at {DATABASE_PATH}"
    print(" -> Success: App imported and database initialized at", DATABASE_PATH)

def test_health_endpoint():
    print("[Test 2/6] Verifying /api/health endpoint...")
    res = health_check()
    assert res.success is True, "Health check failed"
    assert res.data["status"] == "active"
    print(" -> Success: /api/health is healthy.")

def test_list_schemes_endpoint():
    print("[Test 3/6] Verifying /api/schemes endpoint...")
    res = list_schemes(skip=0, limit=10)
    assert res.success is True, "List schemes failed"
    assert len(res.data) > 0, "No schemes returned"
    print(f" -> Success: /api/schemes returned {len(res.data)} schemes.")

def test_search_schemes_endpoint():
    print("[Test 4/6] Verifying /api/schemes/search endpoint...")
    res = search_schemes_endpoint(category="Agriculture")
    assert res.success is True, "Search schemes failed"
    assert isinstance(res.data, list)
    print(f" -> Success: /api/schemes/search returned {len(res.data)} results.")

def test_future_opportunities_endpoint():
    print("[Test 5/6] Verifying /api/future-opportunities endpoint...")
    res = list_future_opportunities()
    assert res.success is True, "Future opportunities failed"
    assert isinstance(res.data, list)
    print(f" -> Success: /api/future-opportunities returned {len(res.data)} records.")

def test_recommend_endpoint():
    print("[Test 6/6] Verifying /api/recommend endpoint...")
    profile = CitizenProfileInput(age=25, gender="Female", state="Maharashtra", income=150000, student=1)
    res = recommend_endpoint(profile)
    assert res.success is True, "Recommend endpoint failed"
    assert "eligible_schemes" in res.data
    assert "confidence_score" in res.data
    print(f" -> Success: /api/recommend returned {len(res.data['eligible_schemes'])} eligible schemes. Confidence score: {res.data['confidence_score']}")

if __name__ == "__main__":
    print("=== Running Backend Verification Tests ===")
    test_imports_and_database()
    test_health_endpoint()
    test_list_schemes_endpoint()
    test_search_schemes_endpoint()
    test_future_opportunities_endpoint()
    test_recommend_endpoint()
    print("\n=== ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! ===")
