/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, RefreshCw, Music, CheckCircle2, Volume2, Maximize2, Minimize2, AlertCircle, Trash2 } from 'lucide-react';
import { Participant } from '../types';

interface SorteioProps {
  participants: Participant[];
}

export default function Sorteio({ participants }: SorteioProps) {
  const [shuffling, setShuffling] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [tempName, setTempName] = useState('Clique para Sorteio');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; scale: number }>>([]);
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
    const colors = ['#123A6D', '#2C6CBF', '#D4AF37', '#94a3b8', '#10b981'];
    const newParticles = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 - 50, // relative to center
      y: Math.random() * -100 - 10, // shoot upwards
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: Math.random() * 1.2 + 0.4
    }));
    setParticles(newParticles);
  };

  const handleStartRaffle = () => {
    if (participants.length === 0) return;
    
    // Filter by present if any exist, to make it realistic!
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
    const maxIterations = 35;
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
    }, 90);
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
    return phone.slice(0, 9) + '****';
  };

  const renderRaffleInterface = (full: boolean) => {
    const presentList = participants.filter((p) => p.status === 'Presente');
    const basePool = presentList.length > 0 ? presentList : participants;
    const drawingPool = basePool.filter((p) => !drawnIds.includes(p.id));
    const eligibleCount = basePool.length;
    const remainingCount = drawingPool.length;

    return (
      <div className={`relative flex flex-col items-center justify-center text-center w-full max-w-2xl ${full ? 'py-10' : ''}`}>
        
        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: '50%', y: '80%', scale: 0, opacity: 1 }}
              animate={{ 
                x: `calc(50% + ${p.x}vw)`, 
                y: `calc(80% + ${p.y}vh)`, 
                scale: p.scale,
                opacity: [1, 1, 0.8, 0],
                rotate: Math.random() * 720
              }}
              transition={{ duration: 4, ease: 'easeOut' }}
              className="absolute w-3.5 h-3.5 rounded-sm"
              style={{ 
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px'
              }}
            />
          ))}
        </div>

        <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-app-gold/10 border border-app-gold/20 text-app-deep mb-6 font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-app-gold animate-pulse" />
          <span>Sorteador Eletrônico Oficial</span>
        </span>

        {/* Mixer board Card */}
        <div className={`w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl relative mb-8 backdrop-blur-md ${full ? 'max-w-2xl' : 'max-w-lg'}`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-app-medium via-app-gold to-app-medium" />
          
          {/* Top visualizer indicator bar */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-mono uppercase">STATUS: {shuffling ? 'EMBARALHANDO...' : winner ? 'SORTEADO!' : remainingCount === 0 ? 'ESGOTADO' : 'PRONTO'}</span>
            </div>
            
            <div className="flex space-x-1">
              <div className={`w-2.5 h-2.5 rounded-full ${shuffling ? 'bg-app-gold animate-ping' : winner ? 'bg-emerald-500' : remainingCount === 0 ? 'bg-red-500' : 'bg-slate-300'}`} />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            </div>
          </div>

          {/* Shuffling Screen display */}
          <div className={`bg-app-deep border border-app-medium/20 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden ${full ? 'min-h-[220px]' : 'min-h-[150px]'}`}>
            <div className="absolute inset-0 bg-radial from-app-gold/5 to-transparent pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {shuffling ? (
                <motion.div 
                  key="shuffling"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 w-full"
                >
                  <p className={`font-black font-display text-app-gold tracking-tight truncate ${full ? 'text-4xl' : 'text-2xl'}`}>
                    {tempName}
                  </p>
                  
                  {/* Pseudo signal frequencies */}
                  <div className="flex justify-center items-center space-x-1.5 h-10">
                    {[3, 9, 5, 10, 4, 8, 2, 9, 6, 8, 3].map((val, idx) => (
                      <div 
                        key={idx} 
                        className="w-1.5 bg-gradient-to-t from-app-medium to-app-gold rounded-full" 
                        style={{ 
                          height: `${val * 10}%`,
                          animationDuration: `${0.2 + idx * 0.08}s`
                        }} 
                      />
                    ))}
                  </div>
                </motion.div>
              ) : winner ? (
                <motion.div
                  key="winner"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4 text-center w-full"
                >
                  <div className="w-14 h-14 rounded-full bg-app-gold/10 border border-app-gold/30 text-app-gold flex items-center justify-center mx-auto shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className={`font-black text-white font-display tracking-tight leading-tight ${full ? 'text-4xl' : 'text-2xl'}`}>
                      {winner.name}
                    </h3>
                    {winner.city && (
                      <p className="text-slate-300 text-sm font-light mt-1">
                        {winner.city}
                      </p>
                    )}
                    <p className="text-xs text-app-gold font-mono tracking-widest mt-2 uppercase font-bold">
                      {maskPhone(winner.phone)} • {winner.registrationType || 'Público'}
                    </p>
                  </div>
                </motion.div>
              ) : remainingCount === 0 ? (
                <motion.div
                  key="empty"
                  className="text-center space-y-2"
                >
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-200 font-mono uppercase tracking-wider font-semibold">
                    Todos os Nomes Sorteados
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Não restam participantes elegíveis na urna. Clique no botão de reset abaixo para reiniciar.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  className="text-center"
                >
                  <Music className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-300 font-mono uppercase tracking-wider font-semibold">
                    {tempName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {remainingCount} nomes restantes na urna
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action trigger button */}
          <div className="mt-8">
            {!winner ? (
              <button
                onClick={handleStartRaffle}
                disabled={shuffling || remainingCount === 0}
                className="w-full py-4.5 bg-app-gold disabled:opacity-40 disabled:cursor-not-allowed text-app-deep font-black rounded-2xl shadow-md hover:shadow-app-gold/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-2.5 uppercase tracking-wide"
              >
                <RefreshCw className={`w-4 h-4 text-app-deep ${shuffling ? 'animate-spin' : ''}`} />
                <span>{shuffling ? 'SORTEANDO AGORA...' : remainingCount === 0 ? 'SEM NOMES RESTANTES' : 'REALIZAR SORTEIO'}</span>
              </button>
            ) : (
              <button
                onClick={resetRaffle}
                className="w-full py-4 bg-app-light hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-2xl cursor-pointer transition-all active:scale-98 flex items-center justify-center space-x-2"
              >
                <span>Realizar Novo Sorteio</span>
              </button>
            )}
          </div>

        </div>

        {/* Info label about subset eligibility */}
        <div className="w-full max-w-lg space-y-4">
          <div className="flex items-center space-x-3 text-slate-600 text-xs bg-app-light px-5 py-4 rounded-2xl border border-slate-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-left leading-relaxed font-light">
              O sorteador prioriza participantes marcados como <strong className="text-app-deep">"Presente"</strong> no credenciamento. (Elegíveis na urna: <strong className="text-app-deep">{remainingCount}</strong> de {eligibleCount}).
            </p>
          </div>

          {/* Sorteio History List Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left text-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-app-gold uppercase tracking-widest font-mono flex items-center space-x-2">
                <Award className="w-4 h-4 text-app-gold" />
                <span>Histórico de Sorteados ({history.length})</span>
              </h4>
              
              {history.length > 0 && (
                <div className="flex items-center space-x-2">
                  {showResetConfirm ? (
                    <div className="flex items-center space-x-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-xl">
                      <span className="text-[9px] text-red-300 font-mono font-bold uppercase tracking-wider">Reiniciar?</span>
                      <button
                        onClick={handleClearHistory}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold font-mono rounded-md transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold font-mono rounded-md transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-[9px] font-bold font-mono rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Resetar Sorteio</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {history.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {history.map((h, idx) => (
                  <div key={h.id + '-' + idx} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-white truncate">{h.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {h.city || 'São Paulo - SP'} • {maskPhone(h.phone)}
                      </p>
                    </div>
                    <span className="text-[9px] bg-app-gold/10 text-app-gold border border-app-gold/20 px-2 py-1 rounded-md font-mono font-bold shrink-0">
                      #{history.length - idx}º Sorteado
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                Nenhum participante sorteado até o momento.
              </p>
            )}
          </div>
        </div>

        {/* Strategic Hashtag */}
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-8 block">
          #CuidandoDePessoas
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Standard embedded wrapper view */}
      <div className="bg-app-deep text-white p-4 sm:p-8 rounded-3xl border border-app-medium/20 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[450px] sm:min-h-[500px]">
        
        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsFullScreen(true)}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
          title="Modo Tela Cheia"
        >
          <Maximize2 className="w-4 h-4 text-app-gold" />
          <span className="hidden sm:inline font-mono">TELA CHEIA</span>
        </button>

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-app-medium/10 blur-[100px] pointer-events-none" />

        {renderRaffleInterface(false)}
      </div>

      {/* Full screen immersive overlay portal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-app-deep text-white flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            {/* Geometric grids and huge glowing spheres */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-15 pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-app-medium/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-app-gold/10 blur-[130px] pointer-events-none" />

            {/* Exit Full Screen Floating trigger */}
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 px-4 py-2.5 bg-slate-900 border border-white/10 text-slate-300 hover:text-white rounded-xl flex items-center space-x-2 cursor-pointer text-xs font-bold font-mono transition-colors shadow-2xl z-20"
              title="Sair da Tela Cheia"
            >
              <Minimize2 className="w-4 h-4 text-app-gold" />
              <span>SAIR DA TELA CHEIA (ESC)</span>
            </button>

            {renderRaffleInterface(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
