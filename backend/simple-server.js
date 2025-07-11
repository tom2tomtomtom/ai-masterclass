const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Masterclass API is running!',
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});