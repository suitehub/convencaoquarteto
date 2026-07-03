/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, Lock, User, ArrowLeft, LogIn, Sparkles } from 'lucide-react';
import { Participant, StaffUser } from '../types';

interface LoginProps {
  onLoginSuccess: (user: Participant) => void;
  onStaffLoginSuccess: () => void;
  onNavigate: (view: string, role?: 'public' | 'participant' | 'reception' | 'organizer') => void;
  initialMode?: 'participant' | 'reception';
  onLoginParticipant: (emailOrPhone: string, passwordInput: string) => Promise<Participant | null>;
  onLoginStaff: (usernameInput: string, passwordInput: string) => Promise<boolean>;
}

export default function Login({ 
  onLoginSuccess, 
  onStaffLoginSuccess, 
  onNavigate,
  initialMode = 'participant',
  onLoginParticipant,
  onLoginStaff
}: LoginProps) {
  const [mode, setMode] = useState<'participant' | 'reception'>(initialMode);
  
  // Participant form
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [partPassword, setPartPassword] = useState('');
  const [partError, setPartError] = useState('');

  // Reception form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [receptionError, setReceptionError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleParticipantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartError('');
    if (!email && !phone) {
      setPartError('Preencha seu e-mail ou WhatsApp / Celular cadastrado.');
      return;
    }
    if (!partPassword) {
      setPartError('Preencha sua senha de acesso.');
      return;
    }

    setLoading(true);
    try {
      const match = await onLoginParticipant(email || phone, partPassword);
      setLoading(false);
      if (match) {
        onLoginSuccess(match);
      } else {
        setPartError('Inscrição não localizada ou senha incorreta. Verifique os dados fornecidos.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      setPartError('Ocorreu um erro ao realizar o login. Tente novamente.');
    }
  };

  const handleReceptionLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceptionError('');
    if (!username || !password) return;

    setLoading(true);
    try {
      const success = await onLoginStaff(username, password);
      setLoading(false);
      if (success) {
        onStaffLoginSuccess();
      } else {
        setReceptionError('Usuário ou senha incorretos. Verifique suas credenciais de equipe.');
      }
    } catch (error) {
      console.error('Staff login error:', error);
      setLoading(false);
      setReceptionError('Ocorreu um erro de conexão. Tente novamente.');
    }
  };



  return (
    <div className="min-h-screen bg-app-deep flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden">
      {/* Light spots */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-app-medium/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-app-gold/10 blur-[100px] translate-y-1/2 -translate-x-1/3" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-15 pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 text-slate-300 hover:text-white flex items-center space-x-2 text-sm font-medium font-mono cursor-pointer transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4 text-app-gold" />
        <span>Voltar para Início</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
          
          {/* Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-app-medium via-app-gold to-app-medium" />

          {/* Segmented Controller (Tabs) */}
          <div className="bg-app-light p-1.5 rounded-2xl flex border border-slate-200 mb-8">
            <button
              onClick={() => {
                setMode('participant');
                setPartError('');
                setReceptionError('');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider ${
                mode === 'participant'
                  ? 'bg-app-medium text-white font-extrabold shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Participante
            </button>
            <button
              onClick={() => {
                setMode('reception');
                setPartError('');
                setReceptionError('');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider ${
                mode === 'reception'
                  ? 'bg-app-medium text-white font-extrabold shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recepção / Staff
            </button>
          </div>

          {/* Tab 1: Participant Login */}
          {mode === 'participant' && (
            <div>
              <div className="mb-6 text-center">
                <span className="text-[10px] font-bold text-app-gold tracking-widest block uppercase mb-1 font-mono">
                  Acesso de Inscritos
                </span>
                <h2 className="text-xl font-bold text-app-deep font-display">Acesso do Participante</h2>
                <p className="text-slate-500 text-xs mt-1 font-light">
                  Insira o e-mail ou telefone cadastrado na reserva.
                </p>
              </div>

              <form onSubmit={handleParticipantLogin} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="email"
                      placeholder="seu-email@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                    Ou WhatsApp / Celular
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4 text-app-gold/80" />
                    </div>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="password"
                      placeholder="Sua senha cadastrada"
                      value={partPassword}
                      onChange={(e) => setPartPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {partError && (
                  <p className="text-red-600 text-xs mt-2 text-center bg-red-50 p-3 rounded-xl border border-red-200">
                    {partError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 px-6 py-3.5 bg-app-gold text-app-deep font-extrabold text-sm rounded-2xl cursor-pointer transition-all active:scale-98 flex items-center justify-center space-x-2 shadow-md hover:shadow-app-gold/10 font-black"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-app-deep border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Entrar</span>
                      <LogIn className="w-4 h-4 text-app-deep" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <div className="mt-8 text-center text-xs text-slate-500">
                Ainda não tem ingresso reservado?{' '}
                <button
                  onClick={() => onNavigate('cadastro')}
                  className="text-app-medium hover:underline font-semibold cursor-pointer"
                >
                  Cadastre-se agora
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Reception Login */}
          {mode === 'reception' && (
            <div>
              <div className="mb-6 text-center">
                <span className="text-[10px] font-bold text-app-gold tracking-widest block uppercase mb-1 font-mono">
                  Controle Interno
                </span>
                <h2 className="text-xl font-bold text-app-deep font-display">Acesso Credenciamento</h2>
                <p className="text-slate-500 text-xs mt-1 font-light">
                  Módulo exclusivo para equipe de recepção e check-in.
                </p>
              </div>

              <form onSubmit={handleReceptionLogin} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                    Usuário
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="text"
                      placeholder="Digite o usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="password"
                      placeholder="Digite a senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {receptionError && (
                  <p className="text-red-600 text-xs mt-2 text-center bg-red-50 p-3 rounded-xl border border-red-200">
                    {receptionError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 px-6 py-3.5 bg-app-gold text-app-deep font-extrabold text-sm rounded-2xl cursor-pointer transition-all active:scale-98 flex items-center justify-center space-x-2 shadow-md hover:shadow-app-gold/10 font-black"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-app-deep border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Entrar no Painel</span>
                      <LogIn className="w-4 h-4 text-app-deep" />
                    </>
                  )}
                </button>
              </form>


            </div>
          )}

          {/* Hashtag discreta */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block select-none">
              #CuidandoDePessoas
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
