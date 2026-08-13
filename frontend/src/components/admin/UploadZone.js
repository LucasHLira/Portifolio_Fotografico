// src/components/admin/UploadZone.js
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { fotosApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { FolderUp, Upload } from 'lucide-react';

export default function UploadZone({ albumId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const novos = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviews((prev) => [...prev, ...novos]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 20,
  });

  const removerPreview = (index) => {
    URL.revokeObjectURL(previews[index].preview); // Libera memória
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (previews.length === 0) return toast.error('Selecione ao menos uma foto.');
    if (!albumId) return toast.error('Selecione um álbum antes de fazer upload.');

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('album_id', albumId);
    previews.forEach(({ file }) => formData.append('fotos', file));

    try {
      await fotosApi.upload(formData, (prog) => setProgress(prog));
      toast.success(`${previews.length} foto(s) enviada(s) com sucesso!`);
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
      setPreviews([]);
      onUploadComplete?.();
    } catch (err) {
      toast.error(err?.error || 'Erro ao fazer upload.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="upload-container">
      {/* Drop zone */}
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} id="upload-input" />
        <div style={{ pointerEvents: 'none' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <FolderUp size={48} color="var(--text-secondary)" strokeWidth={1.5} />
          </div>
          {isDragActive ? (
            <p style={{ color: 'var(--cyan)', fontWeight: 500 }}>Solte as fotos aqui!</p>
          ) : (
            <>
              <p style={{ fontWeight: 500, marginBottom: '0.3rem' }}>Arraste as fotos aqui</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                ou <span style={{ color: 'var(--cyan)' }}>clique para selecionar</span> — JPG, PNG, WebP até 20MB cada
              </p>
            </>
          )}
        </div>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="preview-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {previews.length} foto{previews.length !== 1 ? 's' : ''} selecionada{previews.length !== 1 ? 's' : ''}
            </span>
            <button onClick={() => setPreviews([])} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
              Limpar tudo
            </button>
          </div>

          <div className="preview-grid">
            {previews.map((p, i) => (
              <div key={i} className="preview-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  className="preview-remove"
                  onClick={() => removerPreview(i)}
                  aria-label={`Remover ${p.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Barra de progresso */}
          {uploading && (
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                Enviando... {progress}%
              </span>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading}
            style={{ marginTop: '1.25rem', width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
          >
            {uploading ? `Enviando ${progress}%...` : (
              <>
                <Upload size={16} /> Enviar {previews.length} foto{previews.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .upload-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .preview-area {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
        }
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
        }
        .preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .preview-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .preview-remove:hover { background: rgba(220,50,50,0.9); }
        .progress-bar-wrap {
          margin-top: 1rem;
          height: 6px;
          background: var(--bg-card);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--blue), var(--cyan));
          border-radius: 3px;
          transition: width 0.3s;
        }
      `}</style>
    </div>
  );
}
