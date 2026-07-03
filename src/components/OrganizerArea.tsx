/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart as RechartsBarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  LayoutDashboard, Users, BarChart3, Settings, Gift, Music, Search, 
  SlidersHorizontal, CheckCircle2, AlertCircle, Save, Calendar, Clock, 
  MapPin, Sliders, ArrowUpRight, Check, Menu, X, UserPlus, Key, Download, FileSpreadsheet
} from 'lucide-react';
import { Participant, EventConfig, StaffUser } from '../types';
import Sorteio from './Sorteio';

interface OrganizerAreaProps {
  participants: Participant[];
  staffUsers?: StaffUser[];
  onAddStaffUser?: (newStaff: { name: string; username: string; password?: string }) => void;
  eventConfig: EventConfig;
  onUpdateConfig: (newConfig: EventConfig) => void;
  onCheckIn: (id: string) => void;
  onLogout: () => void;
}

export default function OrganizerArea({ 
  participants, 
  staffUsers = [],
  onAddStaffUser,
  eventConfig, 
  onUpdateConfig, 
  onCheckIn, 
  onLogout 
}: OrganizerAreaProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participantes' | 'estatisticas' | 'sorteio' | 'equipe' | 'configuracoes'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Settings form local state
  const [localConfig, setLocalConfig] = useState<EventConfig>({ ...eventConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Staff creation local states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [staffSuccess, setStaffSuccess] = useState(false);
  const [staffError, setStaffError] = useState('');

  // Filters for participants tab
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Presente'>('Todos');
  const [cityFilter, setCityFilter] = useState('Todas');

  // Math stats based on parent state
  const totalRegistered = participants.length;
  const presentCount = participants.filter((p) => p.status === 'Presente').length;
  const pendingCount = totalRegistered - presentCount;
  const occupancyRate = eventConfig.maxParticipants > 0 
    ? Math.round((totalRegistered / eventConfig.maxParticipants) * 100) 
    : 0;
  const attendanceRate = totalRegistered > 0 
    ? Math.round((presentCount / totalRegistered) * 100) 
    : 0;

  // Compile unique cities list for filter dropdown
  const uniqueCities = [
    'Todas', 
    ...Array.from(new Set(participants.map((p) => p.city ? p.city.split(' - ')[0] : '').filter(Boolean)))
  ];

  // Filter list
  const filteredParts = participants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.email.toLowerCase().includes(search.toLowerCase()) ||
                          p.phone.includes(search);
    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
    const matchesCity = cityFilter === 'Todas' || (p.city && p.city.startsWith(cityFilter));
    return matchesSearch && matchesStatus && matchesCity;
  });

  // Take the 5 latest check-ins to display on dashboard
  const latestCheckIns = participants
    .filter((p) => p.status === 'Presente')
    .slice(-5)
    .reverse();

  // MOCK HISTORIC CHARTS DATA
  const registrationChartData = [
    { name: 'Maio S1', 'Reservas': 8, 'Meta': 5 },
    { name: 'Maio S2', 'Reservas': 15, 'Meta': 10 },
    { name: 'Jun S1', 'Reservas': 22, 'Meta': 15 },
    { name: 'Jun S2', 'Reservas': 30, 'Meta': 20 },
    { name: 'Jun S3', 'Reservas': 35, 'Meta': 25 },
    { name: 'Jun S4', 'Reservas': totalRegistered, 'Meta': 30 },
  ];

  const checkinChartData = [
    { name: '18:00', 'Check-ins': Math.round(presentCount * 0.15), 'Fila Esperada': 5 },
    { name: '18:30', 'Check-ins': Math.round(presentCount * 0.35), 'Fila Esperada': 12 },
    { name: '19:00', 'Check-ins': Math.round(presentCount * 0.25), 'Fila Esperada': 20 },
    { name: '19:30', 'Check-ins': Math.round(presentCount * 0.18), 'Fila Esperada': 15 },
    { name: '20:00', 'Check-ins': Math.round(presentCount * 0.07), 'Fila Esperada': 4 },
  ];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setStaffSuccess(false);

    if (!newStaffName.trim() || !newStaffUsername.trim() || !newStaffPassword.trim()) {
      setStaffError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const usernameClean = newStaffUsername.trim().toLowerCase();

    // Check if username already exists
    const exists = staffUsers.some(
      (su) => su.username.trim().toLowerCase() === usernameClean
    );
    if (exists) {
      setStaffError('Este nome de usuário já está em uso por outro membro da equipe.');
      return;
    }

    if (onAddStaffUser) {
      onAddStaffUser({
        name: newStaffName.trim(),
        username: usernameClean,
        password: newStaffPassword.trim()
      });
      setNewStaffName('');
      setNewStaffUsername('');
      setNewStaffPassword('');
      setStaffSuccess(true);
      setTimeout(() => setStaffSuccess(false), 4000);
    }
  };

  const handleToggleParticipantStatus = (p: Participant) => {
    onCheckIn(p.id);
  };

  const handleExportLeads = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Tipo Inscrição', 'Status Presença', 'Data Registro'];
    const rows = participants.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.city || 'Não informado',
      p.registrationType || 'Público',
      p.status,
      p.registrationDate || ''
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_convencao_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      {/* Sidebar Layout */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
        
        {/* Logo block */}
        <div className="p-4 md:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-emerald-400 tracking-wider block uppercase">Painel Administrativo</span>
              <span className="text-xs font-black tracking-widest text-slate-100 uppercase font-display">ORGANIZADOR</span>
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

        {/* Menu Items - Collapsible on Mobile */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden md:flex md:flex-col md:flex-1'}`}>
          <nav className="p-4 space-y-1 flex-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('participantes'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'participantes'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Participantes</span>
            </button>

            <button
              onClick={() => { setActiveTab('estatisticas'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'estatisticas'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Estatísticas</span>
            </button>

            <button
              onClick={() => { setActiveTab('sorteio'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'sorteio'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Sorteador</span>
            </button>

            <button
              onClick={() => { setActiveTab('equipe'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'equipe'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Equipe / Recepção</span>
            </button>

            <button
              onClick={() => { setActiveTab('configuracoes'); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-sm font-medium rounded-xl flex items-center space-x-3 transition-colors cursor-pointer ${
                activeTab === 'configuracoes'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>
          </nav>

          {/* Exit and logout block */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-800 hover:border-slate-700 hover:bg-slate-850/60 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer text-center"
            >
              Sair do Portal Admin
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Workspace */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
        
        {/* HEADER BAR FOR METRICS */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Gerenciamento Geral</span>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight font-display sm:text-3xl">
              {activeTab === 'dashboard' && 'Visão Geral do Evento'}
              {activeTab === 'participantes' && 'Base de Participantes'}
              {activeTab === 'estatisticas' && 'Análises & Métricas'}
              {activeTab === 'sorteio' && 'Painel de Sorteio'}
              {activeTab === 'equipe' && 'Controle de Equipe & Recepção'}
              {activeTab === 'configuracoes' && 'Configurações Globais'}
            </h1>
          </div>

          <div className="text-xs text-slate-500 font-mono bg-white border border-slate-200/80 rounded-xl px-4 py-2 shadow-xs flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{filteredParts.length} Registros Sincronizados</span>
          </div>
        </header>

        {/* TAB 1: DASHBOARD MAIN OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
             {/* Real-time analytical stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[9px] text-slate-400 font-mono uppercase block truncate">Inscrições Ativas</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-slate-900 font-display block leading-none mt-1.5 sm:mt-2">{totalRegistered}</strong>
                <span className="text-[9px] sm:text-[10px] text-emerald-600 font-medium mt-1 sm:mt-1.5 block truncate">100% Confirmados</span>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[9px] text-slate-400 font-mono uppercase block truncate">Lotação Auditório</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-slate-900 font-display block leading-none mt-1.5 sm:mt-2">{occupancyRate}%</strong>
                <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-1 sm:mt-1.5 font-light truncate">Meta Máx: {eventConfig.maxParticipants}</span>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[9px] text-slate-400 font-mono uppercase block truncate">Check-ins</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-slate-900 font-display block leading-none mt-1.5 sm:mt-2">{presentCount}</strong>
                <span className="text-[9px] sm:text-[10px] text-teal-600 font-medium mt-1 sm:mt-1.5 block truncate">{attendanceRate}% Presentes</span>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[9px] text-slate-400 font-mono uppercase block truncate">Ausentes</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-slate-900 font-display block leading-none mt-1.5 sm:mt-2">{pendingCount}</strong>
                <span className="text-[9px] sm:text-[10px] text-amber-600 font-medium mt-1 sm:mt-1.5 block truncate">Aguardando</span>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1 bg-linear-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/10">
                <span className="text-[9px] text-emerald-600 font-mono uppercase block font-bold truncate">Aproveitamento</span>
                <strong className="text-lg sm:text-2xl font-extrabold text-emerald-800 font-display block leading-none mt-1.5 sm:mt-2">{attendanceRate}%</strong>
                <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-1 sm:mt-1.5 font-light truncate">Fator comparativo</span>
              </div>

            </div>

            {/* Charts & Real-time Check-ins splitter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Illustrative Recharts area container */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 font-display text-sm">Evolução de Reservas</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Visão cumulativa de registros realizados vs meta esperada.</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                      <Area type="monotone" dataKey="Reservas" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReservas)" />
                      <Area type="monotone" dataKey="Meta" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Real-time check-in log stream */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <h3 className="font-bold text-slate-800 font-display text-sm mb-4">Últimos Check-ins</h3>
                
                <div className="space-y-3">
                  {latestCheckIns.length > 0 ? (
                    latestCheckIns.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="overflow-hidden">
                          <span className="font-semibold text-slate-800 block truncate">{p.name}</span>
                          <span className="text-slate-500 text-[10px] truncate block">{p.city}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 rounded-sm font-mono font-bold text-[9px] uppercase tracking-wider shrink-0">
                          {p.checkInTime ? p.checkInTime.split(' ')[1] : 'PRESENTE'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 italic text-xs">
                      Nenhum check-in realizado até o momento.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('participantes')}
                  className="w-full mt-4 py-2.5 text-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                >
                  Ver Todos os Participantes
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: DETAILED PARTICIPANTS VIEW */}
        {activeTab === 'participantes' && (
          <div className="space-y-6">
            
            {/* Advanced Filters */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Live search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por nome, telefone ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-hidden text-xs transition-all"
                />
              </div>

              {/* Pill Selectors */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Status Dropdowns */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 focus:outline-hidden"
                  >
                    <option value="Todos">Todos os Status</option>
                    <option value="Pendente">Pendentes</option>
                    <option value="Presente">Presentes</option>
                  </select>
                </div>

                {/* City Dropdown */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Cidade:</span>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 focus:outline-hidden"
                  >
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Export Leads Button */}
                <button
                  type="button"
                  onClick={handleExportLeads}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:shadow-emerald-600/10 active:scale-95"
                  title="Exportar base de inscritos como leads em formato CSV"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Leads</span>
                </button>

              </div>

            </div>

            {/* Structured Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[650px] md:w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Nome / E-mail</th>
                      <th className="py-4 px-6">Telefone</th>
                      <th className="py-4 px-6">Cidade</th>
                      <th className="py-4 px-6">Tipo</th>
                      <th className="py-4 px-6 text-center">Reserva</th>
                      <th className="py-4 px-6 text-center">Check-in</th>
                      <th className="py-4 px-6 text-right">Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredParts.length > 0 ? (
                      filteredParts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-800 block">{p.name}</span>
                            <span className="text-slate-400 text-[10px]">{p.email}</span>
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-600">{p.phone}</td>
                          <td className="py-4 px-6 text-slate-500">{p.city || 'Não informado'}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              p.registrationType === 'Participante'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {p.registrationType || 'Público'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider font-mono">
                              Confirmada
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                              p.status === 'Presente'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {p.status === 'Pendente' ? (
                              <button
                                onClick={() => handleToggleParticipantStatus(p)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                              >
                                Credenciar
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono italic pr-3">
                                {p.checkInTime || 'Presença Confirmada'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                          Nenhum participante localizado com os parâmetros ativos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>DADOS PARCIAIS: MOSTRANDO {filteredParts.length} DE {totalRegistered} INSCRITOS</span>
                <span>9ª CONVENÇÃO • CONTROLE CENTRAL</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ANALYTICS DETAIL STATS */}
        {activeTab === 'estatisticas' && (
          <div className="space-y-8">
            
            {/* Grid charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Cumulative Registrations */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <h3 className="font-bold text-slate-800 font-display text-sm mb-6">Gráfico de Check-ins por Horário</h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={checkinChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Check-ins" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Fila Esperada" fill="#94a3b8" opacity={0.3} radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analytical insights widget */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 font-display text-sm mb-4">Métricas de Presença</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-500">Taxa de Comparência</span>
                        <strong className="text-slate-800 font-mono">{attendanceRate}%</strong>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${attendanceRate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-500">Taxa de Reserva de Espaço</span>
                        <strong className="text-slate-800 font-mono">{occupancyRate}%</strong>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${occupancyRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100/80 text-xs text-slate-500 leading-relaxed font-light">
                  <span className="font-bold text-slate-700 block mb-1">Nota Técnica Comercial</span>
                  Os gráficos acima ilustram em tempo real a velocidade de credenciamento. Atualmente, os horários das <strong>18h30</strong> e <strong>19h00</strong> detêm o maior volume histórico de comparecimento de quartetos.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: RAFFLE LOTTERY SCREEN */}
        {activeTab === 'sorteio' && (
          <div className="max-w-xl mx-auto">
            <Sorteio participants={participants} />
          </div>
        )}

        {/* TAB 5: COMPREHENSIVE CONFIGURATION GLOBAL SETTINGS */}
        {activeTab === 'configuracoes' && (
          <div className="max-w-2xl bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-800 font-display text-base flex items-center space-x-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                <span>Configurar Dados do Evento</span>
              </h3>
              
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl flex items-center space-x-1 border border-emerald-100">
                  <Check className="w-3.5 h-3.5" />
                  <span>Configuração Salva!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              
              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Nome da Convenção</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Music className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={localConfig.name}
                    onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Data</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={localConfig.date}
                      onChange={(e) => setLocalConfig({ ...localConfig, date: e.target.value })}
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all"
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Horário</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={localConfig.time}
                      onChange={(e) => setLocalConfig({ ...localConfig, time: e.target.value })}
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Localização</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={localConfig.location}
                    onChange={(e) => setLocalConfig({ ...localConfig, location: e.target.value })}
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all"
                  />
                </div>
              </div>

              {/* Max Cap */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Capacidade Máxima de Cadeiras</label>
                <input
                  type="number"
                  required
                  value={localConfig.maxParticipants}
                  onChange={(e) => setLocalConfig({ ...localConfig, maxParticipants: parseInt(e.target.value) || 0 })}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Descrição do Evento (Home)</label>
                <textarea
                  rows={4}
                  required
                  value={localConfig.description}
                  onChange={(e) => setLocalConfig({ ...localConfig, description: e.target.value })}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Salvar Configurações</span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* TAB 5: STAFF & EQUIPE CONTROL */}
        {activeTab === 'equipe' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Form to Create New Staff User */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                
                <div className="mb-6">
                  <span className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono mb-1">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Novo Credenciador</span>
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-display">Cadastrar Usuário Recepção</h3>
                  <p className="text-slate-500 text-xs mt-1">Crie credenciais exclusivas para a equipe da portaria e controle de check-in.</p>
                </div>

                <form onSubmit={handleCreateStaff} className="space-y-4">
                  
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ana Souza Santos"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all focus:outline-hidden"
                    />
                  </div>

                  {/* Username field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Nome de Usuário (Login)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: ana.recept"
                      value={newStaffUsername}
                      onChange={(e) => setNewStaffUsername(e.target.value.replace(/\s+/g, ''))}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Será usado no campo "Usuário" do login. Sem espaços.</span>
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Senha de Acesso</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: equipe@2026"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500/50 rounded-xl text-slate-800 text-xs transition-all focus:outline-hidden"
                    />
                  </div>

                  {staffError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{staffError}</span>
                    </div>
                  )}

                  {staffSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>Novo usuário criado com sucesso! As credenciais estão prontas para uso.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/10 active:scale-98 font-bold"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrar Colaborador</span>
                  </button>

                </form>
              </div>
            </div>

            {/* List of Current Staff Users */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Equipe Registrada</span>
                    <h3 className="text-base font-bold text-slate-900 font-display">Membros Ativos da Recepção</h3>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg font-mono">
                    {staffUsers.length} Ativo(s)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Nome / Membro</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Usuário</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Senha</th>
                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-right">Cadastrado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffUsers.map((su) => (
                        <tr key={su.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 font-bold text-xs">
                                {su.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{su.name}</p>
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-[9px] text-emerald-700 font-mono font-bold uppercase border border-emerald-100">Recepção / Check-In</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              {su.username}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-xs font-mono text-slate-500 font-medium">
                              {su.password || '••••'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right text-xs font-mono text-slate-400">
                            {su.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Instruções para Login da Recepção:</span>
                    Para testar o acesso de um colaborador criado aqui, saia do painel organizador, selecione a aba <strong className="text-slate-700">Recepção / Staff</strong> na tela de Login e insira o <strong className="text-slate-700">Usuário</strong> e a <strong className="text-slate-700">Senha</strong> cadastrados acima.
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
