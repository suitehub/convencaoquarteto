/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Ticket, LogIn, Music, Heart, Copy, Check, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { EventConfig } from '../types';

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
      <main className="flex-1 relative z-10 flex flex-col items-center">
        
        {/* Banner principal */}
        <section className="pt-16 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-app-gold/10 border border-app-gold/20 text-app-gold mb-6 font-mono uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MÚSICA • ADORAÇÃO • COMUNHÃO</span>
          </span>

          {/* Event Name */}
          <h1 className="text-4xl sm:text-7xl font-black font-display tracking-tight leading-[1.05] mb-6">
            9ª Convenção Municipal <br />
            <span className="bg-clip-text text-transparent animate-gradient-slide">
              de Quartetos
            </span>
          </h1>

          {/* Brief event description */}
          <p className="text-sm sm:text-base text-slate-200 font-light mb-10 max-w-3xl leading-relaxed">
            O maior encontro de música vocal harmônica e quartetos do município. Venha adorar e se inspirar com apresentações marcantes, capacitação técnica e o tradicional grande coro de vozes. Participe deste momento inesquecível de louvor e desenvolvimento vocal focado em conectar pessoas.
            <span className="block mt-4 text-app-gold font-mono font-bold text-xs tracking-widest sm:text-sm">
              #CuidandoDePessoas
            </span>
          </p>

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

          {/* Event Details metadata card */}
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative overflow-hidden border border-slate-200">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-app-medium/20 via-app-gold/20 to-app-medium/20" />
            
            {/* Date */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-app-light rounded-2xl text-app-medium border border-slate-200 shadow-inner">
                <Calendar className="w-5 h-5 text-app-medium" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-app-medium uppercase tracking-widest font-mono">Data do Evento</span>
                <p className="text-app-deep text-sm font-bold mt-1 font-display">24 a 26 de Julho de 2026</p>
                <p className="text-slate-500 text-xs mt-0.5 font-light">Sexta, Sábado e Domingo</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start space-x-4 md:border-l md:border-slate-150 md:pl-6">
              <div className="p-3 bg-app-light rounded-2xl text-app-gold border border-slate-200 shadow-inner">
                <Clock className="w-5 h-5 text-app-gold" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Horário Oficial</span>
                <p className="text-app-deep text-sm font-bold mt-1 font-display">A partir das 19:00</p>
                <p className="text-slate-500 text-xs mt-0.5 font-light">Abertura dos portões às 18:00</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-4 md:border-l md:border-slate-150 md:pl-6">
              <div className="p-3 bg-app-light rounded-2xl text-app-medium border border-slate-200 shadow-inner">
                <MapPin className="w-5 h-5 text-app-medium" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-app-medium uppercase tracking-widest font-mono">Localização</span>
                <p className="text-app-deep text-sm font-bold mt-1 font-display">IASD Nova Semente</p>
                <p className="text-slate-600 text-xs mt-1 font-light leading-relaxed">
                  R. Cubatão, 48 - Paraíso <br />
                  São Paulo - SP, 04013-040
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guest Quartets highlight section */}
        <section className="w-full max-w-7xl px-6 py-24 border-t border-app-medium/20 bg-app-deep relative overflow-hidden">
          
          {/* Subtle grid on the background matching the reference image */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2c6cbf_1px,transparent_1px),linear-gradient(to_bottom,#2c6cbf_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            <span className="text-[10px] font-bold text-app-gold uppercase tracking-widest font-mono">Quartetos Confirmados</span>
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mt-2">
              Quartetos Convidados Especiais
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-3 font-light leading-relaxed">
              Vozes de referência que inspiram gerações e conduzem momentos inesquecíveis de adoração em nosso município.
            </p>
          </div>

          {/* 3-Column Immersive Stage Display with Scroll Fade/Rise Effects */}
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-end justify-center gap-8 md:gap-4 lg:gap-8 z-10 pt-8">
            
            {/* Background Spotlights */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-app-medium/10 blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-app-gold/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-app-medium/10 blur-[100px] pointer-events-none" />

            {/* JASD (Left column) */}
            <motion.div 
              initial={{ opacity: 0, y: 100, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
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
              initial={{ opacity: 0, y: 120, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
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
              initial={{ opacity: 0, y: 100, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
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
            whileHover={{ y: -6, boxShadow: "0 30px 60px -15px rgba(44, 108, 191, 0.15)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-800"
          >
            
            {/* Elegant geometric grid lines inside the card */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-75 pointer-events-none" />
            
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
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[9px] font-bold bg-app-gold/10 border border-app-gold/20 text-app-deep mb-4 font-mono uppercase tracking-widest">
                  <Heart className="w-3 h-3 fill-app-gold text-app-gold" />
                  <span>Apoie este Projeto</span>
                </span>
                
                <h2 className="text-2xl font-black font-display tracking-tight text-app-deep">
                  Ajude a Multiplicar o Alcance
                </h2>
                
                <p className="text-slate-600 text-xs sm:text-sm font-light mt-3 leading-relaxed">
                  A Convenção Municipal de Quartetos é um projeto voluntário. Sua contribuição de qualquer valor nos apoia com custos de transporte, logística técnica, estrutura física da IASD Nova Semente, e possibilita trazer grupos talentosos de várias partes do estado.
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
              <div className="md:w-2/5 w-full bg-app-light border border-slate-200 rounded-2xl p-5 flex flex-col justify-center text-center">
                <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">CONTRIBUIÇÃO VOLUNTÁRIA</p>
                <p className="text-slate-400 text-[9px] mt-1">Chave Pix (Celular):</p>
                
                <div className="my-3 p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                  <span className="text-app-deep font-mono font-bold text-sm select-all">11 99544-9821</span>
                  <button
                    onClick={handleCopyPix}
                    className="p-2 rounded-lg bg-app-light hover:bg-slate-200 text-app-medium transition-colors cursor-pointer"
                    title="Copiar Chave Pix"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                {copied && (
                  <span className="text-[10px] text-emerald-600 font-mono font-bold animate-pulse">
                    Chave PIX copiada!
                  </span>
                )}

                <div className="mt-2 text-left border-t border-slate-200 pt-2.5 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">TITULAR:</span>
                    <span className="text-slate-700 font-bold">Bruno Camilo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DESTINO:</span>
                    <span className="text-slate-700 font-bold">Convenção de Quartetos</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-app-deep border-t border-app-medium/30 py-12 px-6 text-white/90">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
            <h4 className="text-xs font-bold text-app-gold uppercase tracking-wider mb-4 font-mono">Inscrições</h4>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>
                <button onClick={() => onNavigate('cadastro')} className="hover:text-app-gold cursor-pointer transition-colors text-left">
                  Reserva de Ingresso (Público)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cadastro-quarteto')} className="hover:text-app-gold cursor-pointer transition-colors text-left flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-gold animate-ping" />
                  <span>Inscrição de Quarteto Participante</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-app-gold uppercase tracking-wider mb-4 font-mono">Portais Internos</h4>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-app-gold cursor-pointer transition-colors text-left">
                  Painel do Participante / Grupo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login', 'reception')} className="hover:text-app-gold cursor-pointer transition-colors text-left">
                  Recepção / Credenciamento (Staff)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard', 'organizer')} className="hover:text-app-gold cursor-pointer transition-colors text-left">
                  Painel do Organizador (Admin)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-app-gold uppercase tracking-wider mb-4 font-mono">Apoio Comercial</h4>
            <div className="bg-app-medium/20 p-4 rounded-xl border border-app-medium/30 text-xs">
              <p className="text-slate-200 font-light leading-relaxed">
                Este é um <strong className="text-app-gold font-bold">Protótipo de Alta Fidelidade</strong> para fins comerciais e de captação de recursos. Use a navegação ou os preenchimentos rápidos de demonstração.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-app-medium/20 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-mono">
          <span>© 2026 9ª Convenção Municipal de Quartetos. Todos os direitos reservados.</span>
          <span className="mt-2 sm:mt-0 uppercase tracking-widest text-app-gold">#CuidandoDePessoas</span>
        </div>
      </footer>

    </div>
  );
}
