from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.text_model import ChatRequest, ChatResponse
import requests
from config.settings import settings

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
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
