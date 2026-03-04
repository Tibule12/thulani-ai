from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ImageRequest(BaseModel):
    prompt: str

class ImageResponse(BaseModel):
    url: str # Or base64 string

@router.post("/generate", response_model=ImageResponse)
async def generate_image(request: ImageRequest):
    # Placeholder for Stable Diffusion integration
    return {"url": "https://via.placeholder.com/512"} 
