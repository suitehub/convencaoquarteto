/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, QrCode, Calendar, Clock, LogOut, 
  Map, Bell, ShieldAlert, CheckCircle, ChevronLeft, Search, Music, Sparkles,
  Menu, X
} from 'lucide-react';
import { Participant, ScheduleItem } from '../types';

interface ParticipantAreaProps {
  currentUser: Participant;
  schedule: ScheduleItem[];
  onLogout: () => void;
  onNavigate: (view: string, role?: 'public' | 'participant' | 'reception' | 'organizer') => void;
}

export default function ParticipantArea({ currentUser, schedule, onLogout, onNavigate }: ParticipantAreaProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'meus-dados'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 print:hidden">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
        {/* App Logo */}
        <div className="p-4 md:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-app-gold rounded-xl text-app-deep">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-app-gold tracking-wider block uppercase">9ª Convenção</span>
              <span className="text-xs font-black tracking-widest text-slate-100 uppercase font-display">DE QUARTETOS</span>
            </div>
          </div>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Participant Brief Profile and Navigation - Collapsible on Mobile */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden md:flex md:flex-col md:flex-1'}`}>
          {/* Participant Brief Profile */}
          <div className="p-6 bg-slate-950/40 border-b border-slate-800/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-app-medium to-app-gold text-white font-bold flex items-center justify-center font-display shadow-lg shadow-app-medium/10">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-200 truncate">{currentUser.name}</h4>
                <p className="text-[10px] text-slate-500 truncate font-mono uppercase">CONVENÇÃO PARTICIPANTE</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-app-gold animate-pulse" />
              <span className="text-slate-400 font-medium">Inscrição Validada</span>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="p-4 space-y-1 flex-1">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-app-gold text-app-deep font-bold shadow-lg shadow-app-gold/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Meu Ingresso / Início</span>
            </button>

            <button
              onClick={() => { setActiveTab('meus-dados'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'meus-dados'
                  ? 'bg-app-gold text-app-deep font-bold shadow-lg shadow-app-gold/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Meus Dados</span>
            </button>
          </nav>

          {/* Exit portal button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-red-950/20 border border-slate-800 hover:border-red-900/30 rounded-xl flex items-center space-x-3 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sair do Aplicativo</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        
        {/* HEADER BAR FOR CONVERSIONS */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-app-medium uppercase tracking-widest font-mono">Painel do Participante</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display sm:text-3xl">
              {activeTab === 'home' && 'Bem-vindo à Convenção!'}
              {activeTab === 'meus-dados' && 'Meus Dados Cadastrais'}
            </h1>
          </div>
          
          {/* Notification Alert Accent */}
          <div className="bg-app-light border border-slate-200 rounded-2xl px-4 py-2 flex items-center space-x-2 text-xs text-app-medium font-medium">
            <CheckCircle className="w-4 h-4 text-app-medium" />
            <span>Entrada confirmada: {currentUser.status === 'Presente' ? 'Presente (Credenciado)' : 'Reservado (Pendente)'}</span>
          </div>
        </header>

        {/* TAB 1: MEU INGRESSO & INÍCIO */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Visual Credencial (Ticket Pass Card) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-xs bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800"
              >
                {/* Visual cutout circles representing a classic ticket pass stub */}
                <div className="absolute left-0 top-[60%] w-6 h-12 bg-slate-50 rounded-r-full -translate-x-3 border-r border-slate-800" />
                <div className="absolute right-0 top-[60%] w-6 h-12 bg-slate-50 rounded-l-full translate-x-3 border-l border-slate-800" />

                {/* Card Header */}
                <div className="p-6 bg-gradient-to-br from-app-deep to-app-medium text-white relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded text-app-gold">
                      9ª Convenção Municipal
                    </span>
                    <Music className="w-5 h-5 text-app-gold" />
                  </div>
                  <h3 className="font-extrabold text-lg leading-tight font-display tracking-tight uppercase">
                    Ingresso Digital
                  </h3>
                  <p className="text-[10px] text-slate-200 font-mono tracking-wider mt-1 font-bold">
                    ACESSO COMPLETO • SÃO PAULO
                  </p>
                </div>

                {/* Card Body - Participant info */}
                <div className="p-6 pt-8 pb-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">PARTICIPANTE</span>
                      <strong className="text-slate-100 text-sm font-medium">{currentUser.name}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">CIDADE</span>
                        <strong className="text-slate-300 text-xs font-medium">{currentUser.city}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">RESERVA</span>
                        <strong className="text-app-gold text-xs font-bold font-mono">CONFIRMADA</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket dotted divider line */}
                <div className="border-t border-dashed border-slate-800 my-2 px-6 mx-auto w-[85%]" />

                {/* Card Bottom - QR Code */}
                <div className="p-6 pt-4 flex flex-col items-center bg-slate-900/40">
                  {/* Decorative animated music-theme QR code */}
                  <div className="p-4 bg-white rounded-2xl relative group shadow-lg">
                    <svg viewBox="0 0 100 100" className="w-32 h-32">
                      {/* Stylized QR Code elements */}
                      <rect x="0" y="0" width="25" height="25" fill="#020617" />
                      <rect x="5" y="5" width="15" height="15" fill="#ffffff" />
                      <rect x="8" y="8" width="9" height="9" fill="#020617" />
                      
                      <rect x="75" y="0" width="25" height="25" fill="#020617" />
                      <rect x="80" y="5" width="15" height="15" fill="#ffffff" />
                      <rect x="83" y="8" width="9" height="9" fill="#020617" />

                      <rect x="0" y="75" width="25" height="25" fill="#020617" />
                      <rect x="5" y="80" width="15" height="15" fill="#ffffff" />
                      <rect x="8" y="83" width="9" height="9" fill="#020617" />

                      {/* Random aesthetic QR blocks */}
                      <rect x="35" y="5" width="10" height="10" fill="#020617" />
                      <rect x="55" y="10" width="15" height="5" fill="#020617" />
                      <rect x="35" y="25" width="5" height="15" fill="#020617" />
                      <rect x="50" y="30" width="15" height="10" fill="#020617" />
                      <rect x="20" y="45" width="25" height="5" fill="#020617" />
                      <rect x="10" y="55" width="10" height="15" fill="#020617" />
                      <rect x="35" y="55" width="15" height="10" fill="#020617" />
                      
                      <rect x="70" y="35" width="10" height="25" fill="#020617" />
                      <rect x="85" y="45" width="10" height="10" fill="#020617" />
                      <rect x="55" y="65" width="15" height="15" fill="#020617" />
                      <rect x="80" y="70" width="15" height="15" fill="#020617" />
                      
                      <rect x="30" y="80" width="15" height="5" fill="#020617" />
                      <rect x="35" y="90" width="20" height="5" fill="#020617" />

                      {/* Custom Music Symbol overlay in the center */}
                      <circle cx="50" cy="50" r="14" fill="#D4AF37" />
                      <path d="M 47,56 L 47,44 L 56,41 L 56,53" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="44" cy="56" r="3" fill="#ffffff" />
                      <circle cx="53" cy="53" r="3" fill="#ffffff" />
                    </svg>

                    {/* QR watermark indicator */}
                    <div className="absolute inset-0 bg-app-medium/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-xs">
                      <span className="bg-slate-950 text-white text-[9px] font-mono font-bold tracking-wider px-2 py-1 rounded">
                        MOCK PASS VALID
                      </span>
                    </div>
                  </div>

                  {/* QR instruction */}
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest mt-4 uppercase">
                    ID: {currentUser.id.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-400 font-light text-center mt-1">
                    Apresente este QR Code no credenciamento ao chegar ao auditório.
                  </p>
                </div>
              </motion.div>

              {/* Quick visual ticket action */}
              <button
                onClick={() => window.print()}
                className="mt-4 text-xs font-semibold text-app-medium hover:text-app-deep flex items-center space-x-1.5 cursor-pointer hover:underline"
              >
                <span>Baixar Ingresso em PDF</span>
              </button>
            </div>

            {/* Informações importantes e status */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Welcome card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-app-medium uppercase tracking-widest font-mono">Área do Participante</span>
                <h2 className="text-xl font-bold text-slate-800 mt-1 font-display">
                  Olá, {currentUser.name}!
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-light leading-relaxed">
                  Estamos extremamente felizes com sua inscrição na <strong>9ª Convenção de Quartetos</strong>. Prepare-se para vivenciar uma imersão musical inesquecível, cercado de harmonia, conhecimento técnico e inspiração de alto nível vocal.
                </p>

                {/* Live update regarding status */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                  <div className={`p-2 rounded-xl text-xs font-bold ${currentUser.status === 'Presente' ? 'bg-app-gold/10 text-app-deep' : 'bg-amber-50 text-amber-600'}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-800 text-sm">Status da sua Reserva</strong>
                    <p className="text-slate-500 text-xs mt-0.5 font-light">
                      {currentUser.status === 'Presente' 
                        ? 'Você já se credenciou na recepção oficial e sua entrada foi liberada! Excelente convenção!' 
                        : 'Sua vaga está garantida de forma segura. Apresente o QR Code ao lado na portaria para realizar o credenciamento e liberar sua pulseira de acesso.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações de Utilidade Pública */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="font-bold text-slate-800 font-display text-base mb-4 flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-app-gold" />
                  <span>Avisos Importantes</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex space-x-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-app-gold mt-2 shrink-0" />
                    <p className="text-xs text-slate-600 font-light leading-relaxed">
                      <strong>Acomodação por Ordem de Chegada:</strong> Os portões se abrirão às 17h30 no Sábado (17/10/2026). Como os assentos não serão reservados e a acomodação se dará exclusivamente por ordem de chegada, planeje-se para entrar cedo e pegar os melhores lugares no auditório!
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Summary Widget */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-display text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-app-gold" />
                    <span>Local do Evento</span>
                  </h4>
                  <p className="text-slate-300 text-xs mt-2 font-semibold">IASD Nova Semente</p>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed font-light">
                    R. Cubatão, 48 - Paraíso <br />
                    São Paulo - SP, 04013-040
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: MEUS DADOS CADASTRAIS */}
        {activeTab === 'meus-dados' && (
          <div className="max-w-2xl bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
            <h3 className="font-bold text-slate-800 font-display text-lg mb-6 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <User className="w-5 h-5 text-app-gold" />
              <span>Informações Pessoais do Participante</span>
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Nome Completo</label>
                  <span className="block mt-1.5 text-sm font-semibold text-slate-800">{currentUser.name}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">E-mail Cadastrado</label>
                  <span className="block mt-1.5 text-sm font-semibold text-slate-800">{currentUser.email}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">WhatsApp / Celular</label>
                  <span className="block mt-1.5 text-sm font-semibold text-slate-800">{currentUser.phone}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cidade / Estado</label>
                  <span className="block mt-1.5 text-sm font-semibold text-slate-800">{currentUser.city}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status do Ingresso</label>
                  <span className="inline-flex mt-1.5 items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-app-gold/10 text-app-deep border border-app-gold/20">
                    Reserva Confirmada
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Data de Registro</label>
                  <span className="block mt-1.5 text-sm font-semibold text-slate-800">{currentUser.registrationDate || '29/06/2026'}</span>
                </div>
              </div>

              {/* Informações complementares de alteração */}
              <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 leading-relaxed font-light">
                <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[9px] font-mono">Como alterar seus dados?</span>
                Caso precise realizar qualquer correção em seu e-mail, telefone ou nome, entre em contato diretamente com a equipe organizadora no guichê de credenciamento ou envie uma mensagem para <strong>(11) 99544-9821 (Bruno Camilo)</strong> portando o código de reserva.
              </div>

              {/* Back button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar para o Painel</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>

    {/* Beautiful High-Fidelity Printable PDF Layout */}
    <div className="hidden print:block bg-white text-slate-900 p-8 min-h-screen font-sans">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 mb-8 border-b-4 border-app-gold relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-app-gold rounded-2xl text-app-deep">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-app-gold tracking-widest block uppercase font-mono">DOCUMENTO DE INGRESSO OFICIAL</span>
            <h1 className="text-xl font-black tracking-tight text-white uppercase font-display">9ª Convenção Municipal de Quartetos</h1>
          </div>
        </div>
        <div className="text-right mt-4 md:mt-0 font-mono text-xs text-slate-400">
          <span>EMISSÃO DE COMPROVANTE DIGITAL</span>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: The EXACT High-End Ticket Card */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-xs bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800 p-0">
            {/* Visual cutout circles representing a classic ticket pass stub */}
            <div className="absolute left-0 top-[60%] w-6 h-12 bg-white rounded-r-full -translate-x-3 border-r border-slate-800" />
            <div className="absolute right-0 top-[60%] w-6 h-12 bg-white rounded-l-full translate-x-3 border-l border-slate-800" />

            {/* Card Header */}
            <div className="p-6 bg-gradient-to-br from-app-deep to-app-medium text-white relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded text-app-gold font-mono">
                  9ª Convenção Municipal
                </span>
                <Music className="w-5 h-5 text-app-gold" />
              </div>
              <h3 className="font-extrabold text-lg leading-tight font-display tracking-tight uppercase">
                Ingresso Digital
              </h3>
              <p className="text-[10px] text-slate-200 font-mono tracking-wider mt-1 font-bold">
                ACESSO COMPLETO • SÃO PAULO
              </p>
            </div>

            {/* Card Body - Participant info */}
            <div className="p-6 pt-8 pb-4">
              <div className="space-y-3 font-sans">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono block">PARTICIPANTE</span>
                  <strong className="text-slate-100 text-sm font-medium">{currentUser.name}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block">CIDADE</span>
                    <strong className="text-slate-300 text-xs font-medium">{currentUser.city}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block">RESERVA</span>
                    <strong className="text-app-gold text-xs font-bold font-mono">CONFIRMADA</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket dotted divider line */}
            <div className="border-t border-dashed border-slate-800 my-2 px-6 mx-auto w-[85%]" />

            {/* Card Bottom - QR Code */}
            <div className="p-6 pt-4 flex flex-col items-center bg-slate-900/40">
              <div className="p-4 bg-white rounded-2xl relative shadow-lg">
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                  <rect x="0" y="0" width="25" height="25" fill="#020617" />
                  <rect x="5" y="5" width="15" height="15" fill="#ffffff" />
                  <rect x="8" y="8" width="9" height="9" fill="#020617" />
                  
                  <rect x="75" y="0" width="25" height="25" fill="#020617" />
                  <rect x="80" y="5" width="15" height="15" fill="#ffffff" />
                  <rect x="83" y="8" width="9" height="9" fill="#020617" />

                  <rect x="0" y="75" width="25" height="25" fill="#020617" />
                  <rect x="5" y="80" width="15" height="15" fill="#ffffff" />
                  <rect x="8" y="83" width="9" height="9" fill="#020617" />

                  <rect x="35" y="5" width="10" height="10" fill="#020617" />
                  <rect x="55" y="10" width="15" height="5" fill="#020617" />
                  <rect x="35" y="25" width="5" height="15" fill="#020617" />
                  <rect x="50" y="30" width="15" height="10" fill="#020617" />
                  <rect x="20" y="45" width="25" height="5" fill="#020617" />
                  <rect x="10" y="55" width="10" height="15" fill="#020617" />
                  <rect x="35" y="55" width="15" height="10" fill="#020617" />
                  
                  <rect x="70" y="35" width="10" height="25" fill="#020617" />
                  <rect x="85" y="45" width="10" height="10" fill="#020617" />
                  <rect x="55" y="65" width="15" height="15" fill="#020617" />
                  <rect x="80" y="70" width="15" height="15" fill="#020617" />
                  
                  <rect x="30" y="80" width="15" height="5" fill="#020617" />
                  <rect x="35" y="90" width="20" height="5" fill="#020617" />

                  <circle cx="50" cy="50" r="14" fill="#D4AF37" />
                  <path d="M 47,56 L 47,44 L 56,41 L 56,53" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="44" cy="56" r="3" fill="#ffffff" />
                  <circle cx="53" cy="53" r="3" fill="#ffffff" />
                </svg>
              </div>

              <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-4 uppercase font-bold">
                ID: {currentUser.id.toUpperCase()}
              </span>
              <p className="text-[10px] text-slate-400 font-light text-center mt-1">
                Apresente este QR Code no credenciamento ao chegar ao auditório.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Important notices and location */}
        <div className="md:col-span-7 space-y-6">
          {/* Welcome and Participant summary card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-app-medium uppercase tracking-widest font-mono">DADOS DO PARTICIPANTE</span>
            <h2 className="text-xl font-bold text-slate-800 mt-1 font-display">Confirmado: {currentUser.name}</h2>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">E-mail</span>
                <span className="text-slate-800 font-bold">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">WhatsApp</span>
                <span className="text-slate-800 font-bold">{currentUser.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Inscrição</span>
                <span className="text-emerald-700 font-bold">ATIVA E CONFIRMADA</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Data Cadastro</span>
                <span className="text-slate-800 font-bold">{currentUser.registrationDate || '29/06/2026'}</span>
              </div>
            </div>
          </div>

          {/* important notices */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 font-display text-sm mb-3 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-app-gold shrink-0" />
              <span>Avisos Importantes para o Evento</span>
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 font-light leading-relaxed">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-app-gold mt-1.5 shrink-0" />
                <p><strong>Acomodação por Ordem de Chegada:</strong> O credenciamento e os portões iniciam-se às 17h30 de Sábado (17 de Outubro). Os assentos não são reservados e serão ocupados por ordem de chegada, por isso planeje-se para entrar cedo e pegar os melhores lugares.</p>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-app-gold mt-1.5 shrink-0" />
                <p><strong>Entrada Obrigatória:</strong> Este documento digital ou impresso é obrigatório para validação rápida no check-in.</p>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-app-gold mt-1.5 shrink-0" />
                <p><strong>Uso de Crachá/Pulseira:</strong> Mantenha a pulseira de acesso visível durante toda a permanência no auditório.</p>
              </li>
            </ul>
          </div>

          {/* location widget */}
          <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-sm">
            <h4 className="font-bold text-white font-display text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-app-gold" />
              <span>Local do Evento</span>
            </h4>
            <p className="text-app-gold text-xs mt-2 font-semibold">IASD Nova Semente</p>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed font-light">
              R. Cubatão, 48 - Paraíso <br />
              São Paulo - SP, 04013-040
            </p>
          </div>
        </div>
      </div>

      {/* Footer Brand Strategic text */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center flex flex-col items-center">
        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">
          9ª CONVENÇÃO MUNICIPAL DE QUARTETOS • SÃO PAULO - SP
        </div>
        <span className="text-xs text-app-medium font-bold font-mono mt-1">#CuidandoDePessoas</span>
        <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase tracking-wide text-center">
          Fundamentado na Lei Municipal nº 16.894, de 14 de maio de 2018 • Realização e Apoio Institucional: Secretaria Municipal de Cultura
        </span>
      </div>
    </div>
  </>
);
}
