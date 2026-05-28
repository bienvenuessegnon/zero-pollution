import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, AlertCircle, Zap } from 'lucide-react';

interface SplashLoaderProps {
  onComplete: () => void;
}

const loadingSteps = [
  "Initialisation de la base éco-citoyenne...",
  "Chargement des cartes d'arrondissements...",
  "Interconnexion avec les mairies du Bénin...",
  "Activation du cache hors-ligne à faible débit...",
  "Synchronisation GPS sécurisée active...",
  "Démarrage de Zéro Pollution Bénin !"
];

export default function SplashLoader({ onComplete }: SplashLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Dynamic progress bar increments
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        // Smooth random stepping
        const step = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + step, 100);
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  // Sync current status message with progress levels
  useEffect(() => {
    const calculatedStep = Math.min(
      Math.floor((progress / 100) * loadingSteps.length),
      loadingSteps.length - 1
    );
    setStepIndex(calculatedStep);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="initial_splash_loader">
      {/* Benin National Colors Decorative Accent Lines */}
      <div className="absolute top-0 inset-x-0 h-1.5 flex">
        <div className="w-1/3 h-full bg-emerald-600" />
        <div className="w-1/3 h-full bg-amber-500" />
        <div className="w-1/3 h-full bg-rose-600" />
      </div>

      {/* Decorative ambient background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 blur-3xl rounded-full" />

      {/* Main Core Content Card */}
      <div className="relative max-w-sm w-full text-center space-y-8">
        
        {/* Ecological Rotating & Pulsing Emblem */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* External animated double-ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30"
          />
          <motion.div 
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute -inset-2 rounded-full bg-emerald-500/5 blur-md"
          />
          
          {/* Main Logo Sphere */}
          <div className="relative w-16 h-16 rounded-full bg-radial from-emerald-800 to-emerald-950 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <ShieldCheck size={32} className="text-emerald-400 stroke-[2]" />
            <Sparkles size={16} className="absolute top-2 right-2 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-display bg-linear-to-r from-emerald-200 via-emerald-400 to-green-300 bg-clip-text text-transparent">
            Zéro Pollution
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-6 bg-emerald-800" />
            <p className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">
              RÉPUBLIQUE DU BÉNIN
            </p>
            <span className="h-[1px] w-6 bg-emerald-800" />
          </div>
        </div>

        {/* Loading Progress Section */}
        <div className="space-y-4 pt-4">
          
          {/* Custom styled progress percentage */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-mono text-emerald-500 font-bold tracking-wider flex items-center gap-1.5">
              <Zap size={12} className="fill-emerald-400" />
              PWA CHARGEMENT
            </span>
            <span className="font-mono text-white font-black text-sm">{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full p-0.5 overflow-hidden">
            <motion.div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 rounded-full shadow-lg relative"
            >
              {/* Shimmer light effect sliding across the bar */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% auto' }} />
            </motion.div>
          </div>

          {/* Explanatory system step label */}
          <div className="h-6 flex items-center justify-center">
            <motion.p 
              key={stepIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping" />
              {loadingSteps[stepIndex]}
            </motion.p>
          </div>

        </div>

      </div>

      {/* Humble Footer info */}
      <div className="absolute bottom-6 text-center space-y-1">
        <p className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider">
          Infrastructures locales & Assainissement vert
        </p>
        <p className="text-[9px] font-sans text-slate-600">
          Zéro Pollution Bénin v2.4.0 • Propulsé par la communauté citoyenne
        </p>
      </div>
    </div>
  );
}
