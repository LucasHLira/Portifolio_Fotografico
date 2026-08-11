// src/components/admin/ProtectedRoute.js
// Componente client-side que verifica se o admin está logado
// Se não estiver, redireciona para /admin/login

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { estaLogado } from '@/lib/auth';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    if (!estaLogado()) {
      router.replace('/admin/login');
    } else {
      setVerificado(true);
    }
  }, [router]);

  if (!verificado) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text-secondary)', fontSize: '0.9rem',
      }}>
        <span>Verificando autenticação...</span>
      </div>
    );
  }

  return children;
}
