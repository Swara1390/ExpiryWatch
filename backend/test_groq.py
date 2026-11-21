import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("Error: GROQ_API_KEY is not set in backend/.env!")
    exit(1)

client = Groq(api_key=api_key)

try:
    models = client.models.list()
    print("All Models:", [m.id for m in models.data])
except Exception as e:
    print("Groq test error:", e)

