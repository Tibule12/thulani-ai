#!/bin/bash

# Default to 8000 if PORT is not set (Cloud Run sets PORT=8080 usually)
PORT=${PORT:-8000}

# If GROQ_API_KEY is present, we skip the heavy Ollama startup
if [ -n "$GROQ_API_KEY" ]; then
    echo "GROQ_API_KEY detected. Starting in Serverless Mode (No Local LLM)..."
    exec uvicorn worker.main:app --host 0.0.0.0 --port $PORT
fi

# Fallback: Start Ollama in the background (Only for Local/VM)
echo "No GROQ_API_KEY found. Starting Local Ollama instance..."
ollama serve &

# Wait for Ollama to start
echo "Waiting for Ollama to start..."
while ! curl -s http://localhost:11434/api/tags > /dev/null; do
    sleep 1
done

# Pull the model if not present (this might take a while on first run/deploy)
echo "Checking/Pulling Llama 3 model..."
ollama pull llama3

# Start the Python application
echo "Starting AI Worker..."
exec uvicorn worker.main:app --host 0.0.0.0 --port 8000
