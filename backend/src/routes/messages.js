// src/routes/messages.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { criarMensagem, listarMensagens, atualizarStatus } = require('../controllers/messageController');

// Pública: qualquer pessoa pode enviar uma mensagem
router.post('/', criarMensagem);

// Protegidas: apenas o admin gerencia as mensagens
router.get('/', auth, listarMensagens);
router.patch('/:id/status', auth, atualizarStatus);

module.exports = router;
