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
import AdminLayout from '@/components/admin/AdminLayout';
import { Trash2, MousePointerClick, Star } from 'lucide-react';



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
    } catch (err) {
      toast.error('Erro ao excluir foto.');
      console.error(err);
    }
  };

  const definirComoCapa = async (foto) => {
    try {
      const data = {
        capa_url: foto.cloudinary_url,
        capa_thumb: foto.thumbnail_url,
        capa_cloudinary_id: foto.cloudinary_id
      };
      await albumsApi.definirCapa(albumSelecionado, data);
      toast.success('Capa do álbum atualizada!');
    } catch (err) {
      toast.error('Erro ao definir capa.');
      console.error(err);
    }
  };

  return (
    <AdminLayout ativo="fotos">
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
                    <div className="foto-admin-actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={() => definirComoCapa(foto)}
                        className="btn"
                        style={{ background: 'rgba(255,255,255,0.9)', color: '#0d1528', padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        aria-label="Definir como Capa"
                      >
                        <Star size={14} fill="currentColor" /> Capa
                      </button>
                      <button
                        onClick={() => excluirFoto(foto)}
                        className="btn"
                        style={{ background: 'rgba(220,50,50,0.85)', color: 'white', padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        aria-label="Excluir foto"
                      >
                        <Trash2 size={14} /> Excluir
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <MousePointerClick size={48} strokeWidth={1.5} />
          </div>
          <p>Selecione um álbum acima para ver e gerenciar suas fotos.</p>
        </div>
      )}
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
    </AdminLayout>
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
