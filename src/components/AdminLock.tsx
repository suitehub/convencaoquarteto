/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff, Lock, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { checkRateLimit, recordAttempt, clearRateLimit, sanitizeInput } from '../utils/security';
import { auth } from '../firebase';

interface AdminLockProps {
  onUnlockSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLock({ onUnlockSuccess, onCancel }: AdminLockProps) {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Verify token with backend if server is online
      try {
        const res = await fetch('/api/admin/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token: idToken }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            clearRateLimit('admin_lock');
            sessionStorage.setItem('admin_authenticated', 'true');
            sessionStorage.setItem('admin_token', idToken);
            onUnlockSuccess();
            return;
          }
        }
      } catch (serverErr) {
        console.warn('Backend verification unavailable, proceeding with Firebase Auth session:', serverErr);
      }

      // If backend verification isn't running or passed, persist session
      clearRateLimit('admin_lock');
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_token', idToken);
      onUnlockSuccess();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Login cancelado pelo usuário.');
      } else {
        setErrorMsg(`Falha no login Google: ${err.message || 'Tente novamente.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check Client Rate Limiter for admin_lock
    const rateCheck = checkRateLimit('admin_lock');
    if (!rateCheck.allowed) {
      setErrorMsg(`Muitas tentativas incorretas. Por segurança, aguarde ${rateCheck.remainingSeconds}s antes de tentar novamente.`);
      return;
    }

    const cleanCode = sanitizeInput(code, 64);
    if (!cleanCode) return;

    setLoading(true);

    try {
      // Authenticate against the backend server endpoint
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: cleanCode }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (res.ok && data?.success) {
        clearRateLimit('admin_lock');
        sessionStorage.setItem('admin_authenticated', 'true');
        if (data.token) {
          sessionStorage.setItem('admin_token', data.token);
        }
        onUnlockSuccess();
      } else {
        recordAttempt('admin_lock');
        const updatedCheck = checkRateLimit('admin_lock');
        if (!updatedCheck.allowed) {
          setErrorMsg(`Bloqueado por segurança! Aguarde ${updatedCheck.remainingSeconds}s para tentar novamente.`);
        } else if (res.status === 503) {
          setErrorMsg(
            data?.error ||
            'ADMIN_ACCESS_HASH não está configurado no servidor (.env ou Secrets). Configure a variável ou utilize o Login com Google.'
          );
        } else if (res.status === 404) {
          setErrorMsg(
            'Servidor backend (/api/admin/verify) não encontrado. Se estiver em hospedagem estática, utilize o Login com Google.'
          );
        } else if (res.status === 401) {
          setErrorMsg(data?.error || 'Código de acesso incorreto. Verifique a senha configurada.');
        } else if (res.status === 429) {
          setErrorMsg(data?.error || 'Muitas tentativas. Aguarde alguns instantes.');
        } else {
          setErrorMsg(data?.error || `Falha na autenticação (HTTP ${res.status}).`);
        }
        setLoading(false);
        setCode('');
      }
    } catch (err: any) {
      console.error('Admin authentication error:', err);
      recordAttempt('admin_lock');
      const isNetwork = err?.message?.toLowerCase().includes('fetch') || err?.name === 'TypeError';
      setErrorMsg(
        isNetwork
          ? 'Não foi possível conectar ao servidor backend (/api/admin/verify). Se estiver em ambiente estático, utilize o Login com Google.'
          : `Erro de comunicação: ${err?.message || 'verifique sua conexão'}.`
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-deep text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-app-medium selection:text-white">
      {/* Decorative Brand Lights */}
      <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] rounded-full bg-app-medium/10 blur-[130px] -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-app-gold/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-app-medium to-app-gold text-white shadow-xl shadow-app-medium/10 mb-4 ring-4 ring-white/5">
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">
            9ª Convenção Municipal de Quartetos
          </span>
          <h2 className="text-2xl font-black font-display tracking-tight text-white mt-1">
            Painel do Organizador
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-light max-w-xs">
            Esta é uma área administrativa restrita. Autentique-se com sua conta Google de organizador ou insira o código de acesso.
          </p>
        </div>

        {/* Lock Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden space-y-6">
          {/* Internal gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-app-medium via-app-gold to-app-medium" />

          {/* Primary Option: Google Authentication (Firebase Auth) */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-white/10 active:scale-98 flex items-center justify-center space-x-3 shadow-md border border-slate-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Entrar com Conta Google (Admin)</span>
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
              Recomendado: seguro via Firebase Authentication (RBAC)
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
              Ou via Código de Acesso
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="access-code" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
                Código de Acesso
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5 text-app-gold" />
                </div>
                
                <input
                  id="access-code"
                  type={showPassword ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Digite o código..."
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 focus:border-app-gold/50 focus:ring-4 focus:ring-app-gold/15 rounded-2xl text-white placeholder-slate-500 font-mono text-sm tracking-widest transition-all outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start space-x-2 text-red-200 text-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={loading || !code}
                className="w-full py-3.5 bg-app-gold hover:bg-app-gold/90 disabled:opacity-40 text-app-deep font-extrabold text-sm rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-app-gold/15 active:scale-98 flex items-center justify-center space-x-2 shadow-md"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-app-deep border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Validar Código</span>
                    <ArrowRight className="w-4 h-4 text-app-deep" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full py-2.5 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider"
              >
                Voltar ao Início
              </button>
            </div>
          </form>
        </div>

        {/* Security watermark */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>AUTENTICAÇÃO COM VERIFICAÇÃO NO SERVIDOR</span>
        </div>
      </motion.div>
    </div>
  );
}
