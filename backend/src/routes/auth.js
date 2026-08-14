// src/routes/auth.js

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Rate limit específico para login: máximo 5 tentativas por 15 minutos
// Isso previne ataques de força bruta na senha do admin
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: { success: false, error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);

module.exports = router;
