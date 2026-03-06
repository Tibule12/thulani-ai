import requests
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
headers = {"Authorization": f"Bearer {API_KEY}"}
API_URL = "https://router.huggingface.co/hf-inferenceerence/models/stabilityai/stable-diffusion-2-1"

print(f"Testing API: {API_URL}")
print("Sending request...")

try:
    response = requests.post(API_URL, headers=headers, json={"inputs": "A futuristic city with flying cars"}, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("Success! Image generated.")
        print(f"Content Type: {response.headers.get('content-type')}")
        print(f"Content Length: {len(response.content)} bytes")
    else:
        print("Failed.")
        print(response.text)

except Exception as e:
    print(f"Exception: {e}")
