import React from 'react';
import { 
  UserCheck, 
  Award, 
  Code2, 
  Target, 
  CheckCircle, 
  Lightbulb, 
  Rocket, 
  HeartHandshake,
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { PersonalInfo } from '../types';

interface AboutProps {
  personalInfo: PersonalInfo;
  darkMode: boolean;
  onNavigate: (sectionId: string) => void;
}

export const About: React.FC<AboutProps> = ({
  personalInfo,
  darkMode,
  onNavigate,
}) => {
  const stats = [
    { label: 'Years Experience', value: `${personalInfo.yearsExperience}+`, subtext: 'Web & Android Engineering', icon: Award, color: 'text-slate-400' },
    { label: 'Completed Projects', value: `${personalInfo.completedProjects}+`, subtext: 'Web Apps & Mobile Solutions', icon: Code2, color: 'text-slate-400' },
    { label: 'Happy Clients', value: `${personalInfo.happyClients}+`, subtext: 'Worldwide Satisfaction', icon: HeartHandshake, color: 'text-slate-400' },
    { label: 'Clean Code Standard', value: '100%', subtext: 'Maintainable & Documented', icon: Layers, color: 'text-slate-400' },
  ];

  const philosophies = [
    {
      title: 'Performance & Speed First',
      description: 'Every millisecond counts. Applications are optimized for instant loading, sub-second responses, and minimal RAM footprint.',
      icon: Rocket,
    },
    {
      title: 'Clean Architecture',
      description: 'Separation of concerns using MVVM, modular React hooks, and strict TypeScript types ensuring long-term maintainability.',
      icon: Lightbulb,
    },
    {
      title: 'User-Centric Design',
      description: 'Delivering intuitive, accessible interfaces with smooth animations that enhance user engagement and drive conversion.',
      icon: UserCheck,
    },
  ];

  return (
    <section 
      id="about" 
      className={`py-24 relative transition-colors ${
        darkMode ? 'bg-slate-950/80' : 'bg-slate-50/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border ${
            darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            About The Developer
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>
            Driven by Passion, Focused on Excellence
          </h2>
          <p className={`text-base leading-relaxed ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Building the next generation of web and mobile software with pixel-perfect accuracy and robust backend logic.
          </p>
        </div>

        {/* Biography & Vision Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Bio Box */}
          <div className={`lg:col-span-7 rounded-2xl border p-8 flex flex-col justify-between shadow-sm ${
            darkMode 
              ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
              : 'bg-white border-slate-200 text-slate-700 shadow-slate-100'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800/20">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 p-[2px]">
                  <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-lg ${
                    darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-900 text-slate-100'
                  }`}>
                    KW
                  </div>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {personalInfo.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                    {personalInfo.title}
                  </p>
                </div>
              </div>

              {/* Mandatory User Biography */}
              <blockquote className={`text-base sm:text-lg leading-relaxed font-normal italic p-4 rounded-xl border-l-4 border-blue-500 ${
                darkMode ? 'bg-slate-950/60 text-slate-200' : 'bg-slate-50 text-slate-800'
              }`}>
                "{personalInfo.bio}"
              </blockquote>

              {/* Developer Vision & Goals */}
              <div className="space-y-3 pt-2">
                <h4 className={`text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-800'
                }`}>
                  <Target className="w-4 h-4 text-blue-500" />
                  Professional Goals & Mission
                </h4>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  My goal is to provide businesses and startups with reliable digital products that scale seamlessly. Whether engineering a high-converting web landing page or developing an offline-first Android application, I prioritize clean architecture, maintainability, and end-user delight.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/20 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-500">Based in Cairo, Egypt (Available Globally)</span>
              <button
                onClick={() => onNavigate('contact')}
                id="about-hire-me-btn"
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
              >
                Let's discuss your next project &rarr;
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                    darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-6 h-6 text-slate-400" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Stat</span>
                  </div>
                  <div className="mt-4">
                    <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight block ${
                      darkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {stat.value}
                    </span>
                    <h4 className={`text-xs font-bold mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {stat.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {stat.subtext}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Development Philosophy Cards */}
        <div className="space-y-6 pt-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Development Philosophy
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">Core principles guiding every line of code written</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {philosophies.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-6 space-y-3 shadow-sm transition-all hover:border-slate-400 ${
                    darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5 text-slate-300" />
                  </div>
                  <h4 className={`text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
