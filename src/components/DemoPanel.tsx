/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Laptop, Smartphone, ClipboardCheck, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';

interface DemoPanelProps {
  currentRole: UserRole;
  currentView: string;
  onNavigate: (view: string, role?: UserRole) => void;
  onResetDemo: () => void;
}

export default function DemoPanel({ currentRole, currentView, onNavigate, onResetDemo }: DemoPanelProps) {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return false;
  });

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none">
      <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl p-4 pointer-events-auto text-white overflow-hidden transition-all duration-300">
        
        {/* Header controller toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-app-gold/10 rounded-lg border border-app-gold/30 text-app-gold">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-app-gold font-mono block tracking-widest leading-none uppercase">PROTÓTIPO DE ALTA FIDELIDADE</span>
              <span className="text-xs font-bold font-display text-slate-100">Painel de Demonstração de Fluxos</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Reset button to default state */}
            <button
              onClick={onResetDemo}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer flex items-center space-x-1 text-[10px] font-mono border border-slate-800/80"
              title="Restaurar dados iniciais do protótipo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resetar Demo</span>
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable navigation buttons */}
        {expanded && (
          <div className="max-h-[60vh] overflow-y-auto pr-1 mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Col 1: Public & Participant flow */}
            <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
              <span className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Fluxo do Participante</span>
              </span>
              
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  onClick={() => onNavigate('splash', 'public')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'public' && currentView === 'splash'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  1. Splash Screen
                </button>
                <button
                  onClick={() => onNavigate('landing', 'public')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'public' && currentView === 'landing'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  2. Landing Page
                </button>
                <button
                  onClick={() => onNavigate('cadastro', 'public')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'public' && currentView === 'cadastro'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  3. Tela Cadastro
                </button>
                <button
                  onClick={() => onNavigate('login', 'public')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'public' && currentView === 'login'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  4. Tela Login
                </button>
                <button
                  onClick={() => onNavigate('home', 'participant')}
                  className={`py-1.5 px-2 rounded-lg text-left col-span-2 transition-all cursor-pointer ${
                    currentRole === 'participant'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  5. Área Participante (Acesso Logado)
                </button>
              </div>
            </div>

            {/* Col 2: Receptionist flow */}
            <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
              <span className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Fluxo Credenciamento</span>
              </span>
              
              <div className="flex flex-col gap-1.5 text-[10px]">
                <button
                  onClick={() => onNavigate('login-reception', 'public')}
                  className={`py-1.5 px-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'public' && currentView === 'login-reception'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  1. Login da Recepção
                </button>
                <button
                  onClick={() => onNavigate('dashboard', 'reception')}
                  className={`py-1.5 px-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'reception'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  2. Painel Check-in (Recepção)
                </button>
              </div>
            </div>

            {/* Col 3: Admin Flow */}
            <div className="space-y-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
              <span className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                <Laptop className="w-3.5 h-3.5 text-purple-400" />
                <span>Área do Organizador</span>
              </span>
              
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  onClick={() => onNavigate('dashboard', 'organizer')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'organizer' && currentView === 'dashboard'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  1. Dashboard Geral
                </button>
                <button
                  onClick={() => onNavigate('participantes', 'organizer')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'organizer' && currentView === 'participantes'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  2. Participantes
                </button>
                <button
                  onClick={() => onNavigate('estatisticas', 'organizer')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'organizer' && currentView === 'estatisticas'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  3. Estatísticas
                </button>
                <button
                  onClick={() => onNavigate('sorteio', 'organizer')}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    currentRole === 'organizer' && currentView === 'sorteio'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  4. Sorteador
                </button>
                <button
                  onClick={() => onNavigate('configuracoes', 'organizer')}
                  className={`py-1.5 px-2 rounded-lg text-left col-span-2 transition-all cursor-pointer ${
                    currentRole === 'organizer' && currentView === 'configuracoes'
                      ? 'bg-app-gold text-app-deep font-bold'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  5. Configurações do Evento
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Current status display watermark */}
        <div className="mt-3 flex justify-between items-center text-[9px] text-slate-500 font-mono">
          <span>FUNÇÃO ATIVA: <strong className="text-app-gold font-semibold uppercase">{currentRole}</strong></span>
          <span>TELA: <strong className="text-slate-300 font-semibold uppercase">{currentView}</strong></span>
        </div>

      </div>
    </div>
  );
}
