from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.text_model import ChatRequest, ChatResponse
import requests
import os
from groq import Groq
from config.settings import settings

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
       # MODE 1: Fast & Cheap (Groq Cloud API)
        if hasattr(settings, "GROQ_API_KEY") and settings.GROQ_API_KEY:
             client = Groq(api_key=settings.GROQ_API_KEY)
             
             # Vision Request (Image Analysis)
             if request.image:
                 print("Processing Vision Request...")
                 chat_completion = client.chat.completions.create(
                     messages=[
                         {
                             "role": "user",
                             "content": [
                                 {"type": "text", "text": request.message or "Describe this image."},
                                 {
                                     "type": "image_url",
                                     "image_url": {
                                         "url": request.image, # Must be a data URL (data:image/jpeg;base64,...)
                                     },
                                 },
                             ],
                         }
                     ],
                     model="llama-3.2-11b-vision-preview", # Vision Model
                     temperature=0.4,
                     max_tokens=1024,
                 )
             
             # Standard Text Request
             else:
                 chat_completion = client.chat.completions.create(
                     messages=[
                         {
                             "role": "user",
                             "content": request.message,
                         }
                     ],
                     model="llama-3.3-70b-versatile",  # Fast, Cheap Llama 3
                 )
             return ChatResponse(response=chat_completion.choices[0].message.content)

        # MODE 2: Private & Self-Hosted (Ollama on VM)
        else:
            # Prepare payload for Ollama
            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": request.message,
                "stream": False
            }
            
            # Call Ollama API
            try:
                response = requests.post(f"{settings.OLLAMA_URL}/api/generate", json=payload)
                response.raise_for_status()
                
                result = response.json()
                return ChatResponse(response=result.get("response", ""))
                
            except requests.exceptions.ConnectionError:
                # Fallback response so the UI doesn't break
                return ChatResponse(
                    response="**System Notification:** I cannot connect to the local AI engine (Ollama). \n\n"
                             "Please ensure:\n"
                             "1. [Ollama](https://ollama.com) is installed.\n"
                             "2. It is running (`ollama serve`).\n"
                             "3. You have pulled the model (`ollama pull llama3`)."
                )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
