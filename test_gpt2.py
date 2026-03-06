import requests
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
headers = {"Authorization": f"Bearer {API_KEY}"}
# Check gpt2 on old API
url = "https://api-inference.huggingface.co/models/gpt2"

print(f"Scanning: {url}")
try:
    response = requests.post(url, headers=headers, json={"inputs": "Hello world"}, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
