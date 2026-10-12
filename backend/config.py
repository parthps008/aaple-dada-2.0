import os
import json
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "आपला दादा तक्रार निवारण पोर्टल"
    APP_SUBTITLE: str = "लोकनेते मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय, विटा-खानापूर"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aapla-dada-production-secret-2026")
    
    # Official Administrator Credentials
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "dada@123")
    ADMIN_NAME: str = "मा. वैभव दादा पाटील जनसंपर्क कार्यालय (विटा)"
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "office.vaibhavdada@gmail.com")
    
    # SMTP Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "office.vaibhavdada@gmail.com")
    SMTP_FROM_NAME: str = "आपला दादा जनसंपर्क कक्ष (विटा-खानापूर)"
    OFFICE_NOTIFICATION_EMAIL: str = os.getenv("OFFICE_NOTIFICATION_EMAIL", "office.vaibhavdada@gmail.com")
    
    # Render & Deployment Server Settings
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    BASE_URL: str = os.getenv("PORTAL_URL", os.getenv("RENDER_EXTERNAL_URL", "http://localhost:8000"))

    # Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOADS_DIR: str = os.path.join(BASE_DIR, "uploads")
    ASSETS_DIR: str = os.path.join(BASE_DIR, "assets")
    DB_PATH: str = os.path.join(BASE_DIR, "aapla_dada.db")
    
    # Firebase Cloud Firestore Settings (Ensures persistence on Render sleep/restarts)
    FIREBASE_CREDENTIALS_JSON: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_JSON", "")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", os.path.join(BASE_DIR, "firebase_credentials.json"))
    FIREBASE_PROJECT_ID: Optional[str] = os.getenv("FIREBASE_PROJECT_ID", "")

settings = Settings()
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.ASSETS_DIR, exist_ok=True)
