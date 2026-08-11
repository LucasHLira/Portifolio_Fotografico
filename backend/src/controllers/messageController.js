// src/controllers/messageController.js

const { query } = require('../config/database');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transporte de e-mail (Gmail SMTP)
// Use uma "App Password" do Google, não sua senha normal
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true para porta 465, false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/** POST /api/messages — Recebe mensagem do formulário de contato */
async function criarMensagem(req, res) {
  const { nome, email, telefone, tipo_servico, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({
      success: false,
      error: 'Nome, email e mensagem são obrigatórios.',
    });
  }

  // Validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Email inválido.' });
  }

  try {
    // Salva no banco
    const result = await query(
      `INSERT INTO mensagens (nome, email, telefone, tipo_servico, mensagem)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, criado_em`,
      [nome, email, telefone || null, tipo_servico || null, mensagem]
    );

    // Envia e-mail de notificação (não bloqueia a resposta em caso de falha)
    enviarEmail(nome, email, telefone, tipo_servico, mensagem).catch((err) => {
      console.error('Falha ao enviar e-mail:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entrarei em contato em breve.',
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    res.status(500).json({ success: false, error: 'Erro ao enviar mensagem. Tente novamente.' });
  }
}

/** GET /api/messages — Lista mensagens (admin) */
async function listarMensagens(req, res) {
  const { status } = req.query;

  try {
    let sql = 'SELECT * FROM mensagens';
    const params = [];

    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }

    sql += ' ORDER BY criado_em DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao listar mensagens:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar mensagens.' });
  }
}

/** PATCH /api/messages/:id/status — Atualiza status da mensagem */
async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ['nova', 'lida', 'respondida'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Status inválido. Use: ${statusValidos.join(', ')}`,
    });
  }

  try {
    const result = await query(
      'UPDATE mensagens SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Mensagem não encontrada.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ success: false, error: 'Erro ao atualizar status.' });
  }
}

// Helper: envia e-mail de notificação para o fotógrafo
async function enviarEmail(nome, email, telefone, tipo_servico, mensagem) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Credenciais de e-mail não configuradas. Pulando envio.');
    return;
  }

  await transporter.sendMail({
    from: `"Portfólio Kauã" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    replyTo: email,
    subject: `📸 Novo contato de ${nome}${tipo_servico ? ` — ${tipo_servico}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066ff;">Nova mensagem do portfólio</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Nome:</td><td style="padding: 8px;">${nome}</td></tr>
          <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Telefone:</td><td style="padding: 8px;">${telefone || 'Não informado'}</td></tr>
          <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Serviço:</td><td style="padding: 8px;">${tipo_servico || 'Não informado'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Mensagem:</td><td style="padding: 8px;">${mensagem.replace(/\n/g, '<br>')}</td></tr>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">Responda diretamente para este e-mail — o campo Reply-To já está configurado.</p>
      </div>
    `,
  });
}

module.exports = { criarMensagem, listarMensagens, atualizarStatus };
