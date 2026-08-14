// src/config/cloudinary.js
// SDK oficial do Cloudinary v2

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // sempre usa HTTPS
});

/**
 * Faz upload de um buffer (arquivo em memória do Multer) para o Cloudinary
 * usando stream — sem salvar em disco
 *
 * @param {Buffer} buffer - O arquivo como buffer (vem do Multer)
 * @param {string} folder - Subpasta no Cloudinary (ex: 'portfolio-lumina/casamentos')
 * @param {string} [publicId] - ID público opcional (gerado automaticamente se omitido)
 * @returns {Promise<object>} Resultado do upload com urls e public_id
 */
function uploadStream(buffer, folder, publicId = null) {
  return new Promise((resolve, reject) => {
    const options = {
      folder: folder || process.env.CLOUDINARY_FOLDER || 'portfolio-lumina',
      // Otimizações automáticas:
      quality: 'auto:good',        // qualidade ótima com menor tamanho
      fetch_format: 'auto',        // entrega WebP/AVIF para browsers modernos
      // Gera thumbnail no momento do upload (eager = antecipado)
      // Isso evita transformação on-demand que consome créditos extras
      eager: [
        { width: 600, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
        { width: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
      ],
      eager_async: false, // espera as thumbnails ficarem prontas antes de responder
    };

    if (publicId) options.public_id = publicId;

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Passa o buffer diretamente para o stream de upload
    const { Readable } = require('stream');
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // sinaliza fim do stream
    readable.pipe(uploadStream);
  });
}

/**
 * Deleta uma imagem do Cloudinary pelo public_id
 * Importante chamar sempre que deletar uma foto do banco
 */
async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Gera uma URL de thumbnail a partir da URL original
 * Útil para gerar a thumbnail_url sem chamar a API novamente
 */
function generateThumbnailUrl(originalUrl, width = 400) {
  // Insere a transformação na URL do Cloudinary
  return originalUrl.replace('/upload/', `/upload/w_${width},q_auto:good,f_auto/`);
}

module.exports = { uploadStream, deleteImage, generateThumbnailUrl };
