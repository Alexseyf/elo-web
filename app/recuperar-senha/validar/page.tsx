'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import config from '../../../config';

function ValidarSenhaForm() {
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams?.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!codigo) {
      setError('Código deve ser informado');
      setLoading(false);
      return;
    }

    if (!/^\d{4}$/.test(codigo)) {
      setError('Código deve conter exatamente 4 dígitos numéricos');
      setLoading(false);
      return;
    }

    if (!novaSenha) {
      setError('Nova senha deve ser informada');
      setLoading(false);
      return;
    }

    if (!confirmarSenha) {
      setError('Confirmação de senha deve ser informada');
      setLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (novaSenha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${config.API_URL}/valida-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code: codigo,
          novaSenha
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.mensagem || 'Senha alterada com sucesso. Redirecionando para login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.erro || 'Erro ao validar senha');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Ocorreu um erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Elo Escola"
            width={120}
            height={30}
          />
        </div>

        <h1 className="mb-2 text-center text-2xl font-semibold">Alterar Senha</h1>
        <p className="mb-6 text-center text-gray-600">
          Informe o código recebido por email e sua nova senha
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="codigo" className="mb-2 block text-sm font-medium">
              Código de Recuperação
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setCodigo(value);
                }
              }}
              className="w-full rounded-md border border-gray-300 p-2 text-center text-2xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0000"
              maxLength={4}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="novaSenha" className="mb-2 block text-sm font-medium">
              Nova Senha
            </label>
            <input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmarSenha" className="mb-2 block text-sm font-medium">
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {loading ? 'Processando...' : 'Alterar Senha'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            <button
              type="button"
              onClick={() => router.push('/recuperar-senha')}
              className="text-blue-600 hover:underline"
            >
              Voltar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ValidarSenha() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ValidarSenhaForm />
    </Suspense>
  );
}
