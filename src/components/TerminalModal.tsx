import React, { useState, useRef, useEffect } from 'react';
import { X, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonalInfo, Project, SkillItem } from '../types';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalInfo: PersonalInfo;
  projects: Project[];
  skills: SkillItem[];
  darkMode: boolean;
}

interface CommandHistory {
  command: string;
  output: string | React.ReactNode;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
  isOpen,
  onClose,
  personalInfo,
  projects,
  skills,
  darkMode,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: 'welcome',
      output: (
        <div className="space-y-1 text-amber-400">
          <p>Kirlous Wael Developer CLI [Version 2.4.0]</p>
          <p>Type <span className="text-amber-200 font-bold">'help'</span> to see available commands.</p>
        </div>
      )
    }
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    let outputNode: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        outputNode = (
          <div className="space-y-1 text-stone-300">
            <p className="text-amber-400 font-bold">Available Commands:</p>
            <p><span className="text-amber-400 font-mono font-semibold">about</span> - Read Kirlous Wael's professional bio</p>
            <p><span className="text-amber-400 font-mono font-semibold">skills</span> - List web, mobile & programming technical skills</p>
            <p><span className="text-amber-400 font-mono font-semibold">projects</span> - View portfolio projects & stack breakdown</p>
            <p><span className="text-amber-400 font-mono font-semibold">android</span> - View Kotlin & Jetpack Compose Android apps</p>
            <p><span className="text-amber-400 font-mono font-semibold">contact</span> - View email and developer profile links</p>
            <p><span className="text-amber-400 font-mono font-semibold">clear</span> - Clear terminal screen</p>
            <p><span className="text-amber-400 font-mono font-semibold">exit</span> - Close terminal CLI modal</p>
          </div>
        );
        break;

      case 'about':
        outputNode = (
          <div className="space-y-1 text-stone-300">
            <p className="text-amber-400 font-bold">{personalInfo.name} - {personalInfo.title}</p>
            <p>"{personalInfo.bio}"</p>
            <p className="text-xs text-stone-400">Location: {personalInfo.location}</p>
          </div>
        );
        break;

      case 'skills':
        outputNode = (
          <div className="space-y-2 text-stone-300">
            <p className="text-amber-400 font-bold">Core Skills:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {skills.map(s => (
                <div key={s.name} className="flex justify-between border-b border-stone-800 pb-1">
                  <span className="text-stone-300">{s.name} ({s.category})</span>
                  <span className="text-amber-400 font-bold">{s.level}%</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'projects':
        outputNode = (
          <div className="space-y-2 text-stone-300">
            <p className="text-amber-400 font-bold">Projects ({projects.length}):</p>
            {projects.map((p, i) => (
              <div key={p.id} className="text-xs space-y-0.5 border-l-2 border-amber-500 pl-2">
                <p className="text-white font-bold">{i + 1}. {p.title} <span className="text-amber-400">[{p.category}]</span></p>
                <p className="text-stone-400">{p.description}</p>
              </div>
            ))}
          </div>
        );
        break;

      case 'android':
        const androidProjs = projects.filter(p => p.category === 'Android');
        outputNode = (
          <div className="space-y-2 text-stone-300">
            <p className="text-amber-400 font-bold">Android Apps ({androidProjs.length}):</p>
            {androidProjs.map((p) => (
              <div key={p.id} className="text-xs">
                <p className="text-amber-300 font-bold">• {p.title}</p>
                <p className="text-stone-400">Stack: {p.techStack.join(', ')}</p>
              </div>
            ))}
          </div>
        );
        break;

      case 'contact':
        outputNode = (
          <div className="space-y-1 text-stone-300 text-xs">
            <p>Email: <span className="text-amber-400">{personalInfo.email}</span></p>
            <p>GitHub: <span className="text-amber-300">{personalInfo.github}</span></p>
            <p>LinkedIn: <span className="text-amber-300">{personalInfo.linkedin}</span></p>
          </div>
        );
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'exit':
        onClose();
        return;

      default:
        outputNode = (
          <p className="text-rose-400">
            Command not recognized: '{cmd}'. Type <span className="text-amber-300">'help'</span> for list of valid commands.
          </p>
        );
        break;
    }

    setHistory([...history, { command: input, output: outputNode }]);
    setInput('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-2xl w-full rounded-2xl border border-stone-800 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-[500px]"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-400">kirlous@portfolio-cli:~</span>
            </div>
            <button
              onClick={onClose}
              id="terminal-close-btn"
              className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Console Body */}
          <div 
            className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 text-stone-400">
                  <span className="text-amber-400">kirlous@dev:~$</span>
                  <span>{h.command}</span>
                </div>
                <div className="pl-4">{h.output}</div>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Input Prompt */}
          <form onSubmit={handleCommand} className="p-3 bg-stone-900 border-t border-stone-800 flex items-center gap-2">
            <span className="text-amber-400 font-bold">kirlous@dev:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type 'help' or 'projects'..."
              className="flex-1 bg-transparent border-none text-white focus:outline-none font-mono text-xs"
            />
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
