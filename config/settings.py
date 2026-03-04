import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Thulani AI"
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    SD_URL: str = "http://localhost:7860" # Example for Automatic1111 or similar
    
    class Config:
        env_file = ".env"

settings = Settings()
