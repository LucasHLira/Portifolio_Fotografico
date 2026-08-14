// src/app/layout.js
// Layout raiz — aplicado em todas as páginas do site público e admin

import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Lumina Fotografia';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: `${SITE_NAME} — Fotógrafo Profissional`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Portfólio de fotografia profissional. Casamentos, ensaios e natureza com sensibilidade e técnica.',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {/* Sistema de notificações toast — aparece no painel admin */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d1528',
              color: '#f0f4ff',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              borderRadius: '8px',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#00d4ff', secondary: '#0d1528' },
            },
          }}
        />
      </body>
    </html>
  );
}
