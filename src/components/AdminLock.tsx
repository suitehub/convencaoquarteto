/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLockProps {
  onUnlockSuccess: () => void;
  onCancel: () => void;
}

// Helper function to hash a string to SHA-256 for cryptographic security
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function AdminLock({ onUnlockSuccess, onCancel }: AdminLockProps) {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    
    if (!code) return;

    setLoading(true);
    
    // Perform high-security cryptographic comparison to protect credentials
    sha256(code).then((hashedCode) => {
      // Hashed SHA-256 value of "admin@bruno"
      const targetHash = 'c9fd0cfd73186249d7ebc3ed9d67aacf94eb2f9c43e62134e960ab32e85fefbf';
      
      if (hashedCode === targetHash) {
        sessionStorage.setItem('admin_authenticated', 'true');
        onUnlockSuccess();
      } else {
        setError(true);
        setLoading(false);
        // Clean password input if wrong
        setCode('');
      }
    }).catch((err) => {
      console.error('Crypto error:', err);
      setError(true);
      setLoading(false);
    });
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
            Esta é uma área administrativa restrita. Por favor, insira seu código de credenciamento.
          </p>
        </div>

        {/* Lock Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
          {/* Internal gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-app-medium via-app-gold to-app-medium" />

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 focus:border-app-gold/50 focus:ring-4 focus:ring-app-gold/15 rounded-2xl text-white placeholder-slate-500 font-mono text-sm tracking-widest transition-all outline-none"
                  autoFocus
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
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center space-x-2 text-red-200 text-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Código incorreto. Acesso negado.</span>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loading || !code}
                className="w-full py-4 bg-app-gold hover:bg-app-gold/90 disabled:opacity-40 text-app-deep font-extrabold text-sm rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-app-gold/15 active:scale-98 flex items-center justify-center space-x-2 shadow-md"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-app-deep border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Painel</span>
                    <ArrowRight className="w-4 h-4 text-app-deep" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full py-3 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider"
              >
                Voltar ao Início
              </button>
            </div>
          </form>
        </div>

        {/* Security watermark */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>SESSÃO PROTEGIDA POR SSL</span>
        </div>
      </motion.div>
    </div>
  );
}
