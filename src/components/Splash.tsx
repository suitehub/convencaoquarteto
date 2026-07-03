/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Music } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Small pause at 100%
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-deep text-white overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-app-medium/10 blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-app-gold/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated music visualizer bar emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative mb-6 flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-app-medium via-app-gold to-app-medium shadow-2xl shadow-app-medium/20"
        >
          {/* Decorative rotating disc behind logo */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-1 rounded-full border border-white/10 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full border border-dashed border-white/20" />
          </motion.div>

          <Music className="w-12 h-12 text-white relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
        </motion.div>

        {/* Title and subtitle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="text-xs font-mono tracking-[0.3em] text-app-gold uppercase font-bold">
            Convenção Municipal
          </span>
          <h1 className="mt-1 text-3xl font-extrabold font-display tracking-tight text-white sm:text-4xl bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            9ª Convenção <br />
            <span className="text-app-gold font-black">de Quartetos</span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 font-light max-w-xs">
            Harmonia Vocal, Conexão e Adoração em uma experiência musical única.
          </p>
        </motion.div>

        {/* Loading Progress Bar */}
        <div className="mt-10 w-64">
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-app-medium to-app-gold rounded-full"
              style={{ width: `${progress}%` }}
              layoutId="progress-bar"
            />
          </div>
          <div className="mt-3 flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>CARREGANDO PROTÓTIPO...</span>
            <span className="font-semibold text-app-gold">{progress}%</span>
          </div>
        </div>

        {/* Quick Skip button */}
        <motion.button
          onClick={onComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          className="mt-12 px-4 py-2 border border-app-medium/30 bg-app-medium/10 rounded-full text-xs text-slate-400 tracking-wider font-mono cursor-pointer transition-colors"
        >
          Pular Introdução
        </motion.button>
      </div>
      
      {/* Footer watermark */}
      <div className="absolute bottom-6 text-[10px] font-mono text-slate-600 tracking-widest uppercase">
        #CuidandoDePessoas • 9ª CONVENÇÃO
      </div>
    </div>
  );
}
