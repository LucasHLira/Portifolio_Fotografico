// src/app/admin/albuns/page.js — Gestão de Álbuns
'use client';

import { useState, useEffect } from 'react';
import { albumsApi } from '@/lib/api';
import { encerrarSessao } from '@/lib/auth';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { FolderOpen, Camera, Images, Edit2, Trash2 } from 'lucide-react';

const CATEGORIAS = ['Casamentos', 'Ensaios', 'Natureza', 'Outro'];



function ModalAlbum({ album, onClose, onSave }) {
  const [form, setForm] = useState({
    titulo: album?.titulo || '',
    categoria: album?.categoria || '',
    descricao: album?.descricao || '',
    publicado: album?.publicado ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo) return toast.error('Título é obrigatório.');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));

      if (album?.id) {
        await albumsApi.editar(album.id, formData);
        toast.success('Álbum atualizado!');
      } else {
        await albumsApi.criar(formData);
        toast.success('Álbum criado!');
      }
      onSave();
    } catch (err) {
      toast.error(err?.error || 'Erro ao salvar álbum.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {album?.id ? 'Editar Álbum' : 'Novo Álbum'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost" aria-label="Fechar">✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="alb-titulo">Título *</label>
            <input id="alb-titulo" className="form-input" placeholder="Ex: Casamento João & Maria" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="alb-cat">Categoria</label>
            <select id="alb-cat" className="form-input" value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}>
              <option value="">Sem categoria</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="alb-desc">Descrição</label>
            <textarea id="alb-desc" className="form-input" placeholder="Breve descrição do álbum..." value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={3} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.publicado} onChange={(e) => setForm((p) => ({ ...p, publicado: e.target.checked }))} />
            Publicado (visível no site)
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .modal-box { padding: 1.75rem; width: 100%; max-width: 480px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}

export default function AlbunsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {} (novo) | {album} (editar)

  const carregarAlbums = async () => {
    setLoading(true);
    try {
      const res = await albumsApi.listarAdmin();
      setAlbums(res.data || []);
    } catch { toast.error('Erro ao carregar álbuns.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarAlbums(); }, []);

  const excluir = async (album) => {
    if (!confirm(`Excluir "${album.titulo}" e todas as suas fotos? Essa ação não pode ser desfeita.`)) return;
    try {
      await albumsApi.excluir(album.id);
      toast.success('Álbum excluído.');
      carregarAlbums();
    } catch { toast.error('Erro ao excluir álbum.'); }
  };

  return (
    <ProtectedRoute>
      <AdminLayout ativo="albuns">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Álbuns</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{albums.length} álbum{albums.length !== 1 ? 's' : ''} cadastrado{albums.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({})}>+ Novo Álbum</button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}
          </div>
        ) : albums.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <FolderOpen size={48} strokeWidth={1.5} />
            </div>
            <p>Nenhum álbum criado. Comece agora!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {albums.map((album) => (
              <div key={album.id} className="card album-row">
                <div className="album-row-info">
                  <div className="album-row-thumb">
                    {album.capa_thumb
                      ? <img src={album.capa_thumb} alt={album.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Camera size={24} color="var(--text-secondary)" />
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{album.titulo}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {album.categoria && <span style={{ color: 'var(--cyan)', marginRight: '0.75rem' }}>{album.categoria}</span>}
                      {album.total_fotos} foto{album.total_fotos !== 1 ? 's' : ''}
                      {!album.publicado && <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>· Oculto</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/admin/fotos?album=${album.id}`} className="btn btn-ghost" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Images size={14} /> Fotos</Link>
                  <button className="btn btn-ghost" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => setModal(album)}><Edit2 size={14} /> Editar</button>
                  <button className="btn btn-ghost" style={{ fontSize: '0.82rem', color: '#ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => excluir(album)} aria-label="Excluir"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>

      {modal !== null && (
        <ModalAlbum
          album={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); carregarAlbums(); }}
        />
      )}

      <style jsx global>{`
        .album-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.1rem;
          border-radius: 10px;
          gap: 1rem;
        }
        .album-row-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .album-row-thumb {
          width: 52px; height: 52px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-secondary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </ProtectedRoute>
  );
}
