from huggingface_hub import HfApi
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")

print(f"Testing token: {API_KEY}")

try:
    api = HfApi(token=API_KEY)
    user = api.whoami()
    print("SUCCESS! Token is valid.")
    print(user)
except Exception as e:
    print(f"Error: {e}")
