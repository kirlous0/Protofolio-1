import React from 'react';
import { 
  ArrowUp, 
  Code2, 
  Github, 
  Linkedin, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  Heart
} from 'lucide-react';
import { PersonalInfo } from '../types';

interface FooterProps {
  personalInfo: PersonalInfo;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  darkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  personalInfo,
  onNavigate,
  onOpenAdmin,
  darkMode,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`border-t transition-colors ${
      darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Top Row: Brand & Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 p-[2px] border border-slate-700">
                <div className={`w-full h-full rounded-[6px] flex items-center justify-center font-mono font-bold text-xs ${
                  darkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-900'
                }`}>
                  KW
                </div>
              </div>
              <span className={`font-bold tracking-tight text-lg ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Kirlous Wael
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-slate-500">
              Full Stack Web Developer & Android Developer creating high-performance web applications and native mobile software solutions.
            </p>
          </div>

          {/* Nav Column */}
          <div className="md:col-span-4 space-y-2">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
              darkMode ? 'text-slate-300' : 'text-slate-800'
            }`}>
              Quick Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button onClick={() => onNavigate('hero')} className="hover:text-blue-500 text-left cursor-pointer transition-colors">Home</button>
              <button onClick={() => onNavigate('about')} className="hover:text-blue-500 text-left cursor-pointer transition-colors">About Me</button>
              <button onClick={() => onNavigate('skills')} className="hover:text-blue-500 text-left cursor-pointer transition-colors">Skills</button>
              <button onClick={() => onNavigate('services')} className="hover:text-blue-500 text-left cursor-pointer transition-colors">Services</button>
              <button onClick={() => onNavigate('projects')} className="hover:text-blue-500 text-left cursor-pointer transition-colors">Projects</button>
              <button onClick={() => onNavigate('contact')} className="hover:text-blue-500 text-left cursor-pointer transition-colors">Contact</button>
            </div>
          </div>

          {/* Social & Admin Portal */}
          <div className="md:col-span-3 space-y-3">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
              darkMode ? 'text-slate-300' : 'text-slate-800'
            }`}>
              Admin & Connect
            </h4>
            <div className="flex items-center gap-3">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg border transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
                }`}
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg border transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
                }`}
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${personalInfo.email}`}
                className={`p-2 rounded-lg border transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
                }`}
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={onOpenAdmin}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1.5 cursor-pointer pt-1"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Owner Admin Portal &rarr;</span>
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© {new Date().getFullYear()} Kirlous Wael. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <span>Built with React & Tailwind</span>
            <button
              onClick={scrollToTop}
              id="footer-back-to-top"
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
