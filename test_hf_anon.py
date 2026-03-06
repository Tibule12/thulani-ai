import requests
import os

# API_KEY = "hf_ya..." 
# headers = {"Authorization": f"Bearer {API_KEY}"}
headers = {} # Anonymous

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"

print(f"Testing API ANONYMOUSLY: {API_URL}")
print("Sending request...")

try:
    response = requests.post(API_URL, headers=headers, json={"inputs": "A futuristic city with flying cars"}, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(response.text)

except Exception as e:
    print(f"Exception: {e}")
