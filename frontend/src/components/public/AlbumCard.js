// src/components/public/AlbumCard.js
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, Heart, User, Leaf } from 'lucide-react';

const CategoriaIcon = ({ categoria }) => {
  switch (categoria) {
    case 'Casamentos': return <Heart size={14} />;
    case 'Ensaios': return <User size={14} />;
    case 'Natureza': return <Leaf size={14} />;
    default: return <Camera size={14} />;
  }
};

export default function AlbumCard({ album }) {
  return (
    <Link href={`/galeria/${album.slug}`} className="album-card" aria-label={`Ver álbum: ${album.titulo}`}>
      <div className="album-thumb">
        {album.capa_url ? (
          <Image
            src={album.capa_thumb || album.capa_url}
            alt={album.titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="album-thumb-placeholder">
            <Camera size={48} color="var(--text-secondary)" />
          </div>
        )}
        <div className="album-overlay" />
      </div>

      <div className="album-info">
        {album.categoria && (
          <span className="album-categoria">
            <CategoriaIcon categoria={album.categoria} /> {album.categoria}
          </span>
        )}
        <h3 className="album-titulo">{album.titulo}</h3>
        {album.descricao && (
          <p className="album-descricao">{album.descricao}</p>
        )}
      </div>

      <style jsx>{`
        .album-card {
          display: block;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
        }

        .album-card:hover {
          transform: translateY(-6px);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-glow);
        }

        .album-card:hover .album-overlay {
          opacity: 1;
        }

        .album-card:hover .album-thumb img {
          transform: scale(1.06);
        }

        .album-thumb {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: var(--bg-secondary);
        }

        .album-thumb :global(img) {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .album-thumb-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
        }

        .album-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 102, 255, 0.3) 0%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.4s;
        }

        .album-info {
          padding: 1.25rem 1.4rem 1.4rem;
        }

        .album-categoria {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 0.4rem;
        }

        .album-titulo {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
          line-height: 1.3;
        }

        .album-descricao {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Link>
  );
}
