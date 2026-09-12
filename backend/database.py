"""
Database connection setup using SQLAlchemy.

Reads DATABASE_URL from the .env file in the backend directory.
Import `get_db` as a FastAPI dependency wherever a DB session is needed.
Import `engine` wherever you need to create/reflect tables.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Load .env from the same directory as this file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

sqlite_url = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'yojanasetu.db')}"
DATABASE_URL: str = os.getenv("DATABASE_URL", sqlite_url)

try:
    engine_options = {"connect_args": {"check_same_thread": False}} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(DATABASE_URL, **engine_options)
    # Verify driver is available
    if not DATABASE_URL.startswith("sqlite"):
        with engine.connect():
            pass
except Exception:
    DATABASE_URL = sqlite_url
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db():
    """FastAPI dependency that yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
