# Portfólio Fotográfico Kauã

Plataforma de portfólio fotográfico com frontend público (Next.js) e painel administrativo privado.

## Estrutura do Projeto

```
Portifolio_Kaua/
├── backend/   # Node.js + Express + PostgreSQL
└── frontend/  # Next.js 14
```

## Instalação e Desenvolvimento

### Backend
```bash
cd backend
cp .env.example .env    # Configure as variáveis de ambiente
npm install
npm run dev             # Inicia em http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.example .env.local   # Configure as variáveis de ambiente
npm install
npm run dev                  # Inicia em http://localhost:3000
```

## Configuração Inicial (FAÇA ISSO ANTES DE USAR)

### 1. Configure o banco de dados
Crie um banco PostgreSQL no Railway e adicione `DATABASE_URL` no `.env` do backend.

### 2. Execute a migration
```bash
cd backend
node -e "require('./src/config/database.js').runMigration()"
```

### 3. Crie o admin inicial
Adicione `ADMIN_SETUP_SECRET` ao `.env`, então faça uma requisição POST:
```bash
curl -X POST http://localhost:3001/api/auth/criar-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","senha":"suaSenha","segredo":"ADMIN_SETUP_SECRET"}'
```
> ⚠️ **IMPORTANTE**: Após criar o admin, remova a rota `/criar-admin` de `routes/auth.js` antes de ir para produção!

### 4. Configure o Cloudinary
Crie uma conta em cloudinary.com e adicione as credenciais ao `.env`.

## Deploy

### Backend (Railway)
1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente no painel do Railway
3. O Railway detecta automaticamente Node.js e usa `npm start`

### Frontend (Vercel)
1. Conecte o repositório à Vercel
2. Configure `NEXT_PUBLIC_API_URL` com a URL do backend no Railway
3. Configure `REVALIDATE_SECRET` igual ao do backend

## Rotas do Admin

- Login: `/admin/login`
- Álbuns: `/admin/albuns`
- Upload de Fotos: `/admin/fotos`
- Mensagens: `/admin/mensagens`

## Tecnologias

- **Frontend**: Next.js 14, React 18, react-masonry-css, yet-another-react-lightbox
- **Backend**: Node.js, Express, PostgreSQL (pg), Multer, Cloudinary SDK, JWT
- **Deploy**: Vercel (frontend) + Railway (backend + banco)
- **Imagens**: Cloudinary (otimização automática, WebP, lazy loading)
