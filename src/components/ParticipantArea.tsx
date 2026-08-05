/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, Mail, Phone, MapPin, QrCode, Calendar, Clock, LogOut, 
  Map, Bell, ShieldAlert, CheckCircle, ChevronLeft, Search, Music, Sparkles,
  Menu, X, Baby, Plus, Trash2, Edit3, Users, AlertCircle, ShieldCheck
} from 'lucide-react';
import { Participant, ScheduleItem, Dependent } from '../types';

interface ParticipantAreaProps {
  currentUser: Participant;
  schedule: ScheduleItem[];
  onLogout: () => void;
  onNavigate: (view: string, role?: 'public' | 'participant' | 'reception' | 'organizer') => void;
  onUpdateUser?: (updatedUser: Participant) => void;
  onDeleteUser?: (participantId: string) => Promise<void>;
}

function calculateAge(birthDateStr: string): string {
  if (!birthDateStr) return '0 anos';
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return '0 anos';
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age <= 0) {
    return 'Menor de 1 ano';
  }
  return `${age} ${age === 1 ? 'ano' : 'anos'}`;
}

function getAgeInYears(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return 0;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export default function ParticipantArea({ currentUser, schedule, onLogout, onNavigate, onUpdateUser, onDeleteUser }: ParticipantAreaProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'dependentes' | 'meus-dados'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cancel Ticket Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Modal & Form States for Dependents
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const [deletingDependent, setDeletingDependent] = useState<Dependent | null>(null);
  
  const [depName, setDepName] = useState('');
  const [depBirthDate, setDepBirthDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingDependent(null);
    setDepName('');
    setDepBirthDate('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dep: Dependent) => {
    setEditingDependent(dep);
    setDepName(dep.name);
    setDepBirthDate(dep.birthDate);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveDependent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!depName.trim()) {
      setFormError('Por favor, informe o nome completo da criança.');
      return;
    }
    if (!depBirthDate) {
      setFormError('Por favor, informe a data de nascimento.');
      return;
    }

    const ageYears = getAgeInYears(depBirthDate);
    if (ageYears > 15) {
      setFormError(`O cadastro de dependente é exclusivo para crianças e jovens de até 15 anos. A idade calculada foi de ${ageYears} anos. Para maiores de 15 anos, realize uma inscrição individual.`);
      return;
    }
    if (ageYears < 0) {
      setFormError('A data de nascimento não pode ser no futuro.');
      return;
    }

    const currentDeps = currentUser.dependents || [];

    if (editingDependent) {
      // Update existing dependent
      const updatedDeps = currentDeps.map(d => 
        d.id === editingDependent.id 
          ? { ...d, name: depName.trim(), birthDate: depBirthDate } 
          : d
      );
      if (onUpdateUser) {
        onUpdateUser({ ...currentUser, dependents: updatedDeps });
      }
      showToast(`Cadastro de ${depName.trim()} atualizado com sucesso!`);
    } else {
      // Add new dependent
      const newDep: Dependent = {
        id: 'dep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: depName.trim(),
        birthDate: depBirthDate,
        addedAt: new Date().toISOString()
      };
      const updatedDeps = [...currentDeps, newDep];
      if (onUpdateUser) {
        onUpdateUser({ ...currentUser, dependents: updatedDeps });
      }
      showToast(`Ingresso infantil de ${depName.trim()} cadastrado!`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmCancelTicket = async () => {
    setCancelLoading(true);
    try {
      if (onDeleteUser) {
        await onDeleteUser(currentUser.id);
      } else {
        onLogout();
      }
    } catch (err) {
      console.error('Error cancelling ticket:', err);
      setCancelLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingDependent) return;
    const currentDeps = currentUser.dependents || [];
    const updatedDeps = currentDeps.filter(d => d.id !== deletingDependent.id);
    if (onUpdateUser) {
      onUpdateUser({ ...currentUser, dependents: updatedDeps });
    }
    showToast(`Dependente ${deletingDependent.name} removido.`);
    setDeletingDependent(null);
  };

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
              onClick={() => { setActiveTab('dependentes'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'dependentes'
                  ? 'bg-app-gold text-app-deep font-bold shadow-lg shadow-app-gold/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Baby className="w-4 h-4 shrink-0" />
                <span>Dependentes / Crianças</span>
              </div>
              {currentUser.dependents && currentUser.dependents.length > 0 && (
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                  activeTab === 'dependentes' ? 'bg-app-deep text-app-gold' : 'bg-slate-800 text-app-gold'
                }`}>
                  {currentUser.dependents.length}
                </span>
              )}
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

          {/* Exit portal button & Cancel Ticket */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={onLogout}
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center space-x-2.5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sair da Conta</span>
            </button>

            <button
              onClick={() => { setIsCancelModalOpen(true); setMobileMenuOpen(false); }}
              className="w-full px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-xl flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>Cancelar Ingresso</span>
              </div>
              <span className="text-[9px] font-mono uppercase bg-red-900/50 text-red-200 px-1.5 py-0.5 rounded font-bold">Excluir</span>
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
              {activeTab === 'dependentes' && 'Inscrição de Crianças & Dependentes'}
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
                      9ª Convenção Municipal de Quartetos
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
                  {/* Real Scannable QR Code */}
                  <div className="p-3 bg-white rounded-2xl relative group shadow-lg flex items-center justify-center">
                    <QRCodeSVG 
                      value={currentUser.id} 
                      size={135} 
                      level="H"
                      marginSize={1}
                      fgColor="#020617"
                    />

                    {/* QR watermark indicator */}
                    <div className="absolute inset-0 bg-app-medium/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-xs">
                      <span className="bg-slate-950 text-white text-[9px] font-mono font-bold tracking-wider px-2 py-1 rounded shadow-md">
                        QR VÁLIDO
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

                {/* Linked Dependents Indicator in Ticket Card */}
                {currentUser.dependents && currentUser.dependents.length > 0 && (
                  <div className="w-[88%] mx-auto bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-app-gold">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>Ingressos da Família ({1 + currentUser.dependents.length})</span>
                      </span>
                      <span className="bg-app-gold/20 text-app-gold px-1.5 py-0.5 rounded text-[9px]">VÁLIDOS</span>
                    </div>
                    <ul className="text-[11px] space-y-1 divide-y divide-slate-800/60 font-light">
                      <li className="pt-1 flex items-center justify-between">
                        <span className="text-slate-200 font-medium truncate max-w-[150px]">1. {currentUser.name}</span>
                        <span className="text-app-gold text-[10px] font-mono">Titular</span>
                      </li>
                      {currentUser.dependents.map((dep, idx) => (
                        <li key={dep.id} className="pt-1 flex items-center justify-between">
                          <span className="text-slate-300 truncate max-w-[150px]">{idx + 2}. {dep.name}</span>
                          <span className="text-amber-300 text-[10px] font-mono">{calculateAge(dep.birthDate)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

        {/* TAB 2: DEPENDENTES / CRIANÇAS */}
        {activeTab === 'dependentes' && (
          <div className="space-y-6">
            {/* Header Info Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-app-deep to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
              <div className="space-y-2 max-w-xl z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-app-gold/15 border border-app-gold/30 text-app-gold text-xs font-mono uppercase font-bold">
                  <Baby className="w-3.5 h-3.5" />
                  <span>Gestão de Ingressos Infantis</span>
                </div>
                <h2 className="text-2xl font-black font-display tracking-tight text-white">
                  Dependentes & Crianças
                </h2>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Cadastre seus filhos para assegurar seus ingressos na 9ª Convenção Municipal de Quartetos. Cada criança cadastrada gera 1 ingresso infantil vinculado ao seu QR Code principal.
                </p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-3 bg-app-gold hover:bg-amber-400 text-app-deep font-bold text-xs rounded-2xl flex items-center space-x-2 cursor-pointer transition-all shadow-lg shadow-app-gold/20 active:scale-95 shrink-0 z-10"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Cadastrar Criança</span>
              </button>

              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-app-gold/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Summary Badge Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-app-medium/10 text-app-medium flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5 text-app-medium" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Resumo de Ingressos da Família</h4>
                  <p className="text-xs text-slate-500 font-light">
                    1 Titular ({currentUser.name}) + {currentUser.dependents?.length || 0} Dependente(s)
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900 text-app-gold rounded-xl font-mono text-xs font-bold border border-slate-800 text-center self-start sm:self-auto">
                Total: {1 + (currentUser.dependents?.length || 0)} Ingressos
              </div>
            </div>

            {/* List of Dependents */}
            {(!currentUser.dependents || currentUser.dependents.length === 0) ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto my-8">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200/60">
                  <Baby className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 font-display">Nenhuma criança cadastrada ainda</h3>
                  <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                    Se você pretende levar seus filhos ao evento, clique no botão abaixo para adicionar os dados delas. No dia da convenção, apenas apresente o seu QR Code principal para liberar a entrada de todos.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="px-6 py-3 bg-app-medium hover:bg-app-dark text-white font-bold text-xs rounded-2xl inline-flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Primeira Criança</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentUser.dependents.map((dep) => (
                  <div
                    key={dep.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-app-medium/30 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border border-amber-300/50 flex items-center justify-center font-bold shrink-0">
                        <Baby className="w-6 h-6 text-app-deep" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">{dep.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{calculateAge(dep.birthDate)}</span>
                          <span>•</span>
                          <span>Nasc: {formatDateBR(dep.birthDate)}</span>
                        </div>
                        <div className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Ingresso Infantil Válido</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(dep)}
                        className="p-2 text-slate-400 hover:text-app-medium hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Editar dados"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingDependent(dep)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Excluir dependente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

              {/* Zona de Perigo: Cancelar Ingresso */}
              <div className="mt-6 border border-red-200 bg-red-50/50 p-5 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-900">Cancelar Ingresso & Excluir Conta</h4>
                    <p className="text-xs text-red-700 mt-1 font-light leading-relaxed">
                      Se você não puder comparecer, cancele sua reserva. Sua conta será excluída do sistema e a vaga ficará disponível imediatamente para outro participante.
                    </p>
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancelar Meu Ingresso</span>
                    </button>
                  </div>
                </div>
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
                  9ª Convenção Municipal de Quartetos
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
              <div className="p-3 bg-white rounded-2xl relative shadow-lg flex items-center justify-center">
                <QRCodeSVG 
                  value={currentUser.id} 
                  size={135} 
                  level="H"
                  marginSize={1}
                  fgColor="#020617"
                />
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

    {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-app-gold animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Add/Edit Dependent */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8"
            >
              <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-app-gold/15 border border-app-gold/30 flex items-center justify-center">
                    <Baby className="w-5 h-5 text-app-gold" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-white">
                      {editingDependent ? 'Editar Dados da Criança' : 'Cadastrar Ingresso Infantil'}
                    </h3>
                    <p className="text-[10px] text-app-gold font-mono uppercase tracking-wider">
                      Vínculo Direto com Responsável
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDependent} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nome Completo da Criança *
                  </label>
                  <input
                    type="text"
                    required
                    value={depName}
                    onChange={(e) => setDepName(e.target.value)}
                    placeholder="Ex: Gabriel Silva"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-app-medium text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Data de Nascimento *
                    </label>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                      Limite de Idade: Até 15 anos
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    value={depBirthDate}
                    onChange={(e) => {
                      setDepBirthDate(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-app-medium text-xs font-medium"
                  />
                  {depBirthDate && (
                    <p className={`text-[11px] font-medium mt-1 flex items-center space-x-1 ${getAgeInYears(depBirthDate) > 15 ? 'text-red-600 font-bold' : 'text-emerald-700 font-semibold'}`}>
                      {getAgeInYears(depBirthDate) > 15 ? (
                        <span>⚠️ Idade calculada: {calculateAge(depBirthDate)} (Acima do limite de 15 anos)</span>
                      ) : (
                        <span>✓ Idade calculada: {calculateAge(depBirthDate)} (Dentro do limite de 15 anos)</span>
                      )}
                    </p>
                  )}
                </div>

                <div className="bg-amber-50/80 border border-amber-200/70 p-3.5 rounded-2xl text-[11px] text-amber-950 font-light leading-relaxed flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-app-gold shrink-0 mt-0.5" />
                  <p>
                    Ao cadastrar a criança, o ingresso estará unificado na sua conta (<strong>{currentUser.name}</strong>). Não é necessário e-mail ou celular para a criança.
                  </p>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-app-medium hover:bg-app-dark text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
                  >
                    {editingDependent ? 'Atualizar Dados' : 'Salvar Ingresso'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingDependent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingDependent(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 z-10 border border-slate-100"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Remover Dependente?</h3>
                <p className="text-xs text-slate-500 font-light mt-1 leading-relaxed">
                  Tem certeza que deseja apagar o registro de <strong>{deletingDependent.name}</strong>? O ingresso infantil vinculado será cancelado.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setDeletingDependent(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Sim, Remover
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Cancelamento de Ingresso */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !cancelLoading && setIsCancelModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-4 z-10 border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
              
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 font-display tracking-tight">
                  Tem certeza que você quer cancelar seu ingresso?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-light mt-3 leading-relaxed">
                  Ao confirmar o cancelamento, <strong className="text-red-600 font-semibold">sua conta e inscrição serão excluídas permanentemente</strong>. A vaga ficará aberta e disponível imediatamente para outra pessoa no site do evento.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Atenção: Ação Irreversível</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-normal">
                  Se você cancelar, seu ingresso será apagado e você só poderá se inscrever novamente se ainda restarem vagas no evento.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={cancelLoading}
                  className="w-full sm:w-1/2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Manter Meu Ingresso
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelTicket}
                  disabled={cancelLoading}
                  className="w-full sm:w-1/2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-red-600/20 flex items-center justify-center space-x-2"
                >
                  {cancelLoading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Cancelando...</span>
                    </span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sim, Cancelar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
