"""
Documents Router -- Protected citizen document checklist & custom documents API.

Endpoints:
  GET  /api/documents     Get authenticated caller's available and custom documents
  POST /api/documents     Save/update authenticated caller's available and custom documents

Security:
  Strictly requires Supabase JWT (Bearer <token>).
  User identity resolved exclusively via services.auth.get_current_user_required.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from services.auth import get_current_user_required
from store import documents_store

router = APIRouter(prefix="/api")


class DocumentsRequest(BaseModel):
    available_docs: List[str] = Field(default_factory=list)
    custom_docs: List[str] = Field(default_factory=list)


@router.get("/documents")
def getDocuments(current_user: dict = Depends(get_current_user_required)):
    """Return personal document availability and custom documents for caller."""
    user_id = current_user["id"]
    doc_data = documents_store.get_user_documents(user_id)

    return {
        "success": True,
        "message": f"Retrieved {len(doc_data['available_docs'])} available documents.",
        "data": doc_data,
    }


@router.post("/documents")
def saveDocuments(
    body: DocumentsRequest,
    current_user: dict = Depends(get_current_user_required),
):
    """Save or update available and custom documents for the authenticated caller."""
    user_id = current_user["id"]

    # Sanitize and deduplicate strings
    clean_avail = [str(d).strip() for d in body.available_docs if str(d).strip()]
    clean_custom = [str(d).strip() for d in body.custom_docs if str(d).strip()]

    # Deduplicate while preserving order
    clean_avail = list(dict.fromkeys(clean_avail))
    clean_custom = list(dict.fromkeys(clean_custom))

    saved = documents_store.save_user_documents(user_id, clean_avail, clean_custom)

    return {
        "success": True,
        "message": f"Saved {len(saved['available_docs'])} available documents and {len(saved['custom_docs'])} custom documents.",
        "data": saved,
    }
