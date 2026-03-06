from huggingface_hub import InferenceClient
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
MODEL = "prompthero/openjourney"

print(f"Testing with huggingface_hub library using model: {MODEL}")

try:
    # Try anonymous first
    client = InferenceClient() # No token
    # OR if you want to test specifically without:
    # client = InferenceClient(token=False) 
    print("Testing anonymously...")
    image = client.text_to_image("A futuristic city", model=MODEL)
    print("SUCCESS!")
    image.save("test_hub_image.jpg")
    print("Saved test_hub_image.jpg")
except Exception as e:
    print(f"Error: {e}")
