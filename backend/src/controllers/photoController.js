// src/controllers/photoController.js

const { query } = require('../config/database');
const { uploadStream, deleteImage, generateThumbnailUrl } = require('../config/cloudinary');

/** POST /api/photos/upload — Upload múltiplo de fotos para um álbum */
async function uploadFotos(req, res) {
  const { album_id, alt_texts } = req.body;
  // alt_texts: JSON string de array com o alt_text de cada foto, na mesma ordem dos arquivos

  if (!album_id) {
    return res.status(400).json({ success: false, error: 'album_id é obrigatório.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
  }

  // Verifica se o álbum existe
  const albumResult = await query('SELECT id, titulo FROM albums WHERE id = $1', [album_id]);
  if (albumResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Álbum não encontrado.' });
  }

  const album = albumResult.rows[0];
  const alts = alt_texts ? JSON.parse(alt_texts) : [];

  // Busca a maior ordem atual para adicionar as novas fotos no final
  const ordemResult = await query(
    'SELECT COALESCE(MAX(ordem), -1) as max_ordem FROM fotos WHERE album_id = $1',
    [album_id]
  );
  let proximaOrdem = (ordemResult.rows[0].max_ordem || 0) + 1;

  const folder = `${process.env.CLOUDINARY_FOLDER || 'portfolio-kaua'}/${album.titulo.toLowerCase().replace(/\s+/g, '-')}`;

  // Faz upload de todos os arquivos em paralelo
  const uploads = await Promise.allSettled(
    req.files.map(async (file, index) => {
      const resultado = await uploadStream(file.buffer, folder);
      const thumbnail = generateThumbnailUrl(resultado.secure_url, 600);
      const altText = alts[index] || album.titulo;

      const insertResult = await query(
        `INSERT INTO fotos (album_id, cloudinary_id, cloudinary_url, thumbnail_url, alt_text, ordem)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [album_id, resultado.public_id, resultado.secure_url, thumbnail, altText, proximaOrdem + index]
      );

      return insertResult.rows[0];
    })
  );

  const sucesso = uploads.filter((u) => u.status === 'fulfilled').map((u) => u.value);
  const erros = uploads.filter((u) => u.status === 'rejected').map((u) => u.reason?.message);

  if (sucesso.length === 0) {
    return res.status(500).json({ 
      success: false, 
      error: 'Falha ao fazer upload das fotos: ' + (erros[0] || 'Erro desconhecido no Cloudinary.') 
    });
  }

  // Se o álbum não tem capa ainda, usa a primeira foto como capa
  if (sucesso.length > 0) {
    const albumSemCapa = await query('SELECT id FROM albums WHERE id = $1 AND capa_url IS NULL', [album_id]);
    if (albumSemCapa.rows.length > 0) {
      const primeiraFoto = sucesso[0];
      await query(
        'UPDATE albums SET capa_url = $1, capa_thumb = $2, atualizado_em = NOW() WHERE id = $3',
        [primeiraFoto.cloudinary_url, primeiraFoto.thumbnail_url, album_id]
      );
    }
  }

  // Dispara revalidação do Next.js para atualizar as páginas estáticas
  triggerRevalidation(album.slug);

  res.status(201).json({
    success: true,
    data: sucesso,
    erros: erros.length > 0 ? erros : undefined,
    message: `${sucesso.length} foto(s) enviada(s) com sucesso.`,
  });
}

/** DELETE /api/photos/:id — Exclui uma foto */
async function excluirFoto(req, res) {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM fotos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Foto não encontrada.' });
    }

    const foto = result.rows[0];

    // Deleta do Cloudinary primeiro
    await deleteImage(foto.cloudinary_id);

    // Deleta do banco
    await query('DELETE FROM fotos WHERE id = $1', [id]);

    res.json({ success: true, message: 'Foto excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir foto:', err);
    res.status(500).json({ success: false, error: 'Erro ao excluir foto.' });
  }
}

/** PUT /api/photos/:id — Edita alt_text ou album_id de uma foto */
async function editarFoto(req, res) {
  const { id } = req.params;
  const { alt_text, album_id } = req.body;

  try {
    const result = await query(
      'UPDATE fotos SET alt_text = COALESCE($1, alt_text), album_id = COALESCE($2, album_id) WHERE id = $3 RETURNING *',
      [alt_text, album_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Foto não encontrada.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao editar foto:', err);
    res.status(500).json({ success: false, error: 'Erro ao editar foto.' });
  }
}

/** PATCH /api/photos/reorder — Reordena fotos dentro de um álbum */
async function reordenarFotos(req, res) {
  const { ordem } = req.body;
  // ordem: [{ id: 1, ordem: 0 }, { id: 2, ordem: 1 }, ...]

  if (!Array.isArray(ordem)) {
    return res.status(400).json({ success: false, error: 'Formato inválido.' });
  }

  try {
    await Promise.all(
      ordem.map(({ id, ordem: novaOrdem }) =>
        query('UPDATE fotos SET ordem = $1 WHERE id = $2', [novaOrdem, id])
      )
    );
    res.json({ success: true, message: 'Ordem das fotos atualizada.' });
  } catch (err) {
    console.error('Erro ao reordenar fotos:', err);
    res.status(500).json({ success: false, error: 'Erro ao reordenar fotos.' });
  }
}

/** GET /api/photos?album_id=X — Lista fotos de um álbum */
async function listarFotos(req, res) {
  const { album_id } = req.query;
  if (!album_id) {
    return res.status(400).json({ success: false, error: 'album_id é obrigatório.' });
  }

  try {
    const result = await query(
      'SELECT * FROM fotos WHERE album_id = $1 ORDER BY ordem ASC, criado_em ASC',
      [album_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao listar fotos:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar fotos.' });
  }
}

// Dispara revalidação da página do Next.js após upload
// Isso faz o Next.js regenerar a página estática do álbum com as novas fotos
async function triggerRevalidation(slug) {
  const frontendUrl = process.env.FRONTEND_URL;
  const revalidateSecret = process.env.REVALIDATE_SECRET;

  if (!frontendUrl || !revalidateSecret) return;

  try {
    await fetch(`${frontendUrl}/api/revalidate?slug=${slug}&secret=${revalidateSecret}`);
  } catch (err) {
    // Falha silenciosa — não impede o upload
    console.warn('Revalidação do Next.js falhou:', err.message);
  }
}

module.exports = { uploadFotos, excluirFoto, editarFoto, reordenarFotos, listarFotos };
