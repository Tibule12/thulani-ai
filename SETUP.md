# Project Setup Guide

This guide helps you set up the **Thulani AI Assistant** project structure based on your proposal.

## 1. Backend Setup (Core Logic)

The backend is built with FastAPI and is ready to run.

1.  **Install Python Dependencies**:
    Open a terminal in the root folder (`thulani-ai`) and run:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configure Environment**:
    Open `config/settings.py` to adjust settings like:
    - `OLLAMA_URL`: Default is `http://localhost:11434`
    - `OLLAMA_MODEL`: Default is `llama3`

3.  **Run the Server**:
    Start the backend server:
    ```bash
    uvicorn backend.main:app --reload
    ```
    The API will be available at http://localhost:8000.
    Documentation at http://localhost:8000/docs.

## 2. Frontend Setup (Web Interface)

The `frontend` folder is created but needs initialization.

1.  Open a terminal in the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Initialize the Next.js app:
    ```bash
    npx create-next-app@latest . --typescript --tailwind --eslint
    ```
3.  Start the frontend:
    ```bash
    npm run dev
    ```

## 3. Next Steps

- **Database**: The `database/` folder is a placeholder. You'll need to install and configure a vector database (like ChromaDB or Weaviate) to enable memory features.
- **Image Generation**: If you have Stable Diffusion running locally (e.g., Automatic1111), update the `SD_URL` in `config/settings.py`.
