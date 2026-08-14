// src/app/contato/page.js

import Navbar from '@/components/public/Navbar';
import ContactForm from '@/components/public/ContactForm';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5511999999999';

export const metadata = {
  title: 'Contato e Orçamento',
  description: 'Entre em contato para solicitar orçamento de fotografia de casamentos, ensaios e mais. Resposta rápida via e-mail ou WhatsApp.',
  openGraph: {
    title: 'Contato — Lumina Fotografia',
    description: 'Solicite um orçamento personalizado para sua sessão fotográfica.',
  },
};

export default function ContatoPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        <section className="section">
          <div className="container">
            <div className="contato-layout">
              {/* Coluna esquerda — info */}
              <div className="contato-info">
                <span className="section-tag">Fale comigo</span>
                <h1 className="heading-lg">
                  Vamos criar algo<br />
                  <span className="text-gradient">incrível juntos</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '1rem', marginBottom: '2rem' }}>
                  Cada sessão é única. Me conte sobre seu projeto e criaremos juntos a proposta perfeita para eternizar seus momentos.
                </p>

                {/* Cards de contato direto */}
                <div className="contato-cards">
                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contato-card"
                    aria-label="Contato pelo WhatsApp"
                  >
                    <span className="contato-icon">💬</span>
                    <div>
                      <div className="contato-card-label">WhatsApp</div>
                      <div className="contato-card-value">Resposta rápida</div>
                    </div>
                  </a>

                  <div className="contato-card">
                    <span className="contato-icon">📍</span>
                    <div>
                      <div className="contato-card-label">Localização</div>
                      <div className="contato-card-value">São Paulo, SP e região</div>
                    </div>
                  </div>

                  <div className="contato-card">
                    <span className="contato-icon">⏱️</span>
                    <div>
                      <div className="contato-card-label">Resposta</div>
                      <div className="contato-card-value">Em até 24 horas</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna direita — formulário */}
              <div className="card contato-form-card">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.75rem', fontFamily: 'var(--font-body)' }}>
                  Enviar mensagem
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>


    </>
  );
}
