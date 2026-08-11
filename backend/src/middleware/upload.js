// src/middleware/upload.js
// Configuração do Multer com armazenamento EM MEMÓRIA
//
// Por que em memória e não em disco?
// O Railway não tem armazenamento persistente — arquivos salvos em disco
// somem quando o serviço reinicia. Guardamos o arquivo como Buffer
// e repassamos direto para o Cloudinary via stream.

const multer = require('multer');

const storage = multer.memoryStorage();

// Filtro: aceita apenas imagens
function fileFilter(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB por arquivo (Cloudinary aceita até 100MB no free)
    files: 20,                   // máximo de 20 fotos por upload
  },
});

// Middleware para upload de arquivo único (ex: capa do álbum)
const uploadSingle = upload.single('foto');

// Middleware para upload de múltiplos arquivos (ex: galeria)
const uploadMultiple = upload.array('fotos', 20);

// Wrapper que converte erros do Multer para JSON (não HTML)
function handleUploadError(uploadFn) {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'Arquivo muito grande. Máximo 20MB por imagem.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ success: false, error: 'Máximo de 20 arquivos por upload.' });
        }
        return res.status(400).json({ success: false, error: err.message });
      }
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  };
}

module.exports = {
  uploadSingle: handleUploadError(uploadSingle),
  uploadMultiple: handleUploadError(uploadMultiple),
};
