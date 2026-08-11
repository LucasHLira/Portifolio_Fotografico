// src/app/admin/fotos/page.js — Upload e Gestão de Fotos
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { albumsApi, fotosApi } from '@/lib/api';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import UploadZone from '@/components/admin/UploadZone';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { encerrarSessao } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function SidebarAdmin({ ativo }) {
  const router = useRouter();
  const logout = () => { encerrarSessao(); router.replace('/admin/login'); };
  return (
    <aside className="admin-sidebar">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, padding: '0 0.75rem 1.5rem', color: 'var(--text-primary)' }}>
        Kauã<span style={{ color: 'var(--cyan)' }}>.</span>
        <small style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Admin</small>
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Link href="/admin/albuns" className={`admin-sidebar-link ${ativo === 'albuns' ? 'active' : ''}`}>🗂️ Álbuns</Link>
        <Link href="/admin/fotos" className={`admin-sidebar-link ${ativo === 'fotos' ? 'active' : ''}`}>🖼️ Upload de Fotos</Link>
        <Link href="/admin/mensagens" className={`admin-sidebar-link ${ativo === 'mensagens' ? 'active' : ''}`}>✉️ Mensagens</Link>
      </nav>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <a href="/" target="_blank" className="admin-sidebar-link" rel="noopener noreferrer">🌐 Ver site</a>
        <button onClick={logout} className="admin-sidebar-link" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-secondary)' }}>🚪 Sair</button>
      </div>
    </aside>
  );
}

function FotosContent() {
  const searchParams = useSearchParams();
  const albumIdParam = searchParams.get('album');

  const [albums, setAlbums] = useState([]);
  const [albumSelecionado, setAlbumSelecionado] = useState(albumIdParam || '');
  const [fotos, setFotos] = useState([]);
  const [loadingFotos, setLoadingFotos] = useState(false);

  useEffect(() => {
    albumsApi.listarAdmin()
      .then((res) => setAlbums(res.data || []))
      .catch(() => toast.error('Erro ao carregar álbuns.'));
  }, []);

  useEffect(() => {
    if (!albumSelecionado) return;
    setLoadingFotos(true);
    fotosApi.listar(albumSelecionado)
      .then((res) => setFotos(res.data || []))
      .catch(() => toast.error('Erro ao carregar fotos.'))
      .finally(() => setLoadingFotos(false));
  }, [albumSelecionado]);

  const excluirFoto = async (foto) => {
    if (!confirm('Excluir esta foto? A imagem será removida do Cloudinary também.')) return;
    try {
      await fotosApi.excluir(foto.id);
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
      toast.success('Foto excluída.');
    } catch { toast.error('Erro ao excluir foto.'); }
  };

  return (
    <div className="admin-layout">
      <SidebarAdmin ativo="fotos" />
      <div className="admin-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.3rem' }}>Upload de Fotos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Selecione um álbum e faça upload das fotos</p>
        </div>

        {/* Seletor de álbum */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="album-select" style={{ marginBottom: '0.6rem', display: 'block' }}>
            Álbum de destino
          </label>
          <select
            id="album-select"
            className="form-input"
            value={albumSelecionado}
            onChange={(e) => setAlbumSelecionado(e.target.value)}
            style={{ maxWidth: 400 }}
          >
            <option value="">Selecione um álbum...</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.titulo} ({a.total_fotos} fotos)</option>
            ))}
          </select>
        </div>

        {/* Zona de upload */}
        {albumSelecionado && (
          <>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Adicionar fotos</h2>
              <UploadZone
                albumId={albumSelecionado}
                onUploadComplete={() => {
                  // Recarrega as fotos após upload
                  fotosApi.listar(albumSelecionado).then((res) => setFotos(res.data || []));
                }}
              />
            </div>

            {/* Grid de fotos existentes */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Fotos do álbum <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({fotos.length})</span>
                </h2>
              </div>

              {loadingFotos ? (
                <div className="fotos-grid">
                  {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 8 }} />)}
                </div>
              ) : fotos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Nenhuma foto neste álbum.</p>
              ) : (
                <div className="fotos-grid">
                  {fotos.map((foto) => (
                    <div key={foto.id} className="foto-admin-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={foto.thumbnail_url || foto.cloudinary_url}
                        alt={foto.alt_text || 'Foto'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div className="foto-admin-actions">
                        <button
                          onClick={() => excluirFoto(foto)}
                          className="btn"
                          style={{ background: 'rgba(220,50,50,0.85)', color: 'white', padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                          aria-label="Excluir foto"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!albumSelecionado && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👆</p>
            <p>Selecione um álbum acima para ver e gerenciar suas fotos.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .fotos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }
        .foto-admin-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-surface);
        }
        .foto-admin-actions {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .foto-admin-item:hover .foto-admin-actions { opacity: 1; }
      `}</style>
    </div>
  );
}

export default function FotosPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</div>}>
        <FotosContent />
      </Suspense>
    </ProtectedRoute>
  );
}
