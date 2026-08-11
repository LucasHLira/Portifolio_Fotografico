// src/routes/photos.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  uploadFotos,
  excluirFoto,
  editarFoto,
  reordenarFotos,
  listarFotos,
} = require('../controllers/photoController');

// Rota PÚBLICA
router.get('/', listarFotos);

// Rotas PROTEGIDAS
router.post('/upload', auth, uploadMultiple, uploadFotos);
router.put('/:id', auth, editarFoto);
router.delete('/:id', auth, excluirFoto);
router.patch('/reorder', auth, reordenarFotos);

module.exports = router;
