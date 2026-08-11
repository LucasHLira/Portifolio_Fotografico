// src/lib/auth.js
// Helpers para gerenciamento do JWT no lado do cliente (painel admin)

const TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_data';

export function salvarSessao(token, admin) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function obterToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function obterAdmin() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(ADMIN_KEY);
  return data ? JSON.parse(data) : null;
}

export function estaLogado() {
  const token = obterToken();
  if (!token) return false;

  // Verifica se o token expirou sem chamar o backend
  // O payload do JWT é a segunda parte separada por ponto, em base64
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now(); // exp é em segundos, Date.now() em ms
  } catch {
    return false;
  }
}

export function encerrarSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}
