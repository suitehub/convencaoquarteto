/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, RefreshCw, CheckCircle2, Maximize2, Minimize2, AlertCircle, Trash2, Gift, Trophy, UserCheck } from 'lucide-react';
import { Participant } from '../types';
import bgImage from './background.png';

interface SorteioProps {
  participants: Participant[];
}

export default function Sorteio({ participants }: SorteioProps) {
  const [shuffling, setShuffling] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [tempName, setTempName] = useState('Clique para Sorteio');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; scale: number; speed: number }>>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load drawn participants from localStorage to persist when changing tabs
  const [drawnIds, setDrawnIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sorteio_drawn_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('sorteio_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Esc key listener to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerConfetti = () => {
    const colors = ['#F59E0B', '#FCD34D', '#FFFFFF', '#D97706', '#FEF3C7', '#38BDF8'];
    const newParticles = Array.from({ length: 180 }).map((_, i) => ({
      id: i,
      x: Math.random() * 120 - 60, // relative to center
      y: Math.random() * -110 - 20, // shoot upwards
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: Math.random() * 1.3 + 0.4,
      speed: Math.random() * 2 + 3
    }));
    setParticles(newParticles);
  };

  const handleStartRaffle = () => {
    if (participants.length === 0) return;
    
    // Filter by present if any exist
    const presentList = participants.filter((p) => p.status === 'Presente');
    const basePool = presentList.length > 0 ? presentList : participants;

    // Filter out already drawn participants
    const drawingPool = basePool.filter((p) => !drawnIds.includes(p.id));

    if (drawingPool.length === 0) {
      setTempName('Todos os nomes já sorteados!');
      return;
    }

    setShuffling(true);
    setWinner(null);
    setParticles([]);

    let iterations = 0;
    const maxIterations = 38;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * drawingPool.length);
      setTempName(drawingPool[randomIndex].name);
      
      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        
        // Final draw
        const finalWinnerIndex = Math.floor(Math.random() * drawingPool.length);
        const drawnWinner = drawingPool[finalWinnerIndex];
        
        setWinner(drawnWinner);
        setTempName(drawnWinner.name);
        setShuffling(false);
        triggerConfetti();

        // Update drawn pool and history
        const updatedDrawnIds = [...drawnIds, drawnWinner.id];
        const updatedHistory = [drawnWinner, ...history];
        
        setDrawnIds(updatedDrawnIds);
        setHistory(updatedHistory);
        localStorage.setItem('sorteio_drawn_ids', JSON.stringify(updatedDrawnIds));
        localStorage.setItem('sorteio_history', JSON.stringify(updatedHistory));
      }
    }, 85);
  };

  const resetRaffle = () => {
    setWinner(null);
    setTempName('Clique para Sorteio');
    setParticles([]);
  };

  const handleClearHistory = () => {
    setDrawnIds([]);
    setHistory([]);
    localStorage.removeItem('sorteio_drawn_ids');
    localStorage.removeItem('sorteio_history');
    setWinner(null);
    setTempName('Clique para Sorteio');
    setParticles([]);
    setShowResetConfirm(false);
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    return phone.slice(0, 9) + '****';
  };

  const renderRaffleInterface = (full: boolean) => {
    const presentList = participants.filter((p) => p.status === 'Presente');
    const basePool = presentList.length > 0 ? presentList : participants;
    const drawingPool = basePool.filter((p) => !drawnIds.includes(p.id));
    const eligibleCount = basePool.length;
    const remainingCount = drawingPool.length;

    return (
      <div className="relative w-full flex flex-col items-center justify-between min-h-full py-6 sm:py-8 px-4 sm:px-8 z-10 select-none">
        
        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: '50%', y: '85%', scale: 0, opacity: 1 }}
              animate={{ 
                x: `calc(50% + ${p.x}vw)`, 
                y: `calc(85% + ${p.y}vh)`, 
                scale: p.scale,
                opacity: [1, 1, 0.9, 0],
                rotate: Math.random() * 1080
              }}
              transition={{ duration: p.speed, ease: 'easeOut' }}
              className="absolute w-3.5 h-3.5 shadow-lg"
              style={{ 
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.4 ? '50%' : '3px'
              }}
            />
          ))}
        </div>

        {/* TOP HEADER: SORTEIO Header with Gifts/Sparkles matching reference */}
        <div className="flex flex-col items-center text-center space-y-2 mt-2 sm:mt-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center space-x-3 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-sm sm:text-base font-black font-mono tracking-[0.35em] text-amber-300 uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              SORTEIO
            </span>
            <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
          </motion.div>

          <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-200 uppercase font-display drop-shadow-md">
            {shuffling ? 'EMBARALHANDO PARTICIPANTES...' : winner ? 'E O GANHADOR É...' : 'PRÓXIMO GANHADOR'}
          </p>
        </div>

        {/* CENTER STAGE: FLOATING NAME DISPLAY */}
        <div className={`my-8 sm:my-12 w-full flex flex-col items-center justify-center relative ${full ? 'min-h-[280px] sm:min-h-[360px]' : 'min-h-[220px] sm:min-h-[280px]'}`}>
          
          {/* Spotlight beam effect behind winner */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-amber-300/20 via-amber-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />

          {/* Floating animated container */}
          <motion.div
            animate={{ 
              y: shuffling ? [-3, 3, -3] : winner ? [-12, 12, -12] : [-6, 6, -6],
              scale: shuffling ? [0.98, 1.02, 0.98] : winner ? [1, 1.03, 1] : [1, 1.01, 1]
            }}
            transition={{ 
              duration: shuffling ? 0.2 : winner ? 3.5 : 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative z-10 text-center max-w-4xl px-4"
          >
            <AnimatePresence mode="wait">
              {shuffling ? (
                <motion.div
                  key="shuffling"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="space-y-4"
                >
                  <h2 className={`font-black font-display tracking-tight text-amber-300 drop-shadow-[0_0_35px_rgba(245,158,11,0.8)] uppercase truncate ${full ? 'text-5xl sm:text-7xl md:text-8xl' : 'text-4xl sm:text-6xl'}`}>
                    {tempName}
                  </h2>
                  
                  {/* Equalizer frequency bars */}
                  <div className="flex justify-center items-center space-x-1.5 h-8">
                    {[4, 10, 6, 9, 3, 8, 5, 10, 7, 4, 9, 2].map((val, idx) => (
                      <div 
                        key={idx} 
                        className="w-1.5 sm:w-2 bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-200 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
                        style={{ 
                          height: `${val * 10}%`,
                          animationDuration: `${0.2 + idx * 0.05}s`
                        }} 
                      />
                    ))}
                  </div>
                </motion.div>
              ) : winner ? (
                <motion.div
                  key="winner"
                  initial={{ scale: 0.5, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="space-y-4 flex flex-col items-center"
                >
                  {/* Glowing winner badge header */}
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-amber-400/50 px-4 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                    <Trophy className="w-5 h-5 text-yellow-300 animate-pulse" />
                    <span className="text-xs font-bold font-mono tracking-widest text-yellow-200 uppercase">
                      NOVO GANHADOR CONFIRMADO
                    </span>
                  </div>

                  {/* Winner Name in Metallic Gold Typography */}
                  <h2 className={`font-black font-display tracking-tight bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(245,158,11,0.9)] uppercase leading-none py-2 ${full ? 'text-6xl sm:text-8xl md:text-9xl' : 'text-5xl sm:text-7xl'}`}>
                    {winner.name}
                  </h2>

                  {/* Winner metadata details pill */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-black/75 backdrop-blur-md border border-amber-500/40 px-6 py-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-200"
                  >
                    {winner.city && (
                      <span className="font-medium text-amber-200">
                        📍 {winner.city}
                      </span>
                    )}
                    {winner.phone && (
                      <span className="font-mono text-slate-300">
                        📞 {maskPhone(winner.phone)}
                      </span>
                    )}
                    <span className="bg-amber-400/20 text-amber-300 font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase">
                      {winner.registrationType || 'Público'}
                    </span>
                  </motion.div>
                </motion.div>
              ) : remainingCount === 0 ? (
                <motion.div
                  key="empty"
                  className="bg-black/80 backdrop-blur-md p-6 rounded-3xl border border-red-500/40 text-center max-w-sm space-y-3 shadow-2xl"
                >
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                  <p className="text-base text-red-200 font-mono font-bold uppercase tracking-wider">
                    Nenhum participante restante
                  </p>
                  <p className="text-xs text-slate-300 font-light">
                    Todos os nomes disponíveis já foram sorteados. Clique no botão de reset abaixo para reiniciar a urna.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  className="space-y-3"
                >
                  <h2 className={`font-black font-display tracking-tight bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] uppercase ${full ? 'text-5xl sm:text-7xl md:text-8xl' : 'text-4xl sm:text-6xl'}`}>
                    {tempName}
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-200/80 font-mono uppercase tracking-widest bg-black/50 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-amber-500/20">
                    {remainingCount} participantes prontos na urna
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* BOTTOM CONTROLS & STATS BAR */}
        <div className="w-full max-w-3xl flex flex-col items-center space-y-4">
          
          {/* Main Raffle Button */}
          <div className="w-full max-w-md">
            {!winner ? (
              <button
                onClick={handleStartRaffle}
                disabled={shuffling || remainingCount === 0}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] border border-amber-200 cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-3 uppercase tracking-wider"
              >
                <RefreshCw className={`w-5 h-5 text-slate-950 ${shuffling ? 'animate-spin' : ''}`} />
                <span>{shuffling ? 'SORTEANDO AGORA...' : remainingCount === 0 ? 'URNAS VAZIAS' : 'REALIZAR SORTEIO'}</span>
              </button>
            ) : (
              <button
                onClick={resetRaffle}
                className="w-full py-4 bg-black/80 hover:bg-black/90 text-amber-300 border border-amber-400/50 font-bold text-sm sm:text-base rounded-2xl cursor-pointer transition-all active:scale-98 flex items-center justify-center space-x-2 shadow-2xl backdrop-blur-md uppercase tracking-wide"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>REALIZAR PRÓXIMO SORTEIO</span>
              </button>
            )}
          </div>

          {/* Info pill about present eligibility */}
          <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-slate-300 bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Priorizando credenciados: <strong className="text-amber-300 font-bold">{remainingCount}</strong> elegíveis na urna de <strong className="text-white">{eligibleCount}</strong> presentes.
            </span>
          </div>

          {/* Sorteio History Accordion / Drawer */}
          <div className="w-full bg-black/75 border border-amber-500/20 rounded-2xl p-4 sm:p-5 text-left text-white backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest font-mono flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Histórico de Sorteados ({history.length})</span>
              </h4>
              
              {history.length > 0 && (
                <div>
                  {showResetConfirm ? (
                    <div className="flex items-center space-x-1.5 bg-red-500/20 border border-red-500/40 px-2 py-1 rounded-xl">
                      <span className="text-[10px] text-red-200 font-mono font-bold uppercase">Reiniciar?</span>
                      <button
                        onClick={handleClearHistory}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold font-mono rounded-md transition-all cursor-pointer uppercase"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold font-mono rounded-md transition-all cursor-pointer uppercase"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpar Histórico</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {history.length > 0 ? (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
                {history.map((h, idx) => (
                  <div key={h.id + '-' + idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between hover:bg-white/10 transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white truncate">{h.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {h.city || 'São Paulo - SP'} • {maskPhone(h.phone)}
                      </p>
                    </div>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md font-mono font-bold shrink-0">
                      #{history.length - idx}º Sorteado
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed border-white/10 rounded-xl bg-black/20">
                Nenhum participante sorteado até o momento.
              </p>
            )}
          </div>

          <span className="text-[10px] text-amber-200/60 font-mono uppercase tracking-widest pt-2 block">
            #MissãoEmCadaCanção
          </span>
        </div>

      </div>
    );
  };

  return (
    <>
      {/* Standard embedded wrapper view using background.png */}
      <div 
        className="relative text-white rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[580px] sm:min-h-[640px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Dark stage vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85 pointer-events-none" />

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsFullScreen(true)}
          className="absolute top-4 right-4 z-20 px-3.5 py-2 bg-black/80 hover:bg-black rounded-xl border border-amber-500/40 text-amber-300 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-bold backdrop-blur-md shadow-xl"
          title="Modo Tela Cheia"
        >
          <Maximize2 className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline font-mono">TELA CHEIA</span>
        </button>

        {renderRaffleInterface(false)}
      </div>

      {/* Full screen immersive overlay portal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 text-white flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImage})` }}
          >
            {/* Dark stage vignette overlay for full screen */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/90 pointer-events-none" />

            {/* Exit Full Screen Floating trigger */}
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 px-4 py-2.5 bg-black/85 border border-amber-500/40 text-amber-300 hover:text-white rounded-2xl flex items-center space-x-2 cursor-pointer text-xs font-bold font-mono transition-colors shadow-2xl z-30 backdrop-blur-md"
              title="Sair da Tela Cheia"
            >
              <Minimize2 className="w-4 h-4 text-amber-400" />
              <span>SAIR DA TELA CHEIA (ESC)</span>
            </button>

            {renderRaffleInterface(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

