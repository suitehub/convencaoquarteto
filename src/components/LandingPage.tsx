/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Ticket, LogIn, Music, Heart, Copy, Check, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { EventConfig } from '../types';
import backgroundImg from './background.png';

interface LandingPageProps {
  eventConfig: EventConfig;
  onNavigate: (view: string, role?: 'public' | 'participant' | 'reception' | 'organizer') => void;
  participantsCount?: number;
}

export default function LandingPage({ eventConfig, onNavigate, participantsCount = 0 }: LandingPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText('11995449821');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-app-deep text-white flex flex-col selection:bg-app-medium selection:text-white relative overflow-hidden">
      
      {/* Immersive Brand Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-app-medium/10 blur-[130px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-app-gold/5 blur-[120px] translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[450px] h-[450px] rounded-full bg-app-medium/5 blur-[100px] -translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[550px] h-[550px] rounded-full bg-app-gold/10 blur-[120px] translate-y-1/3 pointer-events-none" />

      {/* Light Beams from Heaven - Strategic visual fomento */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-app-gold/5 via-transparent to-transparent opacity-60 pointer-events-none z-0" />
      <div className="absolute top-[-200px] left-[15%] w-[150px] h-[1000px] bg-gradient-to-b from-app-gold/5 via-app-gold/1 to-transparent rotate-12 blur-[40px] pointer-events-none z-0" />
      <div className="absolute top-[-200px] right-[20%] w-[120px] h-[1000px] bg-gradient-to-b from-app-medium/5 via-app-medium/1 to-transparent -rotate-12 blur-[30px] pointer-events-none z-0" />

      {/* Soft texture inspired by baptismal robe/veste batismal */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 C 20 30, 40 50, 60 30 C 70 20, 80 40, 80 40 L80 80 L0 80 Z' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M0 10 C 30 40, 50 10, 80 30' stroke='%23ffffff' stroke-width='0.5' fill='none' stroke-opacity='0.15'/%3E%3C/svg%3E")`,
        backgroundSize: '160px 160px'
      }} />

      {/* Elegant geometric grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-app-deep/90 backdrop-blur-md border-b border-app-medium/20 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 shrink" onClick={() => onNavigate('landing')}>
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-app-medium to-app-gold text-white shadow-lg shadow-app-medium/10 shrink-0">
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-app-gold uppercase tracking-wider block leading-tight font-mono truncate">
                9ª Convenção<span className="hidden sm:inline"> Municipal</span>
              </span>
              <span className="text-xs sm:text-sm font-black text-white font-display tracking-tight block leading-none">
                DE QUARTETOS
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <span className="hidden lg:inline text-[10px] text-slate-400 font-mono tracking-wider font-semibold">
              #CuidandoDePessoas
            </span>
            <button
              onClick={() => onNavigate('login')}
              className="px-2.5 py-2 sm:px-4 sm:py-2 text-xs font-bold font-mono text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 sm:space-x-1.5 border border-transparent hover:border-white/10 shrink-0"
              title="Login"
            >
              <LogIn className="w-4 h-4 text-app-gold shrink-0" />
              <span className="hidden sm:inline">LOGIN</span>
            </button>
            <button
              onClick={() => onNavigate('cadastro')}
              className="px-3 py-2 sm:px-5 sm:py-2.5 text-xs font-bold font-mono bg-app-gold hover:bg-app-gold/90 text-app-deep shadow-lg shadow-app-gold/15 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 sm:space-x-2 font-black shrink-0"
            >
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-app-deep shrink-0" />
              <span>RESERVAR<span className="hidden sm:inline"> INGRESSO</span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section (Main Banner) */}
      <main className="flex-1 relative z-10 w-full flex flex-col items-center">
        
        {/* Full-width Hero Banner with Image Background */}
        <div className="w-full relative overflow-hidden" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(18, 58, 109, 0.45) 0%, rgba(18, 58, 109, 0.8) 70%, rgba(18, 58, 109, 1) 100%), url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Glowing lighting overlays specifically on the hero backdrop to make it pop like the mockup */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-app-medium/15 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Banner principal */}
          <section className="pt-16 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative z-10">
          
          {/* Main Hero block with scroll animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >

            {/* Event Name */}
            <h1 className="text-4xl sm:text-7xl font-black font-display tracking-tight leading-[1.05] mb-2">
              9ª Convenção Municipal <br />
              <span className="bg-clip-text text-transparent animate-gradient-slide">
                de Quartetos
              </span>
            </h1>

            {/* Subtítulo da Edição & Selo Temático */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8 flex flex-col items-center"
            >
              <h2 className="text-2xl sm:text-4xl font-black font-display text-app-gold tracking-widest uppercase filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.2)]">
                Vozes em Missão
              </h2>
              <div className="mt-3 text-center max-w-lg">
                <span className="text-[10px] sm:text-xs font-semibold text-app-gold tracking-wider uppercase font-mono text-center">
                  Edição Temática 2026 • Inspirada pelo projeto Roupão da Fé
                </span>
              </div>
            </motion.div>

            {/* Brief event description */}
            <p className="text-sm sm:text-base text-slate-200 font-light mb-8 max-w-3xl leading-relaxed">
              O maior encontro de música vocal harmônica e quartetos do município. Venha adorar e se inspirar com apresentações marcantes, capacitação técnica e o tradicional grande coro de vozes. Participe deste momento inesquecível de louvor e desenvolvimento vocal focado em conectar pessoas.
            </p>

            {/* Seção Institucional: Vozes em Missão */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.8 }}
              className="mt-14 mb-14 max-w-3xl text-center relative z-10 flex flex-col items-center"
            >
              <div className="flex items-center space-x-2 bg-gradient-to-r from-app-gold/10 via-app-gold/25 to-app-gold/10 border border-app-gold/30 px-4 py-1.5 rounded-full shadow-lg shadow-app-gold/5 mb-4">
                <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">
                  Propósito da Edição
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide font-display mb-3 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-app-gold" />
                  <span>Vozes em Missão</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light max-w-2xl mx-auto">
                  Nesta edição, queremos recordar a essência da Convenção Municipal de Quartetos: usar a música como instrumento para conduzir pessoas de volta aos braços de Cristo. Inspirados pelo projeto Roupão da Fé, reafirmamos nosso compromisso com o evangelismo e o resgate de vidas.
                </p>
              </div>
            </motion.div>

            {/* Main CTA button: Large, prominent, glowing, pulse anim */}
            <div className="relative group mb-16">
              {participantsCount >= 445 ? (
                <button
                  onClick={() => onNavigate('cadastro')}
                  className="relative w-full sm:w-auto px-10 py-5 text-base bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-2xl border border-red-500 transition-all flex items-center justify-center space-x-3.5 font-black uppercase tracking-wide cursor-pointer"
                >
                  <Ticket className="w-6 h-6 text-white animate-bounce" />
                  <span>INSCRIÇÕES ENCERRADAS (LOTADO)</span>
                </button>
              ) : (
                <>
                  <div className="absolute -inset-1 bg-gradient-to-r from-app-medium via-app-gold to-app-medium rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                  <button
                    onClick={() => onNavigate('cadastro')}
                    className="relative w-full sm:w-auto px-10 py-5 text-base bg-app-gold hover:bg-app-gold/95 text-app-deep rounded-2xl shadow-2xl hover:shadow-app-gold/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center space-x-3.5 font-black"
                  >
                    <Ticket className="w-6 h-6 text-app-deep" />
                    <span>RESERVAR INGRESSO GRATUITO</span>
                  </button>
                  <span className="absolute top-full mt-2 left-0 right-0 text-center text-xs font-mono text-slate-300 font-medium">
                    Garanta sua vaga! Apenas <strong className="text-app-gold">{445 - participantsCount}</strong> ingressos restantes de 445.
                  </span>
                </>
              )}
            </div>
          </motion.div>

          {/* Event Details metadata card */}
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl mt-16 sm:mt-24 bg-slate-950/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative overflow-hidden border border-white/10"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-app-medium/30 via-app-gold/40 to-app-medium/30" />
            
            {/* Date */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl text-app-gold border border-white/10 shadow-inner">
                <Calendar className="w-5 h-5 text-app-gold" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Data do Evento</span>
                <p className="text-white text-sm font-bold mt-1 font-display">17 de Outubro de 2026</p>
                <p className="text-slate-300 text-xs mt-0.5 font-light">Sábado</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start space-x-4 md:border-l md:border-white/10 md:pl-6">
              <div className="p-3 bg-white/5 rounded-2xl text-app-gold border border-white/10 shadow-inner">
                <Clock className="w-5 h-5 text-app-gold" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Horário Oficial</span>
                <p className="text-white text-sm font-bold mt-1 font-display">18h00</p>
                <p className="text-slate-300 text-xs mt-0.5 font-light">Recepção a partir das 17h30</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-4 md:border-l md:border-white/10 md:pl-6">
              <div className="p-3 bg-white/5 rounded-2xl text-app-gold border border-white/10 shadow-inner">
                <MapPin className="w-5 h-5 text-app-gold" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Localização</span>
                <p className="text-white text-sm font-bold mt-1 font-display">IASD Nova Semente</p>
                <p className="text-slate-300 text-xs mt-1 font-light leading-relaxed">
                  R. Cubatão, 48 - Paraíso <br />
                  São Paulo - SP, 04013-040
                </p>
              </div>
            </div>
          </motion.div>

          {/* Institutional Reference - Free elegant layout, no borders, no block container */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-full max-w-4xl mt-16 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left relative z-10"
          >
            <img 
              src="SECRETARIA DA CULTURA_VERTICAL_MONOCROM_BRANCO.png" 
              alt="Secretaria Municipal de Cultura" 
              className="h-24 w-auto opacity-95 shrink-0 hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src.includes('SECRETARIA%20DA%20CULTURA_VERTICAL_MONOCROM_BRANCO.png') || img.src.includes('SECRETARIA DA CULTURA_VERTICAL_MONOCROM_BRANCO.png')) {
                  img.src = 'SECRETARIA_DA_CULTURA_VERTICAL_MONOCROM_BRANCO.png';
                } else {
                  img.style.display = 'none';
                }
              }}
            />
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold text-app-gold uppercase tracking-widest font-mono block">
                Patrimônio e Amparo Oficial
              </span>
              <p className="text-white text-base sm:text-lg font-medium leading-relaxed font-sans">
                A <span className="text-app-gold font-bold">Convenção Municipal de Quartetos</span> é um marco cultural oficializado! 
                Este evento é amparado e realizado com pleno fundamento na{' '}
                <span className="text-app-gold font-bold underline decoration-app-gold/40 underline-offset-4">
                  Lei Municipal nº 16.894, de 14 de maio de 2018
                </span>
                , integrando oficialmente a agenda cultural e de fomento artístico do município de São Paulo.
              </p>
            </div>
          </motion.div>
        </section>
      </div>

        {/* Guest Quartets highlight section */}
        <section className="w-full max-w-7xl px-6 py-24 border-t border-app-medium/20 bg-app-deep relative overflow-hidden">
          
          {/* Subtle grid on the background matching the reference image */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2c6cbf_1px,transparent_1px),linear-gradient(to_bottom,#2c6cbf_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-16 relative z-10"
          >
            <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Quartetos Confirmados • Vozes em Missão</span>
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mt-2">
              Quartetos Convidados Especiais
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-3 font-light leading-relaxed">
              Vozes de referência que inspiram gerações e conduzem momentos inesquecíveis de adoração em nosso município.
            </p>
          </motion.div>

          {/* 3-Column Immersive Stage Display with Scroll Fade/Rise Effects */}
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-end justify-center gap-8 md:gap-4 lg:gap-8 z-10 pt-8">
            
            {/* Background Spotlights */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-app-medium/10 blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-app-gold/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-app-medium/10 blur-[100px] pointer-events-none" />

            {/* JASD (Left column) */}
            <motion.div 
              initial={{ opacity: 0, y: 80, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-full md:w-[32%] flex flex-col items-center group relative order-2 md:order-1"
            >
              <div className="relative w-full h-[320px] md:h-[380px] flex items-end justify-center">
                <img 
                  src="jasd.png" 
                  alt="JASD" 
                  referrerPolicy="no-referrer"
                  className="max-h-full w-auto object-contain object-bottom group-hover:scale-[1.03] transition-transform duration-700"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    const sibling = e.currentTarget.nextElementSibling;
                    if (sibling) sibling.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-4 text-center font-mono text-slate-500">
                  <Users className="w-12 h-12 text-app-medium/80 mb-2" />
                  <span className="text-[11px] font-bold tracking-widest uppercase">JASD</span>
                </div>
              </div>
              
              {/* Giant elegant font under the image */}
              <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-[0.15em] uppercase text-center mt-4 relative z-20 leading-none group-hover:text-app-medium transition-colors">
                JASD
              </h3>
            </motion.div>

            {/* ARAUTOS DO REI (Center column - Taller/Larger Spotlight) */}
            <motion.div 
              initial={{ opacity: 0, y: 100, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full md:w-[36%] flex flex-col items-center group relative z-20 order-1 md:order-2"
            >
              <div className="relative w-full h-[320px] md:h-[410px] flex items-end justify-center">
                <img 
                  src="arautos.png" 
                  alt="Arautos do Rei" 
                  referrerPolicy="no-referrer"
                  className="max-h-full w-auto object-contain object-bottom group-hover:scale-[1.03] transition-transform duration-700"
                  onError={(e) => {
                    // Fallback
                    e.currentTarget.style.display = 'none';
                    const sibling = e.currentTarget.nextElementSibling;
                    if (sibling) sibling.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-4 text-center font-mono text-slate-500">
                  <Music className="w-14 h-14 text-app-gold/80 mb-2" />
                  <span className="text-[11px] font-bold tracking-widest uppercase">Arautos do Rei</span>
                </div>
              </div>
              
              {/* Giant majestic font under the image */}
              <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-[0.15em] uppercase text-center mt-4 relative z-20 leading-none group-hover:text-app-gold transition-colors">
                Arautos do Rei
              </h3>
            </motion.div>

            {/* MENSAGEM (Right column) */}
            <motion.div 
              initial={{ opacity: 0, y: 80, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="w-full md:w-[32%] flex flex-col items-center group relative order-3 md:order-3"
            >
              <div className="relative w-full h-[320px] md:h-[380px] flex items-end justify-center">
                <img 
                  src="mensagem.png" 
                  alt="A Mensagem" 
                  referrerPolicy="no-referrer"
                  className="max-h-full w-auto object-contain object-bottom group-hover:scale-[1.03] transition-transform duration-700"
                  onError={(e) => {
                    // Fallback
                    e.currentTarget.style.display = 'none';
                    const sibling = e.currentTarget.nextElementSibling;
                    if (sibling) sibling.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-4 text-center font-mono text-slate-500">
                  <Music className="w-12 h-12 text-app-medium/80 mb-2" />
                  <span className="text-[11px] font-bold tracking-widest uppercase">Mensagem</span>
                </div>
              </div>
              
              {/* Giant elegant font under the image */}
              <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-[0.15em] uppercase text-center mt-4 relative z-20 leading-none group-hover:text-app-medium transition-colors">
                Mensagem
              </h3>
            </motion.div>

          </div>
        </section>

        {/* Support This Project section */}
        <section className="w-full max-w-4xl mx-auto px-6 py-12 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            whileHover={{ y: -6, scale: 1.01, boxShadow: "0 30px 60px -15px rgba(44, 108, 191, 0.15)" }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20 
            }}
            className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white"
          >
            
            {/* Elegant geometric grid lines inside the card */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-40 pointer-events-none" />
            
            {/* Dynamic floating light dots or shapes on grid intersection */}
            <motion.div 
              animate={{ 
                opacity: [0.15, 0.4, 0.15],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-app-medium/30 blur-xs pointer-events-none"
            />
            <motion.div 
              animate={{ 
                opacity: [0.1, 0.35, 0.1],
                scale: [1.2, 0.8, 1.2]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
              className="absolute bottom-1/4 right-1/3 w-4 h-4 rounded-full bg-app-gold/40 blur-xs pointer-events-none"
            />

            {/* Ambient dynamic light overlays */}
            <motion.div 
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 15, 0],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 w-[220px] h-[220px] rounded-full bg-app-medium/10 blur-[50px] pointer-events-none" 
            />
            <motion.div 
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, -15, 0],
                y: [0, 15, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-0 left-0 w-[220px] h-[220px] rounded-full bg-app-gold/15 blur-[50px] pointer-events-none" 
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="md:w-3/5 text-left">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[9px] font-bold bg-app-gold/10 border border-app-gold/20 text-app-gold mb-4 font-mono uppercase tracking-widest">
                  <Heart className="w-3 h-3 fill-app-gold text-app-gold" />
                  <span>Apoie este Projeto</span>
                </span>
                
                <h2 className="text-2xl font-black font-display tracking-tight text-white">
                  Ajude a Multiplicar o Alcance
                </h2>
                
                <p className="text-slate-300 text-xs sm:text-sm font-light mt-3 leading-relaxed">
                  A Convenção Municipal de Quartetos é um projeto voluntário. Sua contribuição de qualquer valor nos apoia com custos de transporte, logística técnica, e possibilita trazer grupos talentosos de várias partes do estado.
                </p>
                
                <motion.p 
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-app-gold text-xs mt-4 font-black font-mono uppercase tracking-widest block drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]"
                >
                  #CuidandoDePessoas
                </motion.p>
              </div>

              {/* PIX Detail Card */}
              <div className="md:w-2/5 w-full bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-center text-center">
                <p className="text-slate-300 text-[10px] font-mono tracking-widest uppercase">CONTRIBUIÇÃO VOLUNTÁRIA</p>
                <p className="text-slate-400 text-[9px] mt-1">Chave Pix (Celular):</p>
                
                <div className="my-3 p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between shadow-xs">
                  <span className="text-app-gold font-mono font-bold text-sm select-all">11 99544-9821</span>
                  <button
                    onClick={handleCopyPix}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-app-gold transition-colors cursor-pointer"
                    title="Copiar Chave Pix"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
                  </button>
                </div>
                
                {copied && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                    Chave PIX copiada!
                  </span>
                )}

                <div className="mt-2 text-left border-t border-white/10 pt-2.5 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">TITULAR:</span>
                    <span className="text-white font-bold">Bruno Camilo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DESTINO:</span>
                    <span className="text-white font-bold">Convenção de Quartetos</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        {/* Closing Message / Mensagem de encerramento */}
        <section className="w-full max-w-4xl mx-auto px-6 py-16 mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.8 }}
            className="relative py-12 px-8 rounded-3xl bg-gradient-to-r from-app-medium/5 via-app-gold/5 to-app-medium/5 border border-app-gold/10 overflow-hidden"
          >
            {/* Ambient decoration light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-app-gold/10 blur-[80px] pointer-events-none" />
            
            {/* Glowing Cross or Sparkles icon decoration */}
            <div className="relative z-10 flex justify-center mb-6">
              <div className="p-3 rounded-full bg-app-gold/10 border border-app-gold/30">
                <Sparkles className="w-6 h-6 text-app-gold animate-pulse" />
              </div>
            </div>
            
            <p className="relative z-10 text-xl sm:text-2xl font-display font-medium text-slate-100 italic tracking-wide leading-relaxed max-w-2xl mx-auto">
              "O palco é apenas o começo. Nossa missão continua onde há uma alma esperando por Cristo."
            </p>
            
            <div className="relative z-10 mt-6 flex items-center justify-center space-x-2">
              <span className="h-[1px] w-8 bg-app-gold/30" />
              <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Vozes em Missão</span>
              <span className="h-[1px] w-8 bg-app-gold/30" />
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-app-deep border-t border-app-medium/30 py-12 px-6 text-white/90">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-white mb-4">
              <Music className="w-6 h-6 text-app-gold" />
              <span className="font-extrabold text-sm font-display uppercase tracking-wider">9ª Convenção</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Uma iniciativa para incentivo, apoio, resgate e desenvolvimento da música vocal harmônica de quartetos.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-app-gold uppercase tracking-wider mb-4 font-mono">Acomodação Livre</h4>
            <div className="bg-app-medium/20 p-4 rounded-xl border border-app-medium/30 text-xs">
              <p className="text-slate-200 font-light leading-relaxed">
                Lembramos que <strong className="text-app-gold font-bold">não haverá poltronas reservadas</strong>. O acesso ao auditório é gratuito e a ocupação dos assentos dar-se-á por ordem de chegada.
              </p>
            </div>
          </div>
        </div>

        {/* Institutional Support Row */}
        <div className="max-w-7xl mx-auto pt-6 pb-2 border-t border-app-medium/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-center md:text-left">
            <h5 className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Apoio Institucional e Fomento</h5>
            <p className="text-[11px] text-slate-300 font-light mt-0.5 max-w-xl leading-relaxed">
              Incentivo cultural e divulgação amparados pela <strong className="text-white font-semibold">Lei Municipal nº 16.894/2018</strong>. Órgãos relacionados ao desenvolvimento e difusão da legislação oficial.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center bg-white/5 py-2 px-4 rounded-xl border border-white/5 shadow-inner">
            <img 
              src="SECRETARIA_DA_CULTURA_HORIZONTAL_MONOCROM_BRANCO.png" 
              alt="Secretaria Municipal de Cultura" 
              className="h-8 sm:h-9 w-auto opacity-80 hover:opacity-100 transition-opacity object-contain"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src.includes('SECRETARIA_DA_CULTURA_HORIZONTAL_MONOCROM_BRANCO.png')) {
                  img.src = 'SECRETARIA DA CULTURA_HORIZONTAL_MONOCROM_BRANCO.png';
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-app-medium/20 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-mono gap-4">
          <span className="text-center md:text-left">© 2026 9ª Convenção Municipal de Quartetos. Todos os direitos reservados.</span>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center">
            <span className="uppercase tracking-widest text-app-gold font-bold">#CuidandoDePessoas</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <button
              onClick={() => onNavigate('cadastro-quarteto')}
              className="text-slate-400 hover:text-app-gold transition-colors font-bold flex items-center space-x-1 uppercase tracking-widest text-[11px] cursor-pointer"
              title="Área de Cadastro dos Quartetos Participantes"
            >
              <span>[ Cadastro de Quartetos ]</span>
            </button>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="normal-case text-slate-300">
              Desenvolvido por{' '}
              <a 
                href="https://suitehub.github.io/portifolio/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-app-gold hover:text-white underline font-bold transition-colors"
              >
                Suite Hub
              </a>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
