from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict

# 1. Scheme Schemas
class SchemeBase(BaseModel):
    scheme_id: str
    scheme_name: str
    category: Optional[str] = None
    state: Optional[str] = None
    central_or_state: Optional[str] = None
    benefit: Optional[str] = None
    age_min: Optional[float] = None
    age_max: Optional[float] = None
    income_limit: Optional[float] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    sc: int = 0
    st: int = 0
    obc: int = 0
    ews: int = 0
    general: int = 0
    farmer: int = 0
    student: int = 0
    business: int = 0
    disability: int = 0
    widow: int = 0
    minority: int = 0
    required_documents: Optional[str] = None
    official_link: Optional[str] = None
    description: Optional[str] = None
    eligibility_text: Optional[str] = None
    missing_documents: Optional[str] = None
    ai_tags: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SchemeResponse(SchemeBase):
    pass

# 2. Future Opportunity Schemas
class FutureOpportunityBase(BaseModel):
    scheme_name: str
    missing_requirement: Optional[str] = None
    missing_document: Optional[str] = None
    estimated_time: Optional[str] = None
    reason: Optional[str] = None
    priority: Optional[str] = "Medium"

    model_config = ConfigDict(from_attributes=True)

class FutureOpportunityResponse(FutureOpportunityBase):
    id: Optional[int] = None

# 3. Citizen Profile & Recommendation Request/Response
class CitizenProfileInput(BaseModel):
    age: Optional[float] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    income: Optional[float] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    category: Optional[str] = None
    farmer: int = 0
    student: int = 0
    business: int = 0
    disability: int = 0
    widow: int = 0
    minority: int = 0

class RecommendationRequest(BaseModel):
    profile: CitizenProfileInput
    preferred_categories: Optional[List[str]] = None
    keyword: Optional[str] = None

class RecommendationResponse(BaseModel):
    eligible_schemes: List[SchemeResponse] = []
    future_opportunities: List[FutureOpportunityResponse] = []
    recommended_bundle: Optional[List[SchemeResponse]] = None
    explanation: Optional[str] = ""
    confidence_score: Optional[float] = 0.0

# 4. Search Filter & Standard API Wrapper
class SearchFilterSchema(BaseModel):
    category: Optional[str] = None
    state: Optional[str] = None
    age: Optional[float] = None
    income: Optional[float] = None
    occupation: Optional[str] = None
    education: Optional[str] = None

class APIResponse(BaseModel):
    success: bool = True
    message: str = ""
    data: Any = None
