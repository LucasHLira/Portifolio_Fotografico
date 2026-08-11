// src/app/admin/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { salvarSessao, estaLogado } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  // Se já estiver logado, redireciona para o painel
  useEffect(() => {
    if (estaLogado()) router.replace('/admin/albuns');
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.senha) return toast.error('Preencha email e senha.');

    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.senha);
      salvarSessao(res.token, res.admin);
      toast.success('Login realizado!');
      router.replace('/admin/albuns');
    } catch (err) {
      toast.error(err?.error || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card card">
        <div className="login-logo">
          Kauã<span>.</span>
          <small>Admin</small>
        </div>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
          Acesso restrito
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Painel administrativo do portfólio
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="admin@exemplo.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.senha}
              onChange={(e) => setForm((p) => ({ ...p, senha: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>← Voltar ao site público</a>
        </p>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,102,255,0.12) 0%, transparent 70%);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
        }
        .login-logo {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        .login-logo span { color: var(--cyan); }
        .login-logo small {
          display: block;
          font-size: 0.7rem;
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: -0.25rem;
        }
      `}</style>
    </main>
  );
}
