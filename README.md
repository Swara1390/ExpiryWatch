# ExpiryWatch

A college mini-project for automated document expiry tracking and notification.

## Features
- User Authentication (Login / Sign Up)
- Session-based authorization
- File upload (PDF, JPG, PNG)
- OCR text extraction via Tesseract
- Automated date and document type extraction (Regex + Groq AI fallback)
- User verification layer before storing data
- Privacy-first: Uploaded files and raw OCR texts are NOT stored permanently
- Dashboard for tracking documents (Safe, Upcoming, Urgent, Expired)
- Background email notifications (90, 30, 7, 1 days remaining)

## Tech Stack
**Frontend:** React, Vite, TailwindCSS, Axios
**Backend:** FastAPI, SQLite (WAL mode), SQLAlchemy, APScheduler
**AI / OCR:** Tesseract OCR, Groq API (LLaMA3)
**Other:** PyMuPDF, pdf2image

## Setup Instructions

### Prerequisites
1. **Python 3.10+**
2. **Node.js 20+**
3. **Tesseract OCR:** Must be installed on your machine.
   - **Windows:** Download the installer from UB-Mannheim's Github and install it to `C:\Program Files\Tesseract-OCR\tesseract.exe`.
   - **Linux:** `sudo apt-get install tesseract-ocr`
   - **Mac:** `brew install tesseract`

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # source venv/bin/activate # Linux/Mac
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your `GROQ_API_KEY` (optional, for AI fallback), and `SMTP_EMAIL` / `SMTP_APP_PASSWORD` for email notifications (use Gmail App Password).

5. Start the backend:
   ```bash
   uvicorn main:app --reload
   ```
   *The API will be available at http://127.0.0.1:8000*

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at http://localhost:5173*

## Security & Privacy Decisions
- Uploaded files are processed in-memory. They are not stored to disk permanently.
- Passwords are encrypted using `bcrypt`.
- Authentication uses secure HTTP-only (in prod) session cookies, managed manually via a SQLite Sessions table rather than complex JWT tokens.
- SQLite is configured in WAL mode to allow concurrent operations.
- Backend background scheduler checks for expiry every 24 hours. Emails are only sent if configured.

## Troubleshooting
- **File Upload Error:** Check that the file size is under 10MB and is a valid image or PDF.
- **Tesseract Error:** Ensure Tesseract is installed and the executable path is correct in `backend/ocr.py`.
- **Emails not sending:** Make sure you use a Google "App Password", not your normal login password.

