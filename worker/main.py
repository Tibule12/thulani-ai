from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from worker.ai_router import router as ai_router
from worker.image_router import router as image_router
from config.settings import settings

app = FastAPI(title="Thulani AI Assistant")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai_router, prefix="/api/chat", tags=["chat"])
app.include_router(image_router, prefix="/api/image", tags=["image"])

@app.get("/")
def read_root():
    return {"message": "Thulani AI API is running"}
