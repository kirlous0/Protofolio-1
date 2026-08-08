import React, { useState } from 'react';
import { Terminal, Sparkles, ArrowUp, Zap, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveFloatingWidgetProps {
  darkMode: boolean;
  onOpenTerminal: () => void;
  bgAnimationEnabled: boolean;
  onToggleBgAnimation: () => void;
}

export const InteractiveFloatingWidget: React.FC<InteractiveFloatingWidgetProps> = ({
  darkMode,
  onOpenTerminal,
  bgAnimationEnabled,
  onToggleBgAnimation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('waelkirlous@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 font-mono">
      {/* Expanded Quick Controls */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`p-3 rounded-2xl border shadow-2xl space-y-2 w-56 backdrop-blur-md ${
              darkMode ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
          >
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Interactive Controls</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Launch CLI Terminal */}
            <button
              onClick={() => {
                onOpenTerminal();
                setIsOpen(false);
              }}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                darkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Developer CLI</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] rounded bg-slate-950 text-slate-400 border border-slate-800">CLI</kbd>
            </button>

            {/* Ambient Background Toggle */}
            <button
              onClick={onToggleBgAnimation}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                darkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${bgAnimationEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>Canvas FX</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                bgAnimationEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {bgAnimationEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Quick Email Copy */}
            <button
              onClick={handleCopyEmail}
              className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                darkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copiedEmail ? 'Copied Email!' : 'Copy Email'}</span>
              </div>
            </button>

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className={`w-full p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Scroll to Top</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Toggle Floating FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-300 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer relative group"
        title="Quick Interactive Toolbar"
      >
        <Zap className="w-5 h-5 text-blue-500 dark:text-blue-600 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 dark:border-slate-100 animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 dark:border-slate-100" />
      </button>
    </div>
  );
};
