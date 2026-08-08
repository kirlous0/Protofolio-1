import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Github, 
  ExternalLink, 
  Smartphone, 
  Sparkles, 
  Eye, 
  Filter,
  PlusCircle,
  ShieldCheck,
  Zap,
  Camera,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, ProjectCategory } from '../types';
import { getFallbackScreenshot } from '../utils/screenshot';

interface ProjectsProps {
  projects: Project[];
  darkMode: boolean;
  onSelectProject: (project: Project) => void;
  onLaunchAndroidSim: (project: Project) => void;
  onOpenAdmin: () => void;
}

export const Projects: React.FC<ProjectsProps> = ({
  projects,
  darkMode,
  onSelectProject,
  onLaunchAndroidSim,
  onOpenAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: ProjectCategory[] = ['All', 'Web', 'Android', 'Full Stack'];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
              Dynamic Portfolio Showcase
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Featured Projects & Applications
            </h2>
            <p className={`text-sm leading-relaxed ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Explore web applications, full-stack platforms, and native Android mobile apps developed by Kirlous Wael. Managed dynamically via the Admin Dashboard.
            </p>
          </div>

          {/* Quick Admin Add Shortcut Banner */}
          <button
            onClick={onOpenAdmin}
            id="projects-admin-manage-btn"
            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              darkMode 
                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' 
                : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Owner Admin Dashboard
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Add, Edit or Delete Projects &rarr;
              </span>
            </div>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`project-filter-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? darkMode
                      ? 'bg-slate-100 text-slate-900 shadow-md'
                      : 'bg-slate-900 text-white shadow-md'
                    : darkMode
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat} {cat === 'All' ? `(${projects.length})` : `(${projects.filter(p => p.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-slate-500 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Projects Grid or Zero Projects Empty State */}
        {projects.length === 0 ? (
          <div className={`text-center py-20 px-6 rounded-3xl border font-mono space-y-5 ${
            darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 shadow-sm text-slate-700'
          }`}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <FolderKanban className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className={`text-xl font-bold font-sans ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                لا توجد مشاريع مضافة حالياً / No Projects Published Yet
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 font-sans">
                جميع المشاريع يتم إضافتها وإدارتها ديناميكياً بواسطة المسؤول من خلال لوحة التحكم (Admin Dashboard).
              </p>
            </div>
            <button
              onClick={onOpenAdmin}
              id="empty-projects-open-admin-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-md hover:bg-slate-800 transition-all cursor-pointer dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة مشروع جديد (لوحة التحكم Admin)</span>
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border font-mono ${
            darkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            <p className="text-sm">No projects matching query "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-3 text-xs text-blue-500 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -6 }}
                  className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between shadow-sm transition-all ${
                    darkMode
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-black/40'
                      : 'bg-white border-slate-200 shadow-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Project Image & Overlay */}
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className={`w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100 ${
                          project.fitMode === 'contain' ? 'object-contain p-2 bg-slate-950' : 'object-cover'
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackScreenshot(project.category, project.title, project.techStack);
                        }}
                      />
                      
                      {/* Top Category Badge */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shadow-md bg-slate-900/90 border border-slate-700 text-slate-200">
                          {project.category}
                        </span>
                        {project.liveUrl && (project.liveUrl.includes('vercel.app') || project.liveUrl.includes('vercel')) && (
                          <span className="bg-slate-900/95 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
                            <Zap className="w-3 h-3 text-amber-400" />
                            Vercel Live
                          </span>
                        )}
                        {project.featured && (
                          <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 shadow-md">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                            Featured
                          </span>
                        )}
                        {project.bestImages && project.bestImages.length > 0 && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {project.bestImages.length} Best Shots
                          </span>
                        )}
                        {project.images && project.images.length > 1 && (
                          <span className="bg-slate-900/95 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
                            <Camera className="w-3 h-3 text-amber-400" />
                            {project.images.length} Screenshots
                          </span>
                        )}
                      </div>

                      {/* Quick Action Overlay */}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button
                          onClick={() => onSelectProject(project)}
                          id={`proj-inspect-${project.id}`}
                          className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-slate-700" />
                          <span>Inspect</span>
                        </button>
                        {project.category === 'Android' && (
                          <button
                            onClick={() => onLaunchAndroidSim(project)}
                            id={`proj-android-sim-${project.id}`}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer border border-slate-700"
                          >
                            <Smartphone className="w-4 h-4 text-cyan-400" />
                            <span>Simulate</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-3">
                      <h3 className={`text-lg font-bold transition-colors line-clamp-1 ${
                        darkMode ? 'text-slate-100' : 'text-slate-900'
                      }`}>
                        {project.title}
                      </h3>
                      
                      <p className={`text-xs leading-relaxed line-clamp-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {project.description}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Links */}
                  <div className="p-6 pt-0 border-t border-slate-800/20 flex items-center justify-between mt-4">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="text-xs font-mono font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Case Study &rarr;</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                          }`}
                          title="View Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                            project.liveUrl.includes('vercel')
                              ? 'text-cyan-400 hover:text-cyan-300 font-bold'
                              : (darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950')
                          }`}
                          title={project.liveUrl.includes('vercel') ? 'Live Vercel Site' : 'Live Demo'}
                        >
                          {project.liveUrl.includes('vercel') ? <Zap className="w-4 h-4 text-amber-400" /> : <ExternalLink className="w-4 h-4" />}
                        </a>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </section>
  );
};
