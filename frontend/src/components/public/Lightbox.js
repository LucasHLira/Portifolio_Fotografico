// src/components/public/Lightbox.js
'use client';

import YARLightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';

// Importa os estilos CSS obrigatórios do yet-another-react-lightbox
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

export default function LightboxViewer({ slides = [], index, onClose }) {
  if (index < 0 || slides.length === 0) return null;

  return (
    <YARLightbox
      slides={slides}
      open={index >= 0}
      index={index}
      close={onClose}
      plugins={[Zoom, Thumbnails, Slideshow]}

      // Configurações de zoom
      zoom={{ maxZoomPixelRatio: 4 }}

      // Configurações de thumbnails (barra inferior)
      thumbnails={{
        position: 'bottom',
        width: 80,
        height: 56,
        border: 2,
        borderRadius: 4,
        gap: 8,
      }}

      // Estilo personalizado para combinar com o design do site
      styles={{
        container: {
          backgroundColor: 'rgba(4, 6, 12, 0.97)',
          backdropFilter: 'blur(10px)',
        },
        button: {
          color: 'rgba(240, 244, 255, 0.8)',
          filter: 'none',
        },
      }}

      // Animação suave
      animation={{ fade: 400, swipe: 350 }}

      // Controles
      carousel={{ finite: false, preload: 2 }}
    />
  );
}
