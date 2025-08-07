const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;
const TARGET_URL = 'http://localhost:8000';

// Configurar CORS para permitir todas las solicitudes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Configurar el proxy
app.use('/api', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // mantener la ruta /api
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${TARGET_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${err.message} for ${req.url}`);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', proxy: 'CORS Proxy Server', target: TARGET_URL });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: ${TARGET_URL}`);
  console.log(`🌐 CORS enabled for all origins`);
});