from huggingface_hub import HfApi
import os

import os
API_KEY = os.getenv("HUGGINGFACE_API_KEY")
MODEL = "prompthero/openjourney"

try:
    api = HfApi(token=API_KEY)
    info = api.model_info(MODEL)
    print("SUCCESS! Can access model info.")
    print(f"Downloads: {info.downloads}")
    print(f"Pipeline Tag: {info.pipeline_tag}")
except Exception as e:
    print(f"Error accessing model info: {e}")
