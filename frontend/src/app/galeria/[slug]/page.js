// src/app/galeria/[slug]/page.js — Página individual de álbum
// SSG com ISR — gerada estaticamente e atualizada via revalidação

import Navbar from '@/components/public/Navbar';
import MasonryGallery from '@/components/public/MasonryGallery';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Gera as páginas estáticas para todos os álbuns no momento do build
// O Next.js chama essa função e gera uma página HTML para cada slug
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/albums/slugs`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// Metadata dinâmica por álbum — crucial para SEO de fotografia
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_URL}/albums/${params.slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'Álbum não encontrado' };

    const { data: album } = await res.json();
    return {
      title: album.titulo,
      description: album.descricao || `Álbum de ${album.categoria || 'fotografia'} por Kauã Fotografia.`,
      openGraph: {
        title: `${album.titulo} — Kauã Fotografia`,
        description: album.descricao,
        images: album.capa_url ? [{ url: album.capa_url, alt: album.titulo }] : [],
        type: 'article',
      },
    };
  } catch {
    return { title: 'Álbum' };
  }
}

async function getAlbum(slug) {
  try {
    const res = await fetch(`${API_URL}/albums/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function AlbumPage({ params }) {
  const album = await getAlbum(params.slug);

  // Se o álbum não existir, mostra página 404 nativa do Next.js
  if (!album) notFound();

  const { fotos = [] } = album;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        {/* Breadcrumb — ajuda no SEO e UX */}
        <div className="breadcrumb">
          <div className="container">
            <nav aria-label="Caminho de navegação">
              <Link href="/">Início</Link>
              <span aria-hidden="true"> / </span>
              <Link href="/galeria">Galeria</Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{album.titulo}</span>
            </nav>
          </div>
        </div>

        <section className="section">
          <div className="container">
            {/* Cabeçalho do álbum */}
            <div className="album-header">
              {album.categoria && (
                <span className="section-tag">{album.categoria}</span>
              )}
              <h1 className="heading-lg">{album.titulo}</h1>
              {album.descricao && (
                <p className="album-desc">{album.descricao}</p>
              )}
              <div className="album-meta">
                <span>{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Galeria Masonry */}
            <MasonryGallery fotos={fotos} />

            {/* Navegação de volta */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link href="/galeria" className="btn btn-outline">
                ← Ver todos os álbuns
              </Link>
            </div>
          </div>
        </section>
      </main>


    </>
  );
}
