from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    image: Optional[str] = None  # Base64 string or URL

class ChatResponse(BaseModel):
    response: str
