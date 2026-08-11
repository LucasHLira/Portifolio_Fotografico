// src/config/database.js
// Pool de conexão PostgreSQL usando a biblioteca 'pg'
// O Pool reutiliza conexões — muito mais eficiente que conectar a cada request

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon exige SSL para todas as conexões (mesmo local)
  ssl: { rejectUnauthorized: false },
  // Configurações de pool
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 segundos de timeout (para cloud DB)
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.stack);
  } else {
    console.log('✅ PostgreSQL conectado com sucesso');
    release();
  }
});

// Helper para queries — uso: db.query('SELECT * FROM albums', [])
// Retorna diretamente as rows, que é o que você precisa 99% das vezes
const query = (text, params) => pool.query(text, params);

// Roda o arquivo SQL de migration
// Uso: node -e "require('./src/config/database.js').runMigration()"
async function runMigration() {
  const migrationPath = path.join(__dirname, '../../migrations/001_init.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  try {
    await pool.query(sql);
    console.log('✅ Migration executada com sucesso!');
  } catch (err) {
    console.error('❌ Erro na migration:', err.message);
  } finally {
    await pool.end();
  }
}

module.exports = { query, pool, runMigration };
