const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

// Route to AI Worker (Text Chat)
app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(`${WORKER_URL}/api/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding to worker:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to connect to AI Worker' });
    }
  }
});

// Route to AI Worker (Image Generation)
app.post('/api/image/generate', async (req, res) => {
  try {
    const response = await axios.post(`${WORKER_URL}/api/image/generate`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding to worker:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to connect to AI Worker' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Forwarding requests to Worker at ${WORKER_URL}`);
});
