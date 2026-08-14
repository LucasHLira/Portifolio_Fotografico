// src/app/page.js — Página Home
// Esta página é SSG (gerada no build) com ISR de 1 hora

import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import AlbumCard from '@/components/public/AlbumCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Metadata da página (SEO)
export const metadata = {
  title: 'Lumina Fotografia — Fotógrafo Profissional',
  description: 'Portfólio de fotografia profissional especializado em casamentos, ensaios e natureza. Imagens que contam sua história.',
  openGraph: {
    title: 'Lumina Fotografia',
    description: 'Fotógrafo profissional especializado em casamentos, ensaios e natureza.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

// Busca dados no servidor (SSG/ISR) — SEO perfeito
async function getDados() {
  try {
    // Busca álbuns e as primeiras fotos de destaque em paralelo
    const [albumsRes] = await Promise.all([
      fetch(`${API_URL}/albums`, { next: { revalidate: 3600 } }), // revalida a cada 1h
    ]);

    if (!albumsRes.ok) return { albums: [], fotosDestaque: [] };

    const albumsData = await albumsRes.json();
    const albums = albumsData.data || [];

    // Pega até 5 fotos de capa dos álbuns como slideshow do hero
    const fotosDestaque = albums
      .filter((a) => a.capa_url)
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        cloudinary_url: a.capa_url,
        thumbnail_url: a.capa_thumb || a.capa_url,
        alt_text: a.titulo,
      }));

    return { albums, fotosDestaque };
  } catch (err) {
    console.error('Erro ao buscar dados da home:', err);
    return { albums: [], fotosDestaque: [] };
  }
}

export default async function HomePage() {
  const { albums, fotosDestaque } = await getDados();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero com slideshow das melhores fotos */}
        <Hero fotos={fotosDestaque} />

        {/* Seção de Álbuns em Destaque */}
        <section className="section" id="featured" aria-labelledby="albuns-titulo">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Galeria</span>
              <h2 className="heading-lg" id="albuns-titulo">
                Explore os <span className="text-gradient">álbuns</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', maxWidth: 480, margin: '0.75rem auto 0' }}>
                Cada álbum conta uma história única. Navegue e encontre inspiração.
              </p>
              <div className="section-divider" />
            </div>

            {albums.length > 0 ? (
              <div className="albums-grid">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                <p>Em breve novos trabalhos. Volte logo!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA — Seção de Contato */}
        <section className="section cta-section" aria-labelledby="cta-titulo">
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="section-tag">Vamos trabalhar juntos</span>
            <h2 className="heading-lg" id="cta-titulo" style={{ marginBottom: '1rem' }}>
              Pronto para <span className="text-gradient">eternizar</span><br />seu momento?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 2.5rem' }}>
              Entre em contato e vamos conversar sobre como transformar seus momentos especiais em arte.
            </p>
            <a href="/contato" className="btn btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>
              Solicitar Orçamento
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Lumina Fotografia. Todos os direitos reservados.</p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Feito com ❤️ e muita luz natural
          </p>
        </div>
      </footer>


    </>
  );
}
