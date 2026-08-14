// src/controllers/albumController.js

const { query } = require('../config/database');
const { uploadStream, deleteImage, generateThumbnailUrl } = require('../config/cloudinary');
const slugify = require('slugify');

/** GET /api/albums — Lista todos os álbuns publicados */
async function listarAlbums(req, res) {
  try {
    const result = await query(
      `SELECT id, titulo, slug, categoria, descricao, capa_url, capa_thumb, ordem, criado_em
       FROM albums
       WHERE publicado = true
       ORDER BY ordem ASC, criado_em DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao listar álbuns:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar álbuns.' });
  }
}

/** GET /api/albums/admin — Lista TODOS os álbuns (admin) */
async function listarAlbumsAdmin(req, res) {
  try {
    const result = await query(
      `SELECT a.*, COUNT(f.id)::integer as total_fotos
       FROM albums a
       LEFT JOIN fotos f ON f.album_id = a.id
       GROUP BY a.id
       ORDER BY a.ordem ASC, a.criado_em DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao listar álbuns (admin):', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar álbuns.' });
  }
}

/** GET /api/albums/:slug — Álbum com suas fotos */
async function buscarAlbum(req, res) {
  const { slug } = req.params;
  try {
    const albumResult = await query(
      `SELECT * FROM albums WHERE slug = $1 AND publicado = true`,
      [slug]
    );

    if (albumResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Álbum não encontrado.' });
    }

    const album = albumResult.rows[0];

    const fotosResult = await query(
      `SELECT id, cloudinary_url, thumbnail_url, alt_text, ordem
       FROM fotos
       WHERE album_id = $1
       ORDER BY ordem ASC, criado_em ASC`,
      [album.id]
    );

    res.json({ success: true, data: { ...album, fotos: fotosResult.rows } });
  } catch (err) {
    console.error('Erro ao buscar álbum:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar álbum.' });
  }
}

