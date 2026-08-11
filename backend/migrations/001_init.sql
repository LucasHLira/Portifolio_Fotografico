-- ============================================================
-- Schema inicial — Portfólio Fotográfico Kauã
-- Execute no Railway via psql ou no painel de query
-- ============================================================

-- Administradores
CREATE TABLE IF NOT EXISTS admins (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  criado_em   TIMESTAMP DEFAULT NOW()
);

-- Álbuns
CREATE TABLE IF NOT EXISTS albums (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  categoria     VARCHAR(100),
  descricao     TEXT,
  capa_url      VARCHAR(500),
  capa_thumb    VARCHAR(500),
  capa_cloudinary_id VARCHAR(255),
  ordem         INTEGER DEFAULT 0,
  publicado     BOOLEAN DEFAULT true,
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Fotos
CREATE TABLE IF NOT EXISTS fotos (
  id               SERIAL PRIMARY KEY,
  album_id         INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  cloudinary_id    VARCHAR(255) NOT NULL,
  cloudinary_url   VARCHAR(500) NOT NULL,
  thumbnail_url    VARCHAR(500) NOT NULL,
  alt_text         VARCHAR(255),
  ordem            INTEGER DEFAULT 0,
  criado_em        TIMESTAMP DEFAULT NOW()
);

-- Mensagens de contato
CREATE TABLE IF NOT EXISTS mensagens (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  telefone    VARCHAR(50),
  tipo_servico VARCHAR(100),
  mensagem    TEXT NOT NULL,
  status      VARCHAR(50) DEFAULT 'nova',
  criado_em   TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fotos_album_id ON fotos(album_id);
CREATE INDEX IF NOT EXISTS idx_fotos_ordem    ON fotos(album_id, ordem);
CREATE INDEX IF NOT EXISTS idx_albums_slug    ON albums(slug);
CREATE INDEX IF NOT EXISTS idx_albums_ordem   ON albums(ordem);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON mensagens(status);
