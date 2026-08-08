import React from 'react';
import { 
  ArrowRight, 
  Download, 
  Github, 
  Linkedin, 
  Mail, 
  Smartphone, 
  Globe, 
  Code, 
  Sparkles,
  CheckCircle2,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { PersonalInfo } from '../types';

interface HeroProps {
  personalInfo: PersonalInfo;
  onNavigate: (sectionId: string) => void;
  onOpenTerminal: () => void;
  darkMode: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  personalInfo,
  onNavigate,
  onOpenTerminal,
  darkMode,
}) => {
  return (
    <section 
      id="hero" 
      className="relative min-h-[92vh] pt-32 pb-20 flex items-center justify-center overflow-hidden"
    >
      {/* Ambient subtle background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-slate-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Introductions & CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6 text-left"
        >
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium transition-transform hover:scale-105 ${
            darkMode 
              ? 'bg-slate-900/90 border-slate-700 text-slate-300' 
              : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Available for Freelance & Full-time Roles
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h2 className={`text-base sm:text-lg font-mono font-semibold tracking-wide ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Hi, I'm {personalInfo.name}
            </h2>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Full Stack Web Developer & <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Android Developer</span>
            </h1>
          </div>

          {/* Short Professional Description */}
          <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {personalInfo.tagline} Focused on clean architecture, responsive React & Next.js applications, and native-feeling Android solutions with Kotlin & Jetpack Compose.
          </p>

          {/* Key Value Badges */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono pt-1">
            <div className={`flex items-center gap-1.5 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Modern Clean Code</span>
            </div>
            <div className={`flex items-center gap-1.5 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Native & Web Apps</span>
            </div>
            <div className={`flex items-center gap-1.5 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Built-in Admin CMS</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {/* View Projects CTA */}
            <button
              id="hero-view-projects-btn"
              onClick={() => onNavigate('projects')}
              className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                darkMode
                  ? 'bg-slate-100 text-slate-900 hover:bg-white shadow-slate-900'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300'
              }`}
            >
              <span>View Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Contact Me CTA */}
            <button
              id="hero-contact-btn"
              onClick={() => onNavigate('contact')}
              className={`px-6 py-3.5 rounded-xl font-semibold text-sm border transition-all flex items-center gap-2 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
              }`}
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Contact Me</span>
            </button>

            {/* Terminal Trigger */}
            <button
              id="hero-terminal-btn"
              onClick={onOpenTerminal}
              className={`p-3.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title="Launch Developer CLI"
            >
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Launch CLI</span>
            </button>
          </div>

          {/* Social Links & Quick Contact */}
          <div className="flex items-center gap-5 pt-4">
            <span className={`text-xs font-mono uppercase tracking-wider ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Connect:
            </span>
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${personalInfo.email}`}
              className={`p-2 rounded-lg border transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
              title="Direct Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

        </motion.div>

        {/* Right Column: Modern Tech Showcase Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          {/* Card Container */}
          <div className={`relative rounded-2xl border p-6 shadow-2xl backdrop-blur-xl ${
            darkMode 
              ? 'bg-slate-900/80 border-slate-800/90 shadow-emerald-950/20' 
              : 'bg-white/90 border-slate-200 shadow-slate-200'
          }`}>
            
            {/* Top Bar of Code Window */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/20 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                DeveloperProfile.kt
              </span>
            </div>

            {/* Code Snippet Display */}
            <div className={`p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto ${
              darkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-900 text-slate-200'
            }`}>
              <p className="text-purple-400">class <span className="text-amber-300">KirlousWael</span> : <span className="text-cyan-300 font-semibold">FullStackDeveloper</span> {"{"}</p>
              <p className="pl-4 text-slate-400">// Core Stack Capabilities</p>
              <p className="pl-4">
                <span className="text-indigo-400">val</span> webTech = <span className="text-emerald-400">listOf</span>(<span className="text-amber-200">"React"</span>, <span className="text-amber-200">"Next.js"</span>, <span className="text-amber-200">"Tailwind"</span>)
              </p>
              <p className="pl-4">
                <span className="text-indigo-400">val</span> mobileTech = <span className="text-emerald-400">listOf</span>(<span className="text-amber-200">"Kotlin"</span>, <span className="text-amber-200">"Jetpack Compose"</span>, <span className="text-amber-200">"Room"</span>)
              </p>
              <p className="pl-4 mt-2">
                <span className="text-purple-400">fun</span> <span className="text-cyan-300">getMissionStatement</span>(): <span className="text-amber-300">String</span> {"{"}
              </p>
              <p className="pl-8 text-emerald-300">
                return <span className="text-emerald-200">"Deliver fast, responsive & high-converting software."</span>
              </p>
              <p className="pl-4">{"}"}</p>
              <p>{"}"}</p>
            </div>

            {/* Interactive Quick Badges */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Web Apps</h4>
                  <p className="text-[11px] text-slate-500">React & Next.js</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Android Apps</h4>
                  <p className="text-[11px] text-slate-500">Kotlin & Compose</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="mt-4 pt-4 border-t border-slate-800/20 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Completed Projects: <strong className="text-emerald-400">{personalInfo.completedProjects}+</strong></span>
              <span className="text-slate-500">Experience: <strong className="text-cyan-400">{personalInfo.yearsExperience}+ Yrs</strong></span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
