# Portfólio Fotográfico - Kauã

Um portfólio fotográfico completo e dinâmico, composto por um frontend moderno em Next.js e uma API robusta em Node.js. Este sistema permite a exibição de galerias de fotos organizadas por álbuns, contato direto com clientes e um painel de administração completo para gerenciamento de conteúdo.

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
- **Banco de Dados:** PostgreSQL (via pacote `pg`) hospedado no [Neon](https://neon.tech/)
- **Armazenamento de Imagens:** [Cloudinary](https://cloudinary.com/)
- **Autenticação:** JWT (JSON Web Tokens) e Bcryptjs
- **Upload de Arquivos:** Multer
- **Envio de E-mails:** Nodemailer
- **Segurança:** Helmet e Express Rate Limit

---

## 📁 Estrutura do Projeto

O repositório está dividido em duas partes principais (Monorepo):

- `/frontend`: Contém a interface visual pública (Home, Galeria, Contato) e o Painel de Administração (`/admin`).
- `/backend`: Contém a API RESTful que gerencia o banco de dados, upload de imagens e envio de e-mails.

---

## 🛠️ Como rodar o projeto localmente

### Pré-requisitos
- Node.js (v18 ou superior)
- PostgreSQL local ou remoto (como o Neon.tech)
- Conta no Cloudinary

### 1. Configurando o Backend

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na pasta `backend` baseando-se no arquivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Preencha as informações do banco de dados (DATABASE_URL), chaves do Cloudinary, credenciais de e-mail e crie um JWT_SECRET seguro.*
4. Rode as migrações para criar as tabelas no banco de dados:
   ```bash
   npm run migrate
   ```
5. Inicie o servidor:
   ```bash
   npm run dev
   ```
   *O backend rodará por padrão em `http://localhost:3001`.*

### 2. Configurando o Frontend

1. Entre na pasta do frontend:
   ```bash
   cd ../frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` na pasta `frontend` e adicione a URL da sua API (caso necessário, verifique a porta que o backend está rodando):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
4. Inicie o servidor frontend:
   ```bash
   npm run dev
   ```
   *O frontend rodará por padrão em `http://localhost:3000`.*

---

## 🌐 Hospedagem / Deploy

Recomendamos a seguinte arquitetura gratuita e eficiente:
1. **Frontend:** [Vercel](https://vercel.com/) (Suporte nativo a Next.js)
2. **Backend:** [Render](https://render.com/) (Web Service Node.js)
3. **Banco de Dados:** [Neon.tech](https://neon.tech/) ou Supabase (PostgreSQL)

*(Lembre-se de configurar as variáveis de ambiente em ambos os serviços na nuvem conforme os seus arquivos `.env` locais).*

## 🔒 Painel de Administração

O acesso ao painel de administração é feito através da rota `/admin`.
Nele, o administrador pode criar novos álbuns, fazer upload de novas fotografias, reorganizar a ordem de exibição e gerenciar o conteúdo do site em tempo real.
