// src/components/public/MasonryGallery.js
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import LightboxViewer from './Lightbox';

// Breakpoints da galeria masonry (colunas por largura de tela)
const breakpoints = {
  default: 3,
  1100: 3,
  768:  2,
  480:  1,
};

export default function MasonryGallery({ fotos = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1); // -1 = fechado

  const abrirLightbox = useCallback((index) => {
    setLightboxIndex(index);
  }, []);

  const fecharLightbox = useCallback(() => {
    setLightboxIndex(-1);
  }, []);

  if (fotos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
        <p>Nenhuma foto neste álbum ainda.</p>
      </div>
    );
  }

  // Formata as fotos para o formato esperado pelo Lightbox
  const slides = fotos.map((foto) => ({
    src: foto.cloudinary_url,
    alt: foto.alt_text || 'Fotografia',
    // yet-another-react-lightbox suporta múltiplos srcSet
    srcSet: [
      { src: foto.thumbnail_url, width: 600 },
      { src: foto.cloudinary_url, width: 1200 },
    ],
  }));

  return (
    <>
      <Masonry
        breakpointCols={breakpoints}
        className="masonry-grid"
        columnClassName="masonry-column"
      >
        {fotos.map((foto, index) => (
          <div
            key={foto.id}
            className="masonry-item"
            onClick={() => abrirLightbox(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && abrirLightbox(index)}
            aria-label={`Abrir foto: ${foto.alt_text || `Foto ${index + 1}`}`}
          >
            <Image
              src={foto.thumbnail_url || foto.cloudinary_url}
              alt={foto.alt_text || 'Fotografia'}
              width={600}
              height={400}
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px',
              }}
              // Lazy loading nativo — imagens fora da viewport não são carregadas
              loading="lazy"
            />
            <div className="masonry-item-overlay" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                <path d="M11 8v6M8 11h6"/>
              </svg>
            </div>
          </div>
        ))}
      </Masonry>

      <LightboxViewer
        slides={slides}
        index={lightboxIndex}
        onClose={fecharLightbox}
      />

      <style jsx global>{`
        .masonry-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          cursor: zoom-in;
          margin-bottom: 1rem;
          border: 1px solid var(--border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--bg-surface);
        }

        .masonry-item:hover {
          border-color: var(--border-hover);
          transform: scale(1.01);
          box-shadow: var(--shadow-glow);
        }

        .masonry-item:hover .masonry-item-overlay {
          opacity: 1;
        }

        .masonry-item-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}
