import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
    SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD", "")
    APP_SECRET_KEY = os.getenv("APP_SECRET_KEY", "super-secret-default-key")
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

settings = Settings()
