import requests
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
headers = {"Authorization": f"Bearer {API_KEY}"}

url = "https://router.huggingface.co/models/prompthero/openjourney"

print(f"Scanning: {url}")
try:
    response = requests.post(url, headers=headers, json={"inputs": "A futuristic city with flying cars"}, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
