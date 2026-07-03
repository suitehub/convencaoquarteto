/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, ArrowLeft, Ticket, CheckCircle, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { Participant } from '../types';

interface CadastroProps {
  initialType?: 'Público' | 'Participante';
  onAddParticipant: (newPart: Omit<Participant, 'id' | 'status' | 'registrationDate'>) => Promise<void>;
  onNavigate: (view: string, role?: 'public' | 'participant' | 'reception' | 'organizer') => void;
  participantsCount?: number;
  participants?: Participant[];
}

export default function Cadastro({ 
  initialType = 'Público', 
  onAddParticipant, 
  onNavigate, 
  participantsCount = 0,
  participants = []
}: CadastroProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (participantsCount >= 445) {
    return (
      <div className="min-h-screen bg-app-deep flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden">
        {/* Immersive brand glow elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-app-medium/10 blur-[130px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-app-gold/10 blur-[120px] translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-app-medium/5 blur-[100px] pointer-events-none" />

        {/* Elegant geometric line grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        {/* Back button */}
        <button
          onClick={() => onNavigate('landing')}
          className="absolute top-6 left-6 text-slate-300 hover:text-white flex items-center space-x-2 text-sm font-medium font-mono cursor-pointer transition-colors z-20"
        >
          <ArrowLeft className="w-4 h-4 text-app-gold" />
          <span>Voltar para Início</span>
        </button>

        {/* Card Form */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-app-gold to-red-500" />
            
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-app-deep font-display tracking-tight">Inscrições Encerradas!</h2>
              
              <p className="text-slate-600 text-sm mt-3 font-light leading-relaxed">
                Desculpe! O limite máximo de <strong className="text-app-medium font-semibold">445 ingressos</strong> foi atingido e as inscrições foram encerradas para este evento.
              </p>
              
              <div className="bg-app-light p-4 rounded-2xl border border-slate-200 my-6 text-left space-y-2">
                <div className="text-xs text-slate-500 font-mono flex justify-between">
                  <span>CAPACIDADE MÁXIMA:</span>
                  <span className="text-red-600 font-bold">445 INGRESSOS</span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex justify-between">
                  <span>RESERVAS ATIVAS:</span>
                  <span className="text-app-deep font-bold">{participantsCount} / 445</span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex justify-between">
                  <span>STATUS EVENTO:</span>
                  <span className="text-red-600 font-bold">LOTADO</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('landing')}
                className="w-full px-6 py-4 bg-app-medium text-white font-bold text-sm rounded-2xl cursor-pointer transition-all active:scale-95"
              >
                Voltar para Início
              </button>
            </div>
            
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !privacyChecked) return;

    // Duplicates check
    const normalizedEmail = formData.email.trim().toLowerCase();
    const normalizedPhone = formData.phone.replace(/\D/g, '');

    const isEmailRegistered = participants.some(
      (p) => p.email.trim().toLowerCase() === normalizedEmail
    );
    const isPhoneRegistered = participants.some(
      (p) => p.phone.replace(/\D/g, '') === normalizedPhone
    );

    if (isEmailRegistered) {
      setErrorMsg('Este e-mail já possui um ingresso reservado / cadastrado.');
      return;
    }
    if (isPhoneRegistered) {
      setErrorMsg('Este celular / WhatsApp já possui um ingresso reservado / cadastrado.');
      return;
    }

    setLoading(true);
    try {
      await onAddParticipant({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        registrationType: initialType
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMsg('Ocorreu um erro ao salvar seu cadastro no banco de dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length > 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      } else if (numbers.length > 2) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length > 0) {
        return `(${numbers}`;
      }
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: formatPhone(e.target.value) });
  };

  return (
    <div className="min-h-screen bg-app-deep flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden">
      
      {/* Immersive brand glow elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-app-medium/10 blur-[130px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-app-gold/10 blur-[120px] translate-y-1/2 -translate-x-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-app-medium/5 blur-[100px] pointer-events-none" />

      {/* Elegant geometric line grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 text-slate-300 hover:text-white flex items-center space-x-2 text-sm font-medium font-mono cursor-pointer transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4 text-app-gold" />
        <span>Voltar para Início</span>
      </button>

      {/* Card Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
          
          {/* Top visual brand accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-app-medium via-app-gold to-app-medium" />

          {!success ? (
            <>
              <div className="mb-6 text-center">
                <span className="text-[10px] font-bold text-app-gold tracking-widest block uppercase mb-1.5 font-mono">
                  9ª Convenção Municipal de Quartetos
                </span>
                
                <div className="w-12 h-12 rounded-2xl bg-app-light border border-slate-200 text-app-medium flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Ticket className="w-6 h-6 text-app-medium" />
                </div>
                
                <h2 className="text-2xl font-black text-app-deep font-display tracking-tight">
                  {initialType === 'Participante' ? 'Inscrição de Quarteto' : 'Reserva de Ingresso'}
                </h2>
                
                <p className="text-slate-500 text-xs mt-2 font-light leading-relaxed">
                  {initialType === 'Participante' 
                    ? 'Módulo exclusivo para quartetos, trios e grupos vocais participantes realizarem o cadastro.'
                    : 'Garanta sua cadeira gratuita no maior evento musical de quartetos do município.'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gabriel da Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Ex: seu-email@dominio.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">
                    WhatsApp / Celular
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">
                    Senha para Entrar (Acesso)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-app-medium/80" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-10 pr-4 py-3 bg-app-light border border-slate-200 focus:border-app-medium focus:ring-4 focus:ring-app-medium/5 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Esta senha será necessária para acessar a sua área exclusiva futuramente.</span>
                </div>

                {/* Required Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={privacyChecked}
                      onChange={(e) => setPrivacyChecked(e.target.checked)}
                      className="mt-0.5 w-4.5 h-4.5 rounded-md border-slate-300 bg-white text-app-medium focus:ring-app-medium/30 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="leading-relaxed font-light">
                      Li e concordo com a <strong className="text-app-medium font-semibold">Política de Privacidade</strong> e autorizo o armazenamento dos meus dados para utilização neste evento, incluindo futuras cookies ou comunicações relacionadas à Convenção.
                    </span>
                  </label>
                </div>

                {errorMsg && (
                  <p className="text-red-600 text-xs text-center bg-red-50 p-3 rounded-xl border border-red-200">
                    {errorMsg}
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !privacyChecked}
                  className="w-full mt-4 px-6 py-4 bg-app-gold disabled:opacity-50 text-app-deep font-extrabold text-sm rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-app-gold/10 active:scale-98 flex items-center justify-center space-x-2 font-black"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-app-deep border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{initialType === 'Participante' ? 'Concluir Cadastro' : 'Reservar Meu Ingresso'}</span>
                      <Ticket className="w-4 h-4 text-app-deep" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle to Login */}
              <div className="mt-6 text-center text-xs text-slate-500">
                Já possui uma reserva ativa?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-app-medium hover:underline font-semibold cursor-pointer"
                >
                  Acesse sua Área de Membro
                </button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-app-deep font-display">Inscrição Efetuada!</h2>
              
              <p className="text-slate-600 text-sm mt-3 font-light leading-relaxed">
                Excelente! Sua vaga para a <strong className="text-app-medium font-semibold">9ª Convenção Municipal de Quartetos</strong> está garantida com sucesso.
              </p>
              
              <div className="bg-app-light p-4 rounded-2xl border border-slate-200 my-6 text-left space-y-2">
                <div className="text-xs text-slate-500 font-mono flex justify-between">
                  <span>PARTICIPANTE:</span>
                  <span className="text-app-deep font-bold">{formData.name}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex justify-between">
                  <span>TIPO DE CADASTRO:</span>
                  <span className="text-app-medium font-bold uppercase">{initialType}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex justify-between">
                  <span>STATUS RESERVA:</span>
                  <span className="text-emerald-600 font-bold">RESERVA CONFIRMADA</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-app-light p-3 rounded-xl border border-slate-200 mb-6 text-left flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-app-gold shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Use seu e-mail ou WhatsApp / Celular cadastrados junto com a senha que você definiu para acessar sua credencial digital e cronograma na área do participante.
                </p>
              </div>

              <button
                onClick={() => onNavigate('login')}
                className="w-full px-6 py-4 bg-app-medium text-white font-bold text-sm rounded-2xl cursor-pointer transition-all active:scale-95"
              >
                Entrar na Área do Participante
              </button>
            </motion.div>
          )}

          {/* Hashtag discreta em local estratégico */}
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
