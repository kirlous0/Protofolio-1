import React, { useState } from 'react';
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
  Zap,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  Image as ImageIcon
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
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!project) return null;

  const galleryImages = project.images && project.images.length > 0
    ? project.images
    : [project.imageUrl];

  const currentImage = galleryImages[activeImgIndex] || project.imageUrl;

  const handlePrev = () => {
    setActiveImgIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImgIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

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

          {/* Interactive Screenshot Gallery Carousel */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-amber-900/20 group bg-stone-950">
              <img 
                src={currentImage} 
                alt={`${project.title} screenshot ${activeImgIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300 cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFallbackScreenshot(project.category, project.title, project.techStack);
                }}
              />

              {/* Vercel Live Tag */}
              {project.liveUrl && (project.liveUrl.includes('vercel.app') || project.liveUrl.includes('vercel')) && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/95 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm z-10">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Vercel Production</span>
                </div>
              )}

              {/* Fullscreen Expand Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-white border border-stone-700/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                title="Expand Fullscreen Screenshot"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Carousel Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/80 hover:bg-amber-600 text-white border border-stone-700 backdrop-blur-sm transition-all cursor-pointer opacity-80 hover:opacity-100 z-10"
                    title="Previous screenshot"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/80 hover:bg-amber-600 text-white border border-stone-700 backdrop-blur-sm transition-all cursor-pointer opacity-80 hover:opacity-100 z-10"
                    title="Next screenshot"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter & Indicator */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-stone-900/90 text-stone-200 border border-stone-700 text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-sm z-10">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeImgIndex + 1} / {galleryImages.length} Screenshots</span>
                </div>
              )}

              {project.category === 'Android' && (
                <button
                  onClick={() => {
                    onClose();
                    onLaunchAndroidSim(project);
                  }}
                  className="absolute bottom-3 right-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer z-10"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Test Android Demo</span>
                </button>
              )}
            </div>

            {/* Thumbnail Strip Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 custom-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-20 aspect-video rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImgIndex === idx
                        ? 'border-amber-500 ring-2 ring-amber-500/40 scale-105'
                        : 'border-stone-700/60 opacity-60 hover:opacity-100 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackScreenshot(project.category, project.title, project.techStack);
                      }}
                    />
                  </button>
                ))}
              </div>
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

      {/* Lightbox Modal for Fullscreen HD Screenshot View */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm text-stone-100">{project.title} — Screenshot Gallery</h4>
                  <p className="text-xs font-mono text-stone-400">{activeImgIndex + 1} of {galleryImages.length}</p>
                </div>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Fullscreen Image Container */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <img
                src={currentImage}
                alt={`${project.title} Fullscreen Screenshot`}
                className="max-h-[82vh] max-w-full object-contain rounded-xl border border-stone-800 shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFallbackScreenshot(project.category, project.title, project.techStack);
                }}
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-900/80 hover:bg-amber-600 text-white border border-stone-700 transition-all cursor-pointer shadow-2xl"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-900/80 hover:bg-amber-600 text-white border border-stone-700 transition-all cursor-pointer shadow-2xl"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Footer Thumbnail Bar */}
            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-16 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImgIndex === idx
                        ? 'border-amber-400 scale-110 ring-2 ring-amber-400/50'
                        : 'border-stone-700 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
