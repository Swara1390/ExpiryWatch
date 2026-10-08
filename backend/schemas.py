from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True

class DocumentBase(BaseModel):
    document_type: str
    expiry_date: date

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    expiry_date: Optional[date] = None

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    days_remaining: Optional[int] = None

    class Config:
        orm_mode = True

class ExtractionResult(BaseModel):
    document_type: str
    expiry_date: Optional[date] = None
