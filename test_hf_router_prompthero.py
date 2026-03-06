import requests
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
headers = {"Authorization": f"Bearer {API_KEY}"}

urls_to_test = [
    "https://router.huggingface.co/hf-inference/models/prompthero/openjourney",
    "https://router.huggingface.co/models/prompthero/openjourney",
    "https://router.huggingface.co/v1/models/prompthero/openjourney"
]

for url in urls_to_test:
    print(f"\nScanning: {url}")
    try:
        response = requests.post(url, headers=headers, json={"inputs": "A futuristic city with flying cars"}, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS! Endpoint found.")
            break
        else:
            print(f"Failed: {response.text[:100]}")
    except Exception as e:
        print(f"Error: {e}")
