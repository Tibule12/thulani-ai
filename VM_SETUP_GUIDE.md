# Thulani AI - High Performance VM Setup Guide

This guide is for the "Pro" version of Thulani AI where we self-host the model on Google Cloud Compute Engine. Use this when you have paying subscribers or need absolute privacy.

## 1. Create the Virtual Machine
Run this command to create a powerful VM (Ubuntu 22.04, 50GB Disk, 4 vCPUs):
```bash
gcloud compute instances create thulani-worker-vm \
    --zone=us-central1-a \
    --machine-type=e2-standard-4 \
    --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=341498038874-compute@developer.gserviceaccount.com \
    --scopes=https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/trace.append \
    --create-disk=auto-delete=yes,boot=yes,device-name=thulani-worker-vm,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20240927,mode=rw,size=50,type=projects/autopromote-cc6d3/zones/us-central1-a/diskTypes/pd-balanced \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=goog-ec-src=vm_add-gcloud \
    --reservation-affinity=any
```

## 2. Install Software (Docker & Ollama)
SSH into the machine:
```bash
gcloud compute ssh thulani-worker-vm --zone=us-central1-a
```

Run these commands inside the VM:
```bash
# Update System
sudo apt update && sudo apt install -y curl docker.io

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama Service (if not running)
sudo systemctl start ollama

# Pull the Model
ollama pull llama3
```

## 3. Deploy the Worker Container
Authenticate Docker to Google Cloud:
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Run the worker container (connected to the host network to see Ollama):
```bash
sudo docker run -d \
  --network host \
  --env PORT=8000 \
  --env AI_SERVICE=ollama \
  --env OLLAMA_HOST=http://localhost:11434 \
  us-central1-docker.pkg.dev/autopromote-cc6d3/thulani-repo/worker:latest
```

## 4. Connect the API Gateway
Get the VM's Internal or External IP and update the Cloud Run service:
```bash
gcloud run services update thulani-api \
  --region us-central1 \
  --set-env-vars WORKER_URL=http://<VM_IP_ADDRESS>:8000
```
