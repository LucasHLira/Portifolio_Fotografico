// src/lib/api.js
// Centraliza todas as chamadas para o backend
// Usar este arquivo em vez de fetch() diretamente em cada componente

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s — upload pode demorar
});

// Interceptor: injeta o JWT em todas as requisições automaticamente
// O token é salvo no localStorage quando o admin faz login
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor: redireciona para login se o token expirar (401)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminPage = window.location.pathname.startsWith('/admin');
      if (isAdminPage && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ─── Álbuns ──────────────────────────────────────────────────────────────────
export const albumsApi = {
  listar:       ()           => api.get('/albums'),
  listarAdmin:  ()           => api.get('/albums/admin/all'),
  buscarPorSlug:(slug)       => api.get(`/albums/${slug}`),
  listarSlugs:  ()           => api.get('/albums/slugs'),
  criar:        (formData)   => api.post('/albums', formData),
  editar:       (id, data)   => api.put(`/albums/${id}`, data),
  excluir:      (id)         => api.delete(`/albums/${id}`),
  reordenar:    (ordem)      => api.patch('/albums/reorder', { ordem }),
  definirCapa:  (id, data)   => api.patch(`/albums/${id}/capa`, data),
};

// ─── Fotos ───────────────────────────────────────────────────────────────────
export const fotosApi = {
  listar:    (albumId) => api.get(`/photos?album_id=${albumId}`),
  upload:    (formData, onProgress) =>
    api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    }),
  editar:    (id, data) => api.put(`/photos/${id}`, data),
  excluir:   (id)       => api.delete(`/photos/${id}`),
  reordenar: (ordem)    => api.patch('/photos/reorder', { ordem }),
};

// ─── Mensagens ───────────────────────────────────────────────────────────────
export const mensagensApi = {
  enviar:          (data)       => api.post('/messages', data),
  listar:          (status)     => api.get('/messages' + (status ? `?status=${status}` : '')),
  atualizarStatus: (id, status) => api.patch(`/messages/${id}/status`, { status }),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
};

export default api;
