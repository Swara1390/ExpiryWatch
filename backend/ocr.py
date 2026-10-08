import json
import base64
import io
from groq import Groq
from config import settings
from datetime import datetime
from PIL import Image
import fitz  # PyMuPDF

groq_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

def get_image_base64(file_bytes: bytes, filename: str) -> str:
    """Converts the uploaded file (PDF or Image) to a JPEG base64 string for Groq Vision."""
    try:
        if filename.lower().endswith('.pdf'):
            doc = fitz.open("pdf", file_bytes)
            if len(doc) == 0:
                return None
            page = doc[0]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Better resolution
            img_bytes = pix.tobytes("jpeg")
            return base64.b64encode(img_bytes).decode('utf-8')
        else:
            # Convert to RGB JPEG to ensure compatibility
            image = Image.open(io.BytesIO(file_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"Error converting to image: {e}")
        return None

def extract_expiry_info_vision(file_bytes: bytes, filename: str):
    doc_type = "Unknown"
    date_str = None
    
    if not groq_client:
        raise ValueError("GROQ_API_KEY is not configured in the backend .env file. Please add it for AI extraction to work.")
        
    base64_image = get_image_base64(file_bytes, filename)
    if not base64_image:
        print("Could not process image for vision API.")
        return {"document_type": doc_type, "expiry_date": date_str}
        
    prompt = """
    Analyze this document image. 
    1. Identify the Document Name (e.g., Driving License, Passport, Insurance, Certificate, Contract, or Unknown).
    2. Find the Expiry Date (or 'Valid Until', 'Valid Upto' date). 
    
    Return ONLY a JSON object with keys 'document_type' and 'expiry_date'.
    The 'expiry_date' MUST be in YYYY-MM-DD format. If no expiry date is found, return null.
    If you cannot confidently identify the document type, return "Unknown".
    """
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            model="llama-3.2-11b-vision-preview",
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        result_content = chat_completion.choices[0].message.content
        result = json.loads(result_content)
        
        doc_type = result.get('document_type', 'Unknown')
        extracted_date = result.get('expiry_date')
        
        # Verify date format
        if extracted_date:
            try:
                datetime.strptime(extracted_date, "%Y-%m-%d")
                date_str = extracted_date
            except ValueError:
                date_str = None
                
    except Exception as e:
        print(f"Groq Vision API error: {e}")

    return {
        "document_type": doc_type,
        "expiry_date": date_str
    }
