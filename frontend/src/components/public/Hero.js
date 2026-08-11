// src/components/public/Hero.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Ícone de seta para baixo (SVG inline — sem dependências)
function ArrowDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

export default function Hero({ fotos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Slideshow automático das fotos em destaque
  useEffect(() => {
    if (fotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % fotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [fotos.length]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fotoAtual = fotos[currentIndex];

  return (
    <section className="hero" aria-label="Seção principal">
      {/* Imagem de fundo com crossfade */}
      <div className="hero-bg" aria-hidden="true">
        {fotos.map((foto, i) => (
          <div
            key={foto.id}
            className={`hero-slide ${i === currentIndex ? 'active' : ''}`}
          >
            <Image
              src={foto.cloudinary_url}
              alt={foto.alt_text || 'Fotografia em destaque'}
              fill
              priority={i === 0}
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}

        {/* Overlay gradiente — garante legibilidade do texto sobre qualquer foto */}
        <div className="hero-overlay" />
      </div>

      {/* Conteúdo */}
      <div className="container hero-content">
        <div className={loaded ? 'animate-fade-up' : ''} style={{ opacity: loaded ? undefined : 0 }}>
          <p className="section-tag delay-1 animate-fade-up">Fotografia Profissional</p>
          <h1 className="heading-xl delay-2 animate-fade-up" style={{ maxWidth: '700px', marginBottom: '1.25rem' }}>
            Momentos que<br />
            <span className="text-gradient">ficam para sempre</span>
          </h1>
          <p className="delay-3 animate-fade-up" style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '480px',
            marginBottom: '2.5rem',
            lineHeight: 1.7,
          }}>
            Casamentos, ensaios e natureza capturados com sensibilidade, técnica e alma.
          </p>

          <div className="delay-4 animate-fade-up" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/galeria" className="btn btn-primary">
              Ver Galeria Completa
            </Link>
            <Link href="/contato" className="btn btn-outline">
              Solicitar Orçamento
            </Link>
          </div>
        </div>

        {/* Indicadores do slideshow */}
        {fotos.length > 1 && (
          <div className="hero-dots" role="tablist" aria-label="Fotos em destaque">
            {fotos.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Foto ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`hero-dot ${i === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Indicador de scroll */}
      <a href="#featured" className="hero-scroll-hint" aria-label="Rolar para ver mais">
        <ArrowDown />
      </a>

      <style jsx>{`
        .hero {
          position: relative;
          height: 100svh;
          min-height: 600px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s ease;
        }

        .hero-slide.active {
          opacity: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(8, 12, 20, 0.75) 0%,
            rgba(8, 12, 20, 0.35) 60%,
            rgba(8, 12, 20, 0.6) 100%
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          padding-top: var(--nav-height);
        }

        .hero-dots {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.6rem;
          z-index: 3;
        }

        .hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }

        .hero-dot.active {
          width: 24px;
          border-radius: 3px;
          background: var(--cyan);
        }

        .hero-scroll-hint {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          z-index: 3;
          color: rgba(255, 255, 255, 0.4);
          animation: bounce 2s infinite;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .hero-scroll-hint:hover {
          color: var(--cyan);
          border-color: var(--cyan);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
      `}</style>
    </section>
  );
}
