import React, { useState } from 'react';
import { 
  X, 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  ChevronLeft, 
  Home, 
  RotateCcw,
  Sparkles,
  Plus,
  Check,
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';

interface AndroidSimulatorModalProps {
  project: Project | null;
  onClose: () => void;
  darkMode: boolean;
}

export const AndroidSimulatorModal: React.FC<AndroidSimulatorModalProps> = ({
  project,
  onClose,
  darkMode,
}) => {
  if (!project) return null;

  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'settings'>('home');
  const [items, setItems] = useState([
    { id: 1, title: 'Grocery Shopping', amount: '-$42.50', category: 'Food & Supplies', date: 'Today, 2:15 PM' },
    { id: 2, title: 'Client Freelance Payout', amount: '+$850.00', category: 'Income', date: 'Yesterday' },
    { id: 3, title: 'Server Hosting (Cloud Run)', amount: '-$14.99', category: 'Infrastructure', date: 'Jul 28' },
    { id: 4, title: 'Coffee & Snack', amount: '-$5.25', category: 'Food', date: 'Jul 27' },
  ]);

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemAmount) return;
    const newItem = {
      id: Date.now(),
      title: newItemTitle,
      amount: newItemAmount.startsWith('+') || newItemAmount.startsWith('-') ? newItemAmount : `-$${newItemAmount}`,
      category: 'Manual Entry',
      date: 'Just now'
    };
    setItems([newItem, ...items]);
    setNewItemTitle('');
    setNewItemAmount('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-sm w-full"
        >
          {/* Top Close Button outside frame */}
          <button
            onClick={onClose}
            id="android-sim-close"
            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-slate-800/80 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Android Phone Physical Outer Frame */}
          <div className="relative mx-auto w-[330px] h-[670px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-600/50 flex flex-col justify-between overflow-hidden">
            
            {/* Phone Speaker Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Screen Canvas */}
            <div className="w-full h-full bg-slate-950 rounded-[38px] overflow-hidden flex flex-col relative pt-7 pb-4 px-3 text-white font-sans text-xs">
              
              {/* Android Status Bar */}
              <div className="flex items-center justify-between px-3 py-1 text-[10px] text-slate-400 font-mono z-10 border-b border-slate-900">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* App Bar Header */}
              <div className="py-2.5 px-2 flex items-center justify-between border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                    KW
                  </div>
                  <div>
                    <h3 className="font-bold text-xs truncate max-w-[160px] text-amber-400">
                      {project.title.split('-')[0]}
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono">
                      {project.androidPackageName || 'com.kirlous.android'}
                    </p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono">
                  Kotlin Compose
                </span>
              </div>

              {/* Dynamic App Content Body */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 px-1 custom-scrollbar">
                
                {activeTab === 'home' && (
                  <div className="space-y-3">
                    {/* Hero Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 text-white space-y-2 shadow-lg shadow-amber-500/20">
                      <div className="flex justify-between items-center text-[10px] opacity-80 font-mono">
                        <span>Jetpack Compose UI</span>
                        <Sparkles className="w-3 h-3 text-amber-200" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase opacity-75 font-mono">Total Balance</span>
                        <p className="text-xl font-extrabold tracking-tight">$4,285.50</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/20 font-mono">
                        <span>Monthly Target: 92%</span>
                        <span className="text-amber-100">+12% vs last mo</span>
                      </div>
                    </div>

                    {/* Quick Add Form */}
                    <form onSubmit={handleAddItem} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400">Quick Add Entry (Room DB Test)</div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Title..."
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="-$10"
                          value={newItemAmount}
                          onChange={(e) => setNewItemAmount(e.target.value)}
                          className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          className="p-1 rounded bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                    {/* Recent Items List */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                        <span>Live SQLite Records ({items.length})</span>
                        <span className="text-amber-400">Room Cached</span>
                      </div>
                      {items.map((it) => (
                        <div key={it.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[11px] text-slate-200">{it.title}</p>
                            <p className="text-[9px] text-slate-500">{it.category} • {it.date}</p>
                          </div>
                          <span className={`font-mono text-[11px] font-bold ${
                            it.amount.startsWith('+') ? 'text-amber-400' : 'text-slate-300'
                          }`}>
                            {it.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-3 text-center py-4">
                    <TrendingUp className="w-8 h-8 text-amber-400 mx-auto" />
                    <h4 className="font-bold text-sm">Compose Material 3 Charts</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed px-2">
                      Demonstrates reactive Android Coroutines Flow streaming data straight from local Room database tables.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-left">
                      <div className="flex justify-between text-[10px]">
                        <span>Food & Dining</span>
                        <span className="font-bold text-amber-400">45%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-400 w-[45%]" />
                      </div>

                      <div className="flex justify-between text-[10px] pt-1">
                        <span>Subscriptions & Hosting</span>
                        <span className="font-bold text-amber-600">30%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-600 w-[30%]" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-3 py-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-xs text-amber-400">Android Build Spec</h4>
                      <ul className="text-[10px] space-y-1 text-slate-300 font-mono">
                        <li>• SDK Min: API 26 (Android 8.0)</li>
                        <li>• Target: API 34 (Android 14)</li>
                        <li>• UI: Declarative Jetpack Compose</li>
                        <li>• Architecture: MVVM + Repository</li>
                      </ul>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Android Navigation Bar */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-around text-[10px] font-mono text-slate-400">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-amber-400 font-bold' : ''}`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Main</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex flex-col items-center gap-0.5 ${activeTab === 'analytics' ? 'text-amber-400 font-bold' : ''}`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Stats</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex flex-col items-center gap-0.5 ${activeTab === 'settings' ? 'text-amber-400 font-bold' : ''}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Spec</span>
                </button>
              </div>

              {/* Android Gesture Home Bar */}
              <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2 opacity-60" />

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
