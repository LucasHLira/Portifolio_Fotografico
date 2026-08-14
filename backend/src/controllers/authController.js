// src/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
require('dotenv').config();

/**
 * POST /api/auth/login
 * Body: { email, senha }
 */
async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];

    if (!admin) {
      // Mensagem genérica para não revelar se o email existe ou não
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin.id, email: admin.email },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
}

module.exports = { login };
