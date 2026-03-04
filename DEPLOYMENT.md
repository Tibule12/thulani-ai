# Deployment Guide for Thulani AI

Since you don't have the Google Cloud SDK (`gcloud`) installed yet, follow these steps to deploy your application.

## 1. Install Google Cloud SDK

1.  **Download**: [Google Cloud SDK Installer](https://cloud.google.com/sdk/docs/install#windows)
2.  **Initialize**: Run `gcloud init` in your terminal and log in with your Google account.
3.  **Set Project**: Select or create a new project (e.g., `thulani-ai-project`).

## 2. Push Docker Images to Google Artifact Registry

Once `gcloud` is installed:

1.  **Enable Artifact Registry**:
    ```bash
    gcloud services enable artifactregistry.googleapis.com
    ```
2.  **Create a Repository**:
    ```bash
    gcloud artifacts repositories create thulani-repo --repository-format=docker --location=us-central1
    ```
3.  **Tag Images**:
    ```bash
    docker tag thulani-api us-central1-docker.pkg.dev/PROJECT_ID/thulani-repo/api:latest
    docker tag thulani-worker us-central1-docker.pkg.dev/PROJECT_ID/thulani-repo/worker:latest
    ```
    *(Replace `PROJECT_ID` with your actual project ID)*

4.  **Push Images**:
    ```bash
    auth configure-docker us-central1-docker.pkg.dev
    docker push us-central1-docker.pkg.dev/PROJECT_ID/thulani-repo/api:latest
    docker push us-central1-docker.pkg.dev/PROJECT_ID/thulani-repo/worker:latest
    ```

## 3. Deploy Services

### API Gateway (Cloud Run)
Deploy the Node.js API to Cloud Run (fully managed, auto-scaling):
```bash
gcloud run deploy thulani-api \
  --image us-central1-docker.pkg.dev/PROJECT_ID/thulani-repo/api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### AI Worker (Compute Engine)
Since the worker needs a GPU and runs heavy models, use a VM properly configured with Docker:
1.  **Create VM**: Go to Compute Engine > VM Instances.
2.  **Choose Image**: Select "Container Optimized OS".
3.  **Container Image**: `us-central1-docker.pkg.dev/PROJECT_ID/thulani-repo/worker:latest`
4.  **GPU**: Add a T4 or L4 GPU setup.
5.  **Firewall**: Allow HTTP traffic on port 8000.
