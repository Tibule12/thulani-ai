from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import base64
import os
import traceback
# Try to import InferenceClient, fallback if not available (should be added to requirements)
try:
    from huggingface_hub import InferenceClient
except ImportError:
    InferenceClient = None

router = APIRouter()

class ImageRequest(BaseModel):
    prompt: str

class ImageResponse(BaseModel):
    url: str

@router.post("/generate", response_model=ImageResponse)
async def generate_image(request: ImageRequest):
    print(f"Generating image for prompt: {request.prompt}")
    
    # Check for API Key
    api_key = os.environ.get("HUGGINGFACE_API_KEY")
    if not api_key:
        print("Error: HUGGINGFACE_API_KEY not found in environment variables")
        raise HTTPException(status_code=500, detail="Server configuration error: Image API Key missing.")

    # List of models to try
    models = [
        "prompthero/openjourney",        # Often reliable
        "stabilityai/stable-diffusion-2-1", 
        "runwayml/stable-diffusion-v1-5"
    ]

    last_error = None

    # Method 1: Use hugggingface_hub InferenceClient (Preferred)
    if InferenceClient:
        print("Using InferenceClient...")
        client = InferenceClient(token=api_key)
        
        for model in models:
            print(f"Trying model: {model}")
            try:
                # Direct generation to PIL Image
                image = client.text_to_image(request.prompt, model=model)
                
                # Convert PIL Image to Base64
                import io
                buffered = io.BytesIO()
                image.save(buffered, format="JPEG")
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                return {"url": f"data:image/jpeg;base64,{img_str}"}
                
            except Exception as e:
                print(f"InferenceClient failed for {model}: {e}")
                last_error = e
                # Continue to next model

    # Method 2: Fallback to requests if InferenceClient fails (or is missing)
    # Note: requests to api-inference.huggingface.co are mostly deprecated (410 Gone),
    # but we keep this as a backup if a new URL is found or if InferenceClient wasn't installed.
    # We try to construct a router URL speculatively.
    print("Fallback to requests...")
    
    headers = {"Authorization": f"Bearer {api_key}"}
    
    for model in models:
        # Construct possible endpoints
        endpoints = [
            f"https://api-inference.huggingface.co/models/{model}", # Legacy
            f"https://router.huggingface.co/models/{model}",      # Possible Router path
            f"https://router.huggingface.co/hf-inference/models/{model}" # Another potential
        ]
        
        for url in endpoints:
            print(f"Trying URL: {url}")
            try:
                response = requests.post(url, headers=headers, json={"inputs": request.prompt}, timeout=30)
                if response.status_code == 200:
                    base64_image = base64.b64encode(response.content).decode("utf-8")
                    return {"url": f"data:image/jpeg;base64,{base64_image}"}
                elif response.status_code == 410:
                    print(f"URL {url} deprecated (410).")
                else:
                    print(f"Failed {url}: {response.status_code} - {response.text[:200]}")
            except Exception as e:
                print(f"Request failed for {url}: {e}")
                last_error = e

    # If all failed
    print(f"Hugging Face models failed: {last_error}")
    
    # FALLBACK: Pollinations.ai (Client-side Fetch)
    # Since our Cloud Run IP is blocked/rate-limited by HF and Pollinations,
    # we return a URL that the FRONTEND will try to load directly.
    # The frontend runs on the user's IP, which is not blocked.
    encoded_prompt = requests.utils.quote(request.prompt)
    fallback_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"
    print(f"Returning fallback URL: {fallback_url}")
    return {"url": fallback_url}
 
