from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date
import uuid

import models, schemas, auth, ocr, tasks
from database import engine, get_db, Base
from config import settings

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ExpiryWatch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    tasks.start_scheduler()
    tasks.check_expiries()

@app.post("/api/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login")
def login(user: schemas.UserCreate, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    session_id = auth.create_session(db, db_user.id)
    response.set_cookie(
        key="session_id", 
        value=session_id, 
        httponly=True, 
        samesite="lax",
        secure=False,
        max_age=7*24*3600
    )
    return {"message": "Logged in successfully"}

@app.post("/api/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if session_id:
        db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
        if db_session:
            db.delete(db_session)
            db.commit()
    response.delete_cookie("session_id")
    return {"message": "Logged out successfully"}

@app.get("/api/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/api/extract", response_model=schemas.ExtractionResult)
async def extract_document(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and images are allowed.")
    
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB.")

    try:
        result = ocr.extract_expiry_info_vision(file_bytes, file.filename)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    
    expiry_dt = None
    if result["expiry_date"]:
        try:
            expiry_dt = datetime.strptime(result["expiry_date"], "%Y-%m-%d").date()
        except ValueError:
            pass

    return schemas.ExtractionResult(
        document_type=result["document_type"],
        expiry_date=expiry_dt
    )

@app.post("/api/documents", response_model=schemas.DocumentResponse)
def create_document(doc: schemas.DocumentCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    days_remaining = (doc.expiry_date - date.today()).days
    if days_remaining < 0:
        status = "Expired"
    elif days_remaining <= 7:
        status = "Urgent"
    elif days_remaining <= 30:
        status = "Upcoming"
    else:
        status = "Safe"

    new_doc = models.Document(
        user_id=current_user.id,
        document_type=doc.document_type,
        expiry_date=doc.expiry_date,
        status=status
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return schemas.DocumentResponse(
        id=new_doc.id,
        document_type=new_doc.document_type,
        expiry_date=new_doc.expiry_date,
        user_id=new_doc.user_id,
        status=new_doc.status,
        created_at=new_doc.created_at,
        days_remaining=days_remaining
    )

@app.get("/api/documents", response_model=list[schemas.DocumentResponse])
def get_documents(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    docs = db.query(models.Document).filter(models.Document.user_id == current_user.id).all()
    today = date.today()
    result = []
    for d in docs:
        d_resp = schemas.DocumentResponse(
            id=d.id,
            document_type=d.document_type,
            expiry_date=d.expiry_date,
            user_id=d.user_id,
            status=d.status,
            created_at=d.created_at,
            days_remaining=(d.expiry_date - today).days
        )
        result.append(d_resp)
    return result

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id, models.Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}
