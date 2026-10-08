import bcrypt
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import secrets
import datetime

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_session(db: Session, user_id: int):
    session_id = secrets.token_urlsafe(32)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    db_session = models.Session(id=session_id, user_id=user_id, expires_at=expires_at)
    db.add(db_session)
    db.commit()
    return session_id

def get_current_user(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not db_session or db_session.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")
    
    user = db.query(models.User).filter(models.User.id == db_session.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return user
