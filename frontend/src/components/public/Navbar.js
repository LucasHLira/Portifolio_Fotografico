// src/components/public/Navbar.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/',        label: 'Início' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/contato', label: 'Contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha menu mobile ao navegar
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileOpen ? 'navbar-mobile-open' : ''}`}
      aria-label="Navegação principal"
    >
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo" aria-label="Ir para página inicial">
          Kauã<span>.</span>
        </Link>

        <ul className="navbar-links" role="list">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contato" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
              Solicitar Orçamento
            </Link>
          </li>
        </ul>

        {/* Hamburguer — mobile */}
        <button
          className="btn btn-ghost"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          style={{ display: 'none', '@media(maxWidth:768px)': { display: 'flex' } }}
          id="hamburger-btn"
        >
          <span style={{
            display: 'block', width: 22, height: 2,
            background: 'currentColor', borderRadius: 2,
            boxShadow: mobileOpen
              ? 'none'
              : '0 6px 0 currentColor, 0 12px 0 currentColor',
            transition: 'all 0.3s',
          }} />
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          #hamburger-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
