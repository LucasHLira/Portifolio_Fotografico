# Lumina - Portfólio Fotográfico

Um portfólio fotográfico completo e dinâmico, composto por um frontend moderno em Next.js e uma API robusta em Node.js. Este sistema foi desenhado para ser uma solução "pronta para uso" para fotógrafos que desejam exibir galerias de fotos organizadas por álbuns, receber contatos diretos de clientes e gerenciar tudo através de um painel de administração completo e intuitivo.

## 🚀 Tecnologias Utilizadas

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Biblioteca UI:** [React 18](https://react.dev/)
- **Galerias de Imagens:** [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) e [react-masonry-css](https://www.npmjs.com/package/react-masonry-css)
- **Drag and Drop (Painel Admin):** [@dnd-kit/core](https://dndkit.com/)
- **Requisições HTTP:** Axios
- **Notificações:** React Hot Toast

### Backend
- **Ambiente:** [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)
- **Banco de Dados:** PostgreSQL (via pacote `pg`) - Recomendado: [Neon](https://neon.tech/)
- **Armazenamento de Imagens:** [Cloudinary](https://cloudinary.com/)
- **Autenticação:** JWT (JSON Web Tokens) e Bcryptjs
- **Upload de Arquivos:** Multer
- **Envio de E-mails:** Nodemailer
- **Segurança:** Helmet e Express Rate Limit

---

## 📁 Estrutura do Projeto

O repositório está dividido em duas partes principais (Monorepo):

- `/frontend`: Aplicação web voltada para o cliente final e o painel de administração.
- `/backend`: API RESTful responsável por gerenciar as requisições, banco de dados e integrações (Cloudinary, E-mails).

---

## ⚙️ Como Configurar e Executar (Localmente)

### 1. Pré-requisitos
- **Node.js** (v18 ou superior)
- Conta no **Cloudinary** (para hospedar as fotos)
- Conta no **Neon** (ou qualquer banco PostgreSQL)
- Conta no Gmail (para envio de emails via Nodemailer, usando uma *App Password*)

### 2. Configurando o Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na pasta `backend` baseado no arquivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Preencha as variáveis de ambiente no `.env` (Banco de Dados, Cloudinary, E-mail, Segredos JWT).
5. Crie as tabelas no banco de dados rodando a migração inicial:
   ```bash
   npm run migrate
   ```
6. Crie o seu primeiro usuário administrador (Substitua pelos seus dados):
   ```bash
   node criar_admin.js seu_email@gmail.com SuaSenhaForte123
   ```
7. Inicie o servidor:
   ```bash
   npm run dev
   ```

O backend estará rodando em `http://localhost:3001`.

### 3. Configurando o Frontend

1. Em um novo terminal, navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na pasta `frontend`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_WHATSAPP=5511999999999
   NEXT_PUBLIC_SITE_NAME="Lumina Fotografia"
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O frontend estará rodando em `http://localhost:3000`. Acesse o painel de administração em `http://localhost:3000/admin/login`.

---

## 🎨 Personalização

O sistema foi desenhado para ser facilmente personalizável:
- **Cores e Estilos:** Edite o arquivo `frontend/src/styles/globals.css` para alterar a paleta de cores (modo claro e escuro).
- **Favicon / Ícone:** O arquivo `frontend/src/app/icon.js` gera o ícone dinamicamente. Edite-o para refletir a inicial ou logotipo do fotógrafo.
- **Textos:** Modifique o `NEXT_PUBLIC_SITE_NAME` no seu `.env` do frontend para o nome do fotógrafo/empresa.

---

## 🔒 Segurança e Dados Sensíveis

**Aviso:** Certifique-se de que os seus arquivos `.env` e `.env.local` estejam adicionados no seu `.gitignore` antes de publicar este projeto em um repositório público (eles já vêm ignorados por padrão neste template). Nunca faça commit das suas chaves de API, senhas ou strings de conexão.

## 📄 Licença

Este projeto é *Open Source* e pode ser adaptado para suas necessidades, servindo como uma excelente base para criar portfólios profissionais e modernos.
