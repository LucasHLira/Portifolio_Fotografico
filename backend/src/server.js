// src/server.js
// Entry point do backend — Express + todas as configurações

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes    = require('./routes/auth');
const albumRoutes   = require('./routes/albums');
const photoRoutes   = require('./routes/photos');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Segurança básica ─────────────────────────────────────────────────────────
app.use(helmet()); // Adiciona headers de segurança (X-Frame-Options, CSP, etc.)

// CORS: apenas permite requisições do domínio do frontend
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (ex: Postman, curl) em desenvolvimento
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origem não permitida — ${origin}`));
    }
  },
  credentials: true,
}));

// ─── Parsing de body ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate limit global ────────────────────────────────────────────────────────
// Proteção geral contra abuso — 100 requests por IP a cada 10 minutos
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Muitas requisições. Tente novamente mais tarde.' },
});
app.use('/api/', globalLimiter);

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/albums',   albumRoutes);
app.use('/api/photos',   photoRoutes);
app.use('/api/messages', messageRoutes);

// Health check — útil para o Railway verificar se o serviço está vivo
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Handler de erros globais ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);

  // Erros de CORS
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, error: err.message });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor.'
      : err.message,
  });
});

// 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Rota ${req.method} ${req.path} não encontrada.` });
});

// ─── Inicialização ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS permitido para: ${allowedOrigins.join(', ')}\n`);
});

module.exports = app;
