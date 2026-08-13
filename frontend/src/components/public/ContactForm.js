// src/components/public/ContactForm.js
'use client';

import { useState } from 'react';
import { mensagensApi } from '@/lib/api';
import toast from 'react-hot-toast';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5511999999999';

const tiposServico = [
  'Casamento',
  'Pré-Wedding',
  'Ensaio de Casal',
  'Ensaio Feminino',
  'Newborn',
  'Natureza / Paisagem',
  'Evento Corporativo',
  'Outro',
];

export default function ContactForm() {
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', tipo_servico: '', mensagem: '',
  });
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.mensagem) {
      toast.error('Preencha nome, email e mensagem.');
      return;
    }

    setLoading(true);
    try {
      await mensagensApi.enviar(form);
      setEnviado(true);
      toast.success('Mensagem enviada! Retornarei em breve.');
    } catch (err) {
      toast.error(err?.error || 'Erro ao enviar. Tente pelo WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = () => {
    const texto = encodeURIComponent(
      `Olá! Vi seu portfólio e gostaria de solicitar um orçamento para ${form.tipo_servico || 'um ensaio fotográfico'}.${form.nome ? `\n\nMeu nome é ${form.nome}.` : ''}`
    );
    return `https://wa.me/${WHATSAPP}?text=${texto}`;
  };

  if (enviado) {
    return (
      <div className="contact-success">
        <div className="success-icon">✅</div>
        <h3>Mensagem recebida!</h3>
        <p>Obrigado, <strong>{form.nome}</strong>! Retornarei o seu contato em até 24h.</p>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
          💬 Também me encontre no WhatsApp
        </a>
        <style jsx>{`
          .contact-success {
            text-align: center;
            padding: 3rem 2rem;
          }
          .success-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          p {
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="cf-nome">Nome completo *</label>
          <input
            id="cf-nome"
            name="nome"
            type="text"
            className="form-input"
            placeholder="Seu nome"
            value={form.nome}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cf-email">E-mail *</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            className="form-input"
            placeholder="seu@email.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="cf-telefone">Telefone / WhatsApp</label>
          <input
            id="cf-telefone"
            name="telefone"
            type="tel"
            className="form-input"
            placeholder="(11) 99999-9999"
            value={form.telefone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cf-tipo">Tipo de serviço</label>
          <select
            id="cf-tipo"
            name="tipo_servico"
            className="form-input"
            value={form.tipo_servico}
            onChange={handleChange}
            style={{ cursor: 'pointer' }}
          >
            <option value="">Selecione...</option>
            {tiposServico.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cf-mensagem">Mensagem *</label>
        <textarea
          id="cf-mensagem"
          name="mensagem"
          className="form-input"
          placeholder="Conte um pouco sobre o que você tem em mente: data, local, número de pessoas..."
          value={form.mensagem}
          onChange={handleChange}
          required
          rows={5}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 180 }}>
          {loading ? 'Enviando...' : '✉️ Enviar Mensagem'}
        </button>

        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          💬 WhatsApp
        </a>
      </div>

      <style jsx>{`
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          padding-top: 0.5rem;
        }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}
