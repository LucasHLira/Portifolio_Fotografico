// src/middleware/auth.js
// Middleware de verificação JWT — protege as rotas do painel admin

const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  // O token deve vir no header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação não fornecido.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Anexa os dados do admin decodificados ao request
    // para uso nos controllers (ex: req.admin.id)
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Faça login novamente.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Token inválido.'
    });
  }
}

module.exports = authMiddleware;
