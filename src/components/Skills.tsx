import React, { useState } from 'react';
import { 
  Code2, 
  Palette, 
  FileCode, 
  Atom, 
  Globe, 
  Sparkles, 
  Smartphone, 
  Layout, 
  Flame, 
  Database, 
  Terminal, 
  GitBranch, 
  Github,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SkillItem } from '../types';

interface SkillsProps {
  skills: SkillItem[];
  darkMode: boolean;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Code2,
  Palette,
  FileCode,
  Atom,
  Globe,
  Sparkles,
  Smartphone,
  Layout,
  Flame,
  Database,
  Terminal,
  GitBranch,
  Github,
};

export const Skills: React.FC<SkillsProps> = ({ skills, darkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Web Development', 'Mobile Development', 'Programming & Tools'];

  const filteredSkills = selectedCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === selectedCategory);

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border ${
            darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            Technical Proficiency
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>
            Core Tech Stack & Skills
          </h2>
          <p className={`text-base leading-relaxed ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Comprehensive expertise in modern frontend frameworks, mobile SDKs, and full-stack software development tools.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`skills-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? darkMode 
                    ? 'bg-slate-100 text-slate-900 shadow-md shadow-slate-900'
                    : 'bg-slate-900 text-white shadow-md'
                  : darkMode
                    ? 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => {
              const Icon = iconMap[skill.iconName] || Code2;
              return (
                <motion.div
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                    darkMode
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 shadow-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header icon & category badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700/60">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                        darkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {skill.category}
                      </span>
                    </div>

                    {/* Skill Title & description */}
                    <div>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${
                        darkMode ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        {skill.name}
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </h3>
                      {skill.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Proficiency Bar */}
                  <div className="mt-6 space-y-1.5 pt-4 border-t border-slate-800/20">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Proficiency</span>
                      <span className="text-slate-400 font-bold">{skill.level}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="h-full rounded-full bg-slate-700 dark:bg-slate-300"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
};
