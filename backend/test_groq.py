from groq import Groq

test_key = "your_groq_api_key_here"
client = Groq(api_key=test_key)

try:
    models = client.models.list()
    print("All Models:", [m.id for m in models.data])
except Exception as e:
    print("Groq test error:", e)
