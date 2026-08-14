'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { encerrarSessao } from '@/lib/auth';
import { FolderHeart, ImagePlus, LogOut, Globe } from 'lucide-react';

export default function AdminLayout({ children, ativo }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true); // Abre por padrão no PC
      } else {
        setIsOpen(false); // Fecha por padrão no celular
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    encerrarSessao();
    router.replace('/admin/login');
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Fecha a sidebar no mobile ao clicar fora
  const handleOverlayClick = () => {
    if (isMobile && isOpen) setIsOpen(false);
  };

  return (
    <div className="admin-container">
      {/* Topbar sempre visível para garantir o botão */}
      <header className="admin-header">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="admin-logo-mobile">
          Lumina<span>.</span> <small>Admin</small>
        </div>
      </header>

      {/* Overlay escuro para mobile */}
      {isMobile && isOpen && <div className="sidebar-overlay" onClick={handleOverlayClick} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="admin-sidebar-logo">
            Lumina<span>.</span> <small>Admin</small>
          </div>
          <button className="close-btn" onClick={toggleSidebar} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link href="/admin/albuns" className={`admin-sidebar-link ${ativo === 'albuns' ? 'active' : ''}`}>
            <FolderHeart size={18} /> Álbuns
          </Link>
          <Link href="/admin/fotos" className={`admin-sidebar-link ${ativo === 'fotos' ? 'active' : ''}`}>
            <ImagePlus size={18} /> Upload
          </Link>
          {/* <Link href="/admin/mensagens" className={`admin-sidebar-link ${ativo === 'mensagens' ? 'active' : ''}`}>✉️ Mensagens</Link> */}
        </nav>

        <div className="sidebar-footer">
          <a href="/" target="_blank" className="admin-sidebar-link" rel="noopener noreferrer">
            <Globe size={18} /> Ver site
          </a>
          <button onClick={logout} className="admin-sidebar-link logout-btn">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className={`admin-content ${isOpen && !isMobile ? 'shifted' : ''}`}>
        {children}
      </main>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        /* Header Superior */
        .admin-header {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(8, 12, 20, 0.95);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .menu-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .menu-btn:hover {
          background: var(--bg-surface);
          border-color: var(--cyan);
          color: var(--cyan);
        }

        .admin-logo-mobile {
          margin-left: 1rem;
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .admin-logo-mobile span { color: var(--cyan); }
        .admin-logo-mobile small {
          font-size: 0.6rem;
          font-family: var(--font-body);
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-left: 0.2rem;
        }

        /* Overlay Mobile */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(3px);
          z-index: 45;
        }

        /* Sidebar */
        .admin-sidebar {
          width: 260px;
          background: rgba(8, 12, 20, 0.98);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 50;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
        }
        
        .admin-sidebar.closed {
          transform: translateX(-100%);
        }
        .admin-sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .admin-sidebar-logo {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        .admin-sidebar-logo span { color: var(--cyan); }
        .admin-sidebar-logo small {
          display: block;
          font-size: 0.65rem;
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1rem;
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 50%;
          transition: var(--transition);
        }
        .close-btn:hover {
          background: var(--bg-surface);
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 1.5rem 1rem;
          overflow-y: auto;
        }

        .admin-sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition);
        }

        .admin-sidebar-link:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }

        .admin-sidebar-link.active {
          background: linear-gradient(135deg, rgba(0, 102, 255, 0.15), rgba(0, 212, 255, 0.08));
          color: var(--cyan);
          border: 1px solid var(--border);
        }

        .sidebar-footer {
          padding: 1.5rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .logout-btn {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
        }

        /* Conteúdo Principal */
        .admin-content {
          flex: 1;
          padding: 2rem clamp(1rem, 4vw, 3rem);
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 1024px) {
          .admin-content.shifted {
            margin-left: 260px;
          }
        }
      `}</style>
    </div>
  );
}
