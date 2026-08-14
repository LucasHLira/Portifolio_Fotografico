// src/routes/albums.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  listarAlbums,
  listarAlbumsAdmin,
  buscarAlbum,
  criarAlbum,
  editarAlbum,
  excluirAlbum,
  reordenarAlbums,
  definirCapaAlbum,
  listarSlugs,
} = require('../controllers/albumController');

// Rotas PÚBLICAS
router.get('/', listarAlbums);
router.get('/slugs', listarSlugs);        // Para generateStaticParams do Next.js
router.get('/:slug', buscarAlbum);

// Rotas PROTEGIDAS (requerem JWT)
router.get('/admin/all', auth, listarAlbumsAdmin);
router.post('/', auth, uploadSingle, criarAlbum);
router.put('/:id', auth, uploadSingle, editarAlbum);
router.patch('/:id/capa', auth, definirCapaAlbum);
router.delete('/:id', auth, excluirAlbum);
router.patch('/reorder', auth, reordenarAlbums);

module.exports = router;
