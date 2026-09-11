import sys, os

# -- Step 1: Load DATABASE_URL from .env --------------------------------------
from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), '.env'))
url = os.environ.get('DATABASE_URL', '')
if not url:
    print('FAIL [1] DATABASE_URL not found in .env')
    sys.exit(1)
at = url.rindex('@')
masked = url[:url.index('://')+3] + '***' + url[at:]
print('PASS [1] DATABASE_URL loaded ->', masked)

# -- Step 2: SQLAlchemy connection ---------------------------------------------
from sqlalchemy import create_engine, text
try:
    engine = create_engine(url)
    with engine.connect() as conn:
        ver = conn.execute(text('SELECT version()')).scalar()
    print('PASS [2] Connected ->', ver[:70])
except Exception as e:
    print('FAIL [2] Connection error:', e)
    sys.exit(1)

# -- Step 3: Create table and verify ------------------------------------------
sys.path.insert(0, '.')
try:
    from database import Base
    import models.citizen_orm          # registers CitizenTable with Base
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        exists = conn.execute(
            text("SELECT to_regclass('public.citizens')")
        ).scalar()

    if exists:
        print('PASS [3] Table citizens exists in database')
    else:
        print('FAIL [3] Table was NOT created')
        sys.exit(1)

    with engine.connect() as conn:
        cols = conn.execute(text(
            "SELECT column_name, data_type "
            "FROM information_schema.columns "
            "WHERE table_name = 'citizens' "
            "ORDER BY ordinal_position"
        )).fetchall()
    print('  Columns:')
    for col_name, col_type in cols:
        print(f'    {col_name:<15} {col_type}')

except Exception as e:
    print('FAIL [3] Table error:', e)
    sys.exit(1)

print()
print('All checks passed.')
