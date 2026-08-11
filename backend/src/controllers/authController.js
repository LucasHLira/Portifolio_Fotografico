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

/**
 * POST /api/auth/criar-admin
 * ⚠️  Use apenas uma vez para criar o admin inicial!
 * Depois, remova essa rota ou proteja com um segredo extra.
 * Body: { email, senha, segredo }
 */
async function criarAdmin(req, res) {
  const { email, senha, segredo } = req.body;

  // Segredo extra para não deixar a rota completamente aberta
  if (segredo !== process.env.ADMIN_SETUP_SECRET) {
    return res.status(403).json({ success: false, error: 'Não autorizado.' });
  }

  try {
    const existente = await query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Admin já existe.' });
    }

    const salt = await bcrypt.genSalt(12); // 12 rounds é um bom equilíbrio segurança/velocidade
    const senha_hash = await bcrypt.hash(senha, salt);

    const result = await query(
      'INSERT INTO admins (email, senha_hash) VALUES ($1, $2) RETURNING id, email',
      [email, senha_hash]
    );

    res.status(201).json({ success: true, admin: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar admin:', err);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
}

module.exports = { login, criarAdmin };
