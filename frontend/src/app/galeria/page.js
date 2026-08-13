// src/app/galeria/page.js — Listagem de todos os álbuns

import Navbar from '@/components/public/Navbar';
import AlbumCard from '@/components/public/AlbumCard';
import { Camera } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const metadata = {
  title: 'Galeria de Fotografias',
  description: 'Explore a galeria completa de Kauã Fotografia: casamentos, ensaios e natureza em alta qualidade.',
  openGraph: {
    title: 'Galeria — Kauã Fotografia',
    description: 'Explore todos os álbuns de Kauã Fotografia.',
  },
};

const CATEGORIAS = ['Todos', 'Casamentos', 'Ensaios', 'Natureza'];

async function getAlbums() {
  try {
    const res = await fetch(`${API_URL}/albums`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function GaleriaPage({ searchParams }) {
  const albums = await getAlbums();
  const categoriaAtiva = searchParams?.categoria || 'Todos';

  const albumsFiltrados = categoriaAtiva === 'Todos'
    ? albums
    : albums.filter((a) => a.categoria === categoriaAtiva);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        <section className="section">
          <div className="container">
            {/* Cabeçalho */}
            <div className="section-header">
              <span className="section-tag">Portfólio</span>
              <h1 className="heading-lg text-gradient">Galeria Completa</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                {albums.length} álbum{albums.length !== 1 ? 's' : ''} disponíve{albums.length !== 1 ? 'is' : 'l'}
              </p>
              <div className="section-divider" />
            </div>

            {/* Filtros de categoria */}
            <div className="categoria-filters" role="tablist" aria-label="Filtrar por categoria">
              {CATEGORIAS.map((cat) => {
                const ativa = cat === categoriaAtiva;
                const count = cat === 'Todos' ? albums.length : albums.filter((a) => a.categoria === cat).length;
                return (
                  <a
                    key={cat}
                    href={cat === 'Todos' ? '/galeria' : `/galeria?categoria=${encodeURIComponent(cat)}`}
                    role="tab"
                    aria-selected={ativa}
                    className={`categoria-btn ${ativa ? 'active' : ''}`}
                  >
                    {cat} <span className="cat-count">{count}</span>
                  </a>
                );
              })}
            </div>

            {/* Grid de álbuns */}
            {albumsFiltrados.length > 0 ? (
              <div className="albums-grid">
                {albumsFiltrados.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Camera size={48} strokeWidth={1.5} />
                </div>
                <p>Nenhum álbum encontrado nessa categoria.</p>
              </div>
            )}
          </div>
        </section>
      </main>


    </>
  );
}
