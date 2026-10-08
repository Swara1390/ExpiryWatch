import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from apscheduler.schedulers.background import BackgroundScheduler
from config import settings
from database import SessionLocal
from models import Document, User
import datetime

def send_email(to_email: str, subject: str, body: str):
    if not settings.SMTP_EMAIL or not settings.SMTP_APP_PASSWORD:
        print("Email credentials not configured. Skipping email.")
        return

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(settings.SMTP_EMAIL, settings.SMTP_APP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_EMAIL, to_email, text)
        server.quit()
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

def check_expiries():
    db = SessionLocal()
    try:
        today = datetime.date.today()
        documents = db.query(Document).all()
        
        for doc in documents:
            days_remaining = (doc.expiry_date - today).days
            user = db.query(User).filter(User.id == doc.user_id).first()
            if not user:
                continue

            if days_remaining < 0:
                doc.status = "Expired"
            elif days_remaining <= 7:
                doc.status = "Urgent"
            elif days_remaining <= 30:
                doc.status = "Upcoming"
            else:
                doc.status = "Safe"
            
            if days_remaining <= 90 and not doc.notified_90:
                send_email(user.email, f"ExpiryWatch: {doc.document_type} expires in {days_remaining} days", f"Your {doc.document_type} will expire on {doc.expiry_date}. Please prepare for renewal.")
                doc.notified_90 = True
            
            if days_remaining <= 30 and not doc.notified_30:
                send_email(user.email, f"Reminder: {doc.document_type} expires in {days_remaining} days", f"Your {doc.document_type} will expire on {doc.expiry_date}.")
                doc.notified_30 = True
                
            if days_remaining <= 7 and not doc.notified_7:
                send_email(user.email, f"URGENT: {doc.document_type} expires in {days_remaining} days", f"Your {doc.document_type} is expiring very soon ({doc.expiry_date}).")
                doc.notified_7 = True
                
            if days_remaining == 1 and not doc.notified_1:
                send_email(user.email, f"CRITICAL: {doc.document_type} expires TOMORROW", f"Your {doc.document_type} expires tomorrow on {doc.expiry_date}.")
                doc.notified_1 = True

        db.commit()
    except Exception as e:
        print(f"Error in scheduler task: {e}")
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(check_expiries, 'interval', hours=24)

def start_scheduler():
    scheduler.start()
