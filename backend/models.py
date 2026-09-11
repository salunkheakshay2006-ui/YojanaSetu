import os
import sys
from sqlalchemy import Column, Float, Integer, String, Text

# Ensure parent directory path safety for relative module imports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

try:
    from backend.database import Base
except ImportError:
    from database import Base

class Scheme(Base):
    """
    SQLAlchemy ORM model representing government schemes in the 'schemes' table.
    Uses exact lowercase attribute names matching database.py schema.
    """
    __tablename__ = "schemes"

    scheme_id = Column(String(50), primary_key=True, index=True)
    scheme_name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), index=True, nullable=True)
    state = Column(String(100), index=True, nullable=True)
    central_or_state = Column(String(50), index=True, nullable=True)
    benefit = Column(Text, nullable=True)
    age_min = Column(Float, nullable=True, default=0.0)
    age_max = Column(Float, nullable=True, default=100.0)
    income_limit = Column(Float, nullable=True)
    gender = Column(String(50), index=True, nullable=True)
    occupation = Column(String(100), index=True, nullable=True)
    education = Column(String(100), index=True, nullable=True)
    sc = Column(Integer, default=0)
    st = Column(Integer, default=0)
    obc = Column(Integer, default=0)
    ews = Column(Integer, default=0)
    general = Column(Integer, default=0)
    farmer = Column(Integer, default=0)
    student = Column(Integer, default=0)
    business = Column(Integer, default=0)
    disability = Column(Integer, default=0)
    widow = Column(Integer, default=0)
    minority = Column(Integer, default=0)
    required_documents = Column(Text, nullable=True)
    official_link = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    eligibility_text = Column(Text, nullable=True)
    missing_documents = Column(Text, nullable=True)
    ai_tags = Column(Text, nullable=True)

    def to_dict(self):
        """Helper method to convert model instance to dictionary."""
        return {col.name: getattr(self, col.name) for col in self.__table__.columns}


class FutureOpportunity(Base):
    """
    SQLAlchemy ORM model representing future opportunities for tracking applicant scheme gaps.
    """
    __tablename__ = "future_opportunities"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    scheme_name = Column(String(255), nullable=False)
    missing_requirement = Column(Text, nullable=True)
    missing_document = Column(Text, nullable=True)
    estimated_time = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    priority = Column(String(50), default="Medium")

    def to_dict(self):
        """Helper method to convert model instance to dictionary."""
        return {col.name: getattr(self, col.name) for col in self.__table__.columns}

