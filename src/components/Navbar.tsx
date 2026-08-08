import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  User, 
  Wrench, 
  Briefcase, 
  FolderKanban, 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAdmin: () => void;
  onOpenTerminal: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  darkMode,
  onToggleDarkMode,
  onOpenAdmin,
  onOpenTerminal,
  unreadCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home', icon: Code2 },
    { id: 'about', label: 'About', icon: User },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? darkMode 
            ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-md shadow-black/40 py-3' 
            : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('hero')}
          id="nav-brand-btn"
          className="flex items-center gap-2.5 group cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-[2px] shadow-sm group-hover:scale-105 transition-transform">
            <div className={`w-full h-full rounded-[9px] flex items-center justify-center font-mono font-bold text-sm ${
              darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-900 text-slate-100'
            }`}>
              KW
            </div>
          </div>
          <div>
            <span className={`font-extrabold tracking-tight text-lg block leading-none ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Kirlous Wael
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Full Stack & Android
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border ${
          darkMode 
            ? 'bg-slate-900/90 border-slate-800' 
            : 'bg-slate-100/90 border-slate-200 shadow-inner'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? darkMode
                      ? 'text-slate-100 font-semibold'
                      : 'text-slate-950 font-semibold'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-full shadow-sm border ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-slate-200'
                    }`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* CLI Terminal Shortcut */}
          <button
            onClick={onOpenTerminal}
            id="nav-terminal-btn"
            title="Open Developer Terminal (CLI)"
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              darkMode 
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="hidden lg:inline text-[11px] font-semibold">CLI</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            id="nav-theme-btn"
            title="Toggle Dark / Light Theme"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              darkMode 
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Admin Dashboard Portal Trigger */}
          <button
            onClick={onOpenAdmin}
            id="nav-admin-btn"
            title="Owner Admin Dashboard"
            className={`relative px-3 py-2 rounded-xl border flex items-center gap-1.5 font-medium text-xs transition-all cursor-pointer shadow-sm ${
              darkMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline font-semibold">Dashboard</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="nav-mobile-toggle"
            className={`md:hidden p-2 rounded-xl border ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-b px-4 py-3 space-y-1 ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? darkMode ? 'bg-slate-900 text-emerald-400' : 'bg-slate-100 text-emerald-600'
                      : darkMode ? 'text-slate-400 hover:bg-slate-900/50' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
