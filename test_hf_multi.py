import requests
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
headers = {"Authorization": f"Bearer {API_KEY}"}

urls_to_test = [
    "https://router.huggingface.co/v1/models/stabilityai/stable-diffusion-2-1",
    "https://router.huggingface.co/stabilityai/stable-diffusion-2-1",
    "https://api-inference.huggingface.co/models/prompthero/openjourney",
    "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5" 
]

for url in urls_to_test:
    print(f"\nScanning: {url}")
    try:
        response = requests.post(url, headers=headers, json={"inputs": "A futuristic city with flying cars"}, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS!")
            # Save it to check if it's actually an image
            with open("test_image.jpg", "wb") as f:
                f.write(response.content)
            print("Saved test_image.jpg")
            break
        else:
            print(f"Failed: {response.text[:100]}")
    except Exception as e:
        print(f"Error: {e}")
