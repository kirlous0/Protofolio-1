import React from 'react';
import { 
  X, 
  Github, 
  ExternalLink, 
  Smartphone, 
  Globe, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Code,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { getFallbackScreenshot } from '../utils/screenshot';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onLaunchAndroidSim: (project: Project) => void;
  darkMode: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onLaunchAndroidSim,
  darkMode,
}) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative max-w-2xl w-full rounded-2xl border p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar ${
            darkMode ? 'bg-stone-900 border-amber-900/30 text-stone-200' : 'bg-white border-amber-200 text-stone-800'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between pb-4 border-b border-amber-900/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  project.category === 'Android' 
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30' 
                    : project.category === 'Web'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-amber-600/20 text-amber-800 dark:text-amber-300 border border-amber-600/30'
                }`}>
                  {project.category}
                </span>
                {project.featured && (
                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Featured
                  </span>
                )}
              </div>
              <h3 className={`text-2xl font-extrabold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                {project.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              id="project-detail-close-btn"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode ? 'bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-300' : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Image */}
          <div className="relative rounded-xl overflow-hidden aspect-video border border-amber-900/10 group">
            <img 
              src={project.imageUrl} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackScreenshot(project.category, project.title, project.techStack);
              }}
            />
            {project.liveUrl && (project.liveUrl.includes('vercel.app') || project.liveUrl.includes('vercel')) && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/95 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Vercel Production</span>
              </div>
            )}
            {project.category === 'Android' && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchAndroidSim(project);
                }}
                className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test Live Android Demo</span>
              </button>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
              darkMode ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Project Overview & Architecture
            </h4>
            <p className="text-sm leading-relaxed text-stone-400 dark:text-stone-300">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* Feature Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="space-y-3">
              <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                darkMode ? 'text-stone-400' : 'text-stone-600'
              }`}>
                Key Technical Highlights
              </h4>
              <ul className="space-y-2 text-xs">
                {project.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className={darkMode ? 'text-stone-300' : 'text-stone-700'}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack Badges */}
          <div className="space-y-2">
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
              darkMode ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-stone-300' : 'bg-stone-100 border-amber-200 text-stone-800'
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-amber-900/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all bg-stone-800 border-stone-700 text-white hover:bg-stone-700"
                >
                  <Github className="w-4 h-4" />
                  <span>View Code</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md ${
                    project.liveUrl.includes('vercel')
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 shadow-cyan-500/20'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/20'
                  }`}
                >
                  {project.liveUrl.includes('vercel') ? <Zap className="w-4 h-4 text-amber-400" /> : <ExternalLink className="w-4 h-4" />}
                  <span>{project.liveUrl.includes('vercel') ? '⚡ View Live Vercel Site' : 'Live Demo / App Release'}</span>
                </a>
              )}
            </div>

            <span className="text-[11px] font-mono text-stone-500">
              Added: {project.createdAt}
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
