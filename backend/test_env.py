import fitz
import pytesseract
from PIL import Image
import os
from config import settings

print("Fitz version:", fitz.__version__)
print("Settings GROQ_API_KEY:", settings.GROQ_API_KEY[:8] + "..." if settings.GROQ_API_KEY else "Empty")

# Check if tesseract binary exists
try:
    print("Testing tesseract...")
    img = Image.new('RGB', (100, 30), color=(255, 255, 255))
    text = pytesseract.image_to_string(img)
    print("Pytesseract works! Result:", repr(text))
except Exception as e:
    print("Pytesseract error:", e)