/** POST /api/albums — Cria novo álbum (com foto de capa opcional) */
async function criarAlbum(req, res) {
  const { titulo, categoria, descricao, publicado } = req.body;

  if (!titulo) {
    return res.status(400).json({ success: false, error: 'Título é obrigatório.' });
  }

  // Gera slug único
  const baseSlug = slugify(titulo, { lower: true, strict: true, locale: 'pt' });
  let slug = baseSlug;

  // Verifica se slug já existe e adiciona sufixo numérico se necessário
  const existente = await query('SELECT id FROM albums WHERE slug = $1', [slug]);
  if (existente.rows.length > 0) {
    slug = `${baseSlug}-${Date.now()}`;
  }

  let capaUrl = null;
  let capaThumb = null;
  let capaCloudinaryId = null;

  // Upload da foto de capa, se enviada
  if (req.file) {
    try {
      const folder = `${process.env.CLOUDINARY_FOLDER || 'portfolio-lumina'}/capas`;
      const resultado = await uploadStream(req.file.buffer, folder);
      capaUrl = resultado.secure_url;
      capaThumb = generateThumbnailUrl(resultado.secure_url, 600);
      capaCloudinaryId = resultado.public_id;
    } catch (err) {
      console.error('Erro ao fazer upload da capa:', err);
      return res.status(500).json({ success: false, error: 'Erro ao fazer upload da capa.' });
    }
  }

  try {
    const result = await query(
      `INSERT INTO albums (titulo, slug, categoria, descricao, capa_url, capa_thumb, capa_cloudinary_id, publicado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [titulo, slug, categoria || null, descricao || null, capaUrl, capaThumb, capaCloudinaryId, publicado !== 'false']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar álbum:', err);
    res.status(500).json({ success: false, error: 'Erro ao criar álbum.' });
  }
}

/** PUT /api/albums/:id — Edita álbum */
async function editarAlbum(req, res) {
  const { id } = req.params;
  const { titulo, categoria, descricao, publicado } = req.body;

  try {
    let capaUrl = undefined;
    let capaThumb = undefined;
    let capaCloudinaryId = undefined;

    // Se uma nova capa foi enviada, faz upload
    if (req.file) {
      // Busca o cloudinary_id da capa antiga para deletar
      const albumAtual = await query('SELECT capa_cloudinary_id FROM albums WHERE id = $1', [id]);
      if (albumAtual.rows[0]?.capa_cloudinary_id) {
        await deleteImage(albumAtual.rows[0].capa_cloudinary_id);
      }

      const folder = `${process.env.CLOUDINARY_FOLDER || 'portfolio-lumina'}/capas`;
      const resultado = await uploadStream(req.file.buffer, folder);
      capaUrl = resultado.secure_url;
      capaThumb = generateThumbnailUrl(resultado.secure_url, 600);
      capaCloudinaryId = resultado.public_id;
    }

    const setClauses = ['titulo = $1', 'categoria = $2', 'descricao = $3', 'publicado = $4', 'atualizado_em = NOW()'];
    const values = [titulo, categoria, descricao, publicado !== 'false'];

    if (capaUrl !== undefined) {
      setClauses.push(`capa_url = $${values.length + 1}`);
      values.push(capaUrl);
      setClauses.push(`capa_thumb = $${values.length + 1}`);
      values.push(capaThumb);
      setClauses.push(`capa_cloudinary_id = $${values.length + 1}`);
      values.push(capaCloudinaryId);
    }

    values.push(id);
    const result = await query(
      `UPDATE albums SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Álbum não encontrado.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao editar álbum:', err);
    res.status(500).json({ success: false, error: 'Erro ao editar álbum.' });
  }
}

/** DELETE /api/albums/:id — Exclui álbum e todas as fotos */
async function excluirAlbum(req, res) {
  const { id } = req.params;
  try {
    // Busca todas as fotos para deletar do Cloudinary
    const fotosResult = await query('SELECT cloudinary_id FROM fotos WHERE album_id = $1', [id]);

    // Deleta fotos do Cloudinary (em paralelo)
    await Promise.all(fotosResult.rows.map((f) => deleteImage(f.cloudinary_id)));

    // Busca e deleta capa do álbum
    const albumResult = await query('SELECT capa_cloudinary_id FROM albums WHERE id = $1', [id]);
    if (albumResult.rows[0]?.capa_cloudinary_id) {
      await deleteImage(albumResult.rows[0].capa_cloudinary_id);
    }

    // ON DELETE CASCADE no banco já remove as fotos, mas deletamos do Cloudinary primeiro
    await query('DELETE FROM albums WHERE id = $1', [id]);

    res.json({ success: true, message: 'Álbum excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir álbum:', err);
    res.status(500).json({ success: false, error: 'Erro ao excluir álbum.' });
  }
}

/** PATCH /api/albums/reorder — Atualiza ordem dos álbuns */
async function reordenarAlbums(req, res) {
  const { ordem } = req.body;
  // ordem: [{ id: 1, ordem: 0 }, { id: 2, ordem: 1 }, ...]

  if (!Array.isArray(ordem)) {
    return res.status(400).json({ success: false, error: 'Formato inválido. Envie um array de {id, ordem}.' });
  }

  try {
    await Promise.all(
      ordem.map(({ id, ordem: novaOrdem }) =>
        query('UPDATE albums SET ordem = $1 WHERE id = $2', [novaOrdem, id])
      )
    );
    res.json({ success: true, message: 'Ordem atualizada.' });
  } catch (err) {
    console.error('Erro ao reordenar álbuns:', err);
    res.status(500).json({ success: false, error: 'Erro ao reordenar álbuns.' });
  }
}

/** PATCH /api/albums/:id/capa — Define uma capa a partir de uma foto existente */
async function definirCapaAlbum(req, res) {
  const { id } = req.params;
  const { capa_url, capa_thumb, capa_cloudinary_id } = req.body;

  if (!capa_url || !capa_thumb || !capa_cloudinary_id) {
    return res.status(400).json({ success: false, error: 'Dados da capa incompletos.' });
  }

  try {
    // Busca a capa antiga
    const albumAtual = await query('SELECT capa_cloudinary_id FROM albums WHERE id = $1', [id]);
    const capaAntiga = albumAtual.rows[0]?.capa_cloudinary_id;

    if (capaAntiga && capaAntiga !== capa_cloudinary_id) {
      // Verifica se a capa antiga pertence a alguma foto
      const fotoRef = await query('SELECT id FROM fotos WHERE cloudinary_id = $1', [capaAntiga]);
      if (fotoRef.rows.length === 0) {
        // Nenhuma foto usa essa imagem, podemos deletar do Cloudinary
        await deleteImage(capaAntiga);
      }
    }

    const result = await query(
      `UPDATE albums SET capa_url = $1, capa_thumb = $2, capa_cloudinary_id = $3, atualizado_em = NOW() WHERE id = $4 RETURNING *`,
      [capa_url, capa_thumb, capa_cloudinary_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Álbum não encontrado.' });
    }
    res.json({ success: true, data: result.rows[0], message: 'Capa atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao definir capa:', err);
    res.status(500).json({ success: false, error: 'Erro ao definir capa do álbum.' });
  }
}

/** GET /api/albums/slugs — Retorna todos os slugs (para generateStaticParams do Next.js) */
async function listarSlugs(req, res) {
  try {
    const result = await query('SELECT slug FROM albums WHERE publicado = true');
    res.json({ success: true, data: result.rows.map((r) => r.slug) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao buscar slugs.' });
  }
}

module.exports = {
  listarAlbums,
  listarAlbumsAdmin,
  buscarAlbum,
  criarAlbum,
  editarAlbum,
  excluirAlbum,
  reordenarAlbums,
  definirCapaAlbum,
  listarSlugs,
};
