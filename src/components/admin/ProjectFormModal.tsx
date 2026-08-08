import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Sparkles, Smartphone, Globe, Code, Wand2, RefreshCw, CheckCircle2, AlertCircle, Search, Layers, FileText, Camera, Image, ExternalLink, Star, Crop, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIEnhancementResponse, Project, SEOMetadata } from '../../types';
import { enhanceProjectWithAI } from '../../services/aiEnhancerService';
import { getWebsiteScreenshotUrl, getFallbackScreenshot, getProjectScreenshots } from '../../utils/screenshot';
import { ResponsiveImage } from '../ResponsiveImage';

interface ProjectFormModalProps {
  isOpen: boolean;
  projectToEdit: Project | null;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt'>, editId?: string) => void;
  darkMode: boolean;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  projectToEdit,
  onClose,
  onSave,
  darkMode,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [category, setCategory] = useState<'Web' | 'Android' | 'Full Stack'>('Web');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [bestImages, setBestImages] = useState<string[]>([]);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [newCustomImageUrl, setNewCustomImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [androidPackageName, setAndroidPackageName] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');

  // SEO State
  const [showSeoSection, setShowSeoSection] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogType, setOgType] = useState('website');
  const [keywordsInput, setKeywordsInput] = useState('');

  // AI Assistant State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<AIEnhancementResponse | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const presetImages = [
    { name: 'Android Mobile App', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' },
    { name: 'Full Stack Dashboard', url: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=800&q=80' },
    { name: 'Fitness Android App', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80' },
    { name: 'SaaS Landing Page', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Code IDE / Developer Tool', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
  ];

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setLongDescription(projectToEdit.longDescription || '');
      setCategory(projectToEdit.category);
      setTechStackInput(projectToEdit.techStack.join(', '));
      setGithubUrl(projectToEdit.githubUrl);
      setLiveUrl(projectToEdit.liveUrl || '');
      setImageUrl(projectToEdit.imageUrl);
      const loadedImages = projectToEdit.images && projectToEdit.images.length > 0 ? projectToEdit.images : (projectToEdit.imageUrl ? [projectToEdit.imageUrl] : []);
      setImages(loadedImages);
      setBestImages(projectToEdit.bestImages && projectToEdit.bestImages.length > 0 ? projectToEdit.bestImages : (loadedImages.length > 0 ? [loadedImages[0]] : []));
      setFitMode(projectToEdit.fitMode || 'contain');
      setFeatured(projectToEdit.featured);
      setAndroidPackageName(projectToEdit.androidPackageName || '');
      setHighlightsInput((projectToEdit.highlights || []).join('\n'));

      if (projectToEdit.seoMetadata) {
        setMetaTitle(projectToEdit.seoMetadata.metaTitle || '');
        setMetaDescription(projectToEdit.seoMetadata.metaDescription || '');
        setOgTitle(projectToEdit.seoMetadata.ogTitle || '');
        setOgDescription(projectToEdit.seoMetadata.ogDescription || '');
        setOgType(projectToEdit.seoMetadata.ogType || 'website');
        setKeywordsInput((projectToEdit.seoMetadata.keywords || []).join(', '));
      } else {
        resetSeoFields();
      }
    } else {
      setTitle('');
      setDescription('');
      setLongDescription('');
      setCategory('Web');
      setTechStackInput('React, TypeScript, Tailwind CSS');
      setGithubUrl('https://github.com/kirlouswael/my-new-project');
      setLiveUrl('https://demo.vercel.app');
      setImageUrl(presetImages[0].url);
      setImages([presetImages[0].url]);
      setBestImages([presetImages[0].url]);
      setFitMode('contain');
      setFeatured(false);
      setAndroidPackageName('com.kirlous.myapp');
      setHighlightsInput('Responsive clean architecture\nHigh performance scores');
      resetSeoFields();
    }
    setAiSuggestion(null);
    setAiError('');
  }, [projectToEdit, isOpen]);

  const resetSeoFields = () => {
    setMetaTitle('');
    setMetaDescription('');
    setOgTitle('');
    setOgDescription('');
    setOgType('website');
    setKeywordsInput('');
  };

  const handleTriggerAIAssistant = async () => {
    setAiLoading(true);
    setAiError('');
    setAiSuccessMsg('');

    let readmeSnippet = '';
    // If githubUrl exists, attempt to fetch README first for comprehensive analysis
    if (githubUrl) {
      try {
        const ghRes = await fetch('/api/integrations/github/readme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUrl }),
        });
        const contentType = ghRes.headers.get('content-type') || '';
        if (ghRes.ok && contentType.includes('application/json')) {
          const ghData = await ghRes.json();
          if (ghData.success && ghData.content) {
            readmeSnippet = ghData.content;
          }
        }
      } catch (e) {
        console.log('GitHub README fetch optional failed, proceeding with current inputs.');
      }
    }

    try {
      const enhancement = await enhanceProjectWithAI({
        title,
        description,
        techStack: techStackInput,
        category,
        githubUrl,
        liveUrl,
        readmeContent: readmeSnippet || longDescription,
      });

      setAiSuggestion(enhancement);
      setShowAiModal(true);

      // Auto assign image URL if default or empty
      if (enhancement.screenshotUrl && (!imageUrl || imageUrl.includes('unsplash.com/photo-1555066931-4365d14bab8c'))) {
        setImageUrl(enhancement.screenshotUrl);
      }
    } catch (err: any) {
      setAiError(err.message || 'AI generation failed. Please check inputs.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAutoGenerateScreenshot = () => {
    let cleanLiveUrl = liveUrl.trim();
    if (cleanLiveUrl && !cleanLiveUrl.startsWith('http://') && !cleanLiveUrl.startsWith('https://')) {
      cleanLiveUrl = `https://${cleanLiveUrl}`;
      setLiveUrl(cleanLiveUrl);
    }

    const generatedScreenshots = getProjectScreenshots({
      liveUrl: cleanLiveUrl,
      githubUrl,
      category,
      title,
      techStack: techStackInput.split(',').map(s => s.trim()).filter(Boolean),
      imageUrl,
      existingImages: images,
    });

    setImages(generatedScreenshots);
    if (bestImages.length === 0) {
      setBestImages(generatedScreenshots);
    }
    if (generatedScreenshots.length > 0 && (!imageUrl || !generatedScreenshots.includes(imageUrl))) {
      setImageUrl(generatedScreenshots[0]);
    }

    if (cleanLiveUrl.includes('vercel')) {
      setAiSuccessMsg(`⚡ Captured ${generatedScreenshots.length} Live Screenshots from Vercel deployment!`);
    } else {
      setAiSuccessMsg(`📷 Auto-generated ${generatedScreenshots.length} project UI screenshots!`);
    }
    setTimeout(() => setAiSuccessMsg(''), 3000);
  };

  const handleApplyAISuggestion = () => {
    if (!aiSuggestion) return;

    if (aiSuggestion.autoTitle) setTitle(aiSuggestion.autoTitle);
    if (aiSuggestion.enhancedDescription) setDescription(aiSuggestion.enhancedDescription);
    if (aiSuggestion.longDescription) setLongDescription(aiSuggestion.longDescription);
    if (aiSuggestion.techStack && aiSuggestion.techStack.length > 0) {
      setTechStackInput(aiSuggestion.techStack.join(', '));
    }
    if (aiSuggestion.highlights && aiSuggestion.highlights.length > 0) {
      setHighlightsInput(aiSuggestion.highlights.join('\n'));
    }
    if (aiSuggestion.screenshotUrl) {
      setImageUrl(aiSuggestion.screenshotUrl);
    }
    if (aiSuggestion.images && aiSuggestion.images.length > 0) {
      setImages(aiSuggestion.images);
    }

    if (aiSuggestion.seoMetadata) {
      setMetaTitle(aiSuggestion.seoMetadata.metaTitle);
      setMetaDescription(aiSuggestion.seoMetadata.metaDescription);
      setOgTitle(aiSuggestion.seoMetadata.ogTitle);
      setOgDescription(aiSuggestion.seoMetadata.ogDescription);
      setOgType(aiSuggestion.seoMetadata.ogType);
      setKeywordsInput((aiSuggestion.seoMetadata.keywords || []).join(', '));
      setShowSeoSection(true);
    }

    setAiSuccessMsg('All AI suggestions applied to form successfully!');
    setShowAiModal(false);
    setTimeout(() => setAiSuccessMsg(''), 3000);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const techStack = techStackInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const highlights = highlightsInput
      .split('\n')
      .map(h => h.trim())
      .filter(Boolean);

    const keywords = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const finalImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
    const finalPrimaryImage = imageUrl || (finalImages[0] || '');
    const finalBestImages = bestImages.length > 0 
      ? bestImages.filter(img => finalImages.includes(img))
      : (finalPrimaryImage ? [finalPrimaryImage] : []);

    const seoMetadata: SEOMetadata | undefined = metaTitle || metaDescription ? {
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || description,
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || description,
      ogType: ogType || 'website',
      keywords,
    } : undefined;

    onSave({
      title,
      description,
      longDescription,
      category,
      techStack,
      githubUrl,
      liveUrl,
      imageUrl: finalPrimaryImage,
      images: finalImages,
      bestImages: finalBestImages,
      fitMode,
      featured,
      androidPackageName: category === 'Android' ? androidPackageName : undefined,
      highlights,
      seoMetadata,
    }, projectToEdit?.id);

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative max-w-2xl w-full rounded-2xl border p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar ${
            darkMode ? 'bg-stone-900 border-amber-900/30 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
          }`}
        >
          {/* Form Header */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-900/10">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              <Sparkles className="w-5 h-5 text-amber-500" />
              {projectToEdit ? 'Edit Project Details' : 'Add New Portfolio Project'}
            </h3>
            <button
              onClick={onClose}
              id="project-form-close-btn"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-100 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Smart AI Assistant Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            darkMode ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  <span>Smart AI Assistant for Project Metadata</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] uppercase tracking-wider font-bold">
                    Gemini AI
                  </span>
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Auto-generate titles, structured description, tech stack, and SEO metadata in 1 click.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerAIAssistant}
              disabled={aiLoading}
              id="generate-ai-metadata-btn"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate / Enhance with AI</span>
                </>
              )}
            </button>
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{aiSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-mono font-bold">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NovaTrack - Android Budget Manager"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-bold">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                  }`}
                >
                  <option value="Web">Web</option>
                  <option value="Android">Android</option>
                  <option value="Full Stack">Full Stack</option>
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1">
              <label className="font-mono font-bold">Short Description *</label>
              <input
                type="text"
                required
                placeholder="Brief summary displayed on project cards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                  darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                }`}
              />
            </div>

            {/* Long Description */}
            <div className="space-y-1">
              <label className="font-mono font-bold">Full Description / Case Study (Problem, Solution & Architecture)</label>
              <textarea
                rows={4}
                placeholder="Detailed explanation of the project features, design decisions, problem statement, and solution architecture..."
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                  darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                }`}
              />
            </div>

            {/* Tech Stack comma separated */}
            <div className="space-y-1">
              <label className="font-mono font-bold">Tech Stack (comma separated) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kotlin, Jetpack Compose, Room DB, Firebase"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                  darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                }`}
              />
            </div>

            {/* URLs: GitHub & Live */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono font-bold">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-bold">Live Demo / Release URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Android Package Name (if Android category) */}
            {category === 'Android' && (
              <div className="space-y-1">
                <label className="font-mono font-bold text-amber-600 dark:text-amber-400">Android Package Name (for Android Simulator)</label>
                <input
                  type="text"
                  placeholder="com.kirlous.appname"
                  value={androidPackageName}
                  onChange={(e) => setAndroidPackageName(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                  }`}
                />
              </div>
            )}

            {/* Image URL & Multi-Screenshot Gallery */}
            <div className="space-y-3 p-4 rounded-2xl border border-amber-500/20 bg-stone-900/30">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label className="font-mono font-bold text-sm flex items-center gap-1.5 text-amber-400">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Project Screenshots & Gallery ({images.length}) *</span>
                  </label>
                  <p className="text-[11px] text-stone-400">
                    Add multiple screenshots captured from Vercel deployment or custom URLs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateScreenshot}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95 shrink-0"
                  title="Auto-capture multiple HD screenshots from Vercel deployment or web platform"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-200" />
                  <span>📷 Auto-Capture Screenshots</span>
                </button>
              </div>

              {/* Image Fit Display Mode Selector */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-stone-800 bg-stone-950/60">
                <div className="flex items-center gap-2">
                  <Crop className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">Screenshot Display Fit Mode</span>
                    <span className="text-[10px] text-stone-400">Choose how screenshots fit inside frames (prevents header/footer cropping)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setFitMode('contain')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      fitMode === 'contain'
                        ? 'bg-amber-500 text-stone-950 font-extrabold shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                    title="Shows 100% of the screenshot without cropping top/bottom/sides"
                  >
                    <Maximize className="w-3 h-3" />
                    <span>Complete (Contain)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitMode('cover')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      fitMode === 'cover'
                        ? 'bg-amber-500 text-stone-950 font-extrabold shadow'
                        : 'text-stone-400 hover:text-white'
                    }`}
                    title="Fills frame area completely (may crop overflow)"
                  >
                    <Crop className="w-3 h-3" />
                    <span>Crop Fill (Cover)</span>
                  </button>
                </div>
              </div>

              {/* Primary Image Input */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-semibold text-stone-300">Cover / Primary Image URL:</span>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value && !images.includes(e.target.value)) {
                      setImages([e.target.value, ...images]);
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                  }`}
                />
              </div>

              {/* Multi-Screenshot Gallery Thumbnails Grid */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-stone-400">
                      Active Gallery Screenshots ({images.length}) — <span className="text-amber-400 font-bold">⭐ {bestImages.length} Marked as Best Shots</span>
                    </span>
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBestImages([...images])}
                        className="text-[10px] text-amber-400 hover:underline font-mono cursor-pointer"
                      >
                        ⭐ Mark All as Best
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {images.map((img, idx) => {
                      const isPrimary = img === imageUrl;
                      const isBest = bestImages.includes(img);
                      return (
                        <div
                          key={idx}
                          className={`group relative rounded-xl border overflow-hidden bg-stone-950 transition-all ${
                            isPrimary
                              ? 'border-amber-500 ring-2 ring-amber-500/30'
                              : isBest
                              ? 'border-amber-500/60'
                              : 'border-stone-800 hover:border-stone-600'
                          }`}
                        >
                          <div className="aspect-video w-full relative overflow-hidden bg-stone-900">
                            <ResponsiveImage
                              src={img}
                              alt={`Screenshot ${idx + 1}`}
                              type="thumb"
                              fitMode={fitMode}
                              fallbackCategory={category}
                              fallbackTitle={title}
                              fallbackTechStack={techStackInput.split(',')}
                              containerClassName="w-full h-full"
                            />
                            <div className="absolute top-1 left-1 flex flex-col gap-1 items-start">
                              {isPrimary && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-mono font-bold text-[9px] shadow">
                                  Cover
                                </span>
                              )}
                              {isBest && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-mono font-bold text-[9px] shadow flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-stone-950" />
                                  <span>Best Shot</span>
                                </span>
                              )}
                            </div>

                            {/* Quick Star Toggle Button Overlay */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isBest) {
                                  setBestImages(bestImages.filter(b => b !== img));
                                } else {
                                  setBestImages([...bestImages, img]);
                                }
                              }}
                              className={`absolute top-1 right-1 p-1 rounded-full cursor-pointer transition-transform active:scale-90 ${
                                isBest ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900/80 text-stone-400 hover:text-amber-400'
                              }`}
                              title={isBest ? 'Unmark as Best Screenshot' : 'Mark as Best Screenshot ⭐'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isBest ? 'fill-stone-950' : ''}`} />
                            </button>
                          </div>
                          
                          {/* Hover Actions */}
                          <div className="p-1.5 bg-stone-900/90 flex items-center justify-between gap-1 border-t border-stone-800">
                            <button
                              type="button"
                              onClick={() => setImageUrl(img)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                                isPrimary ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-300 hover:bg-amber-600 hover:text-white'
                              }`}
                            >
                              {isPrimary ? 'Cover' : 'Set Cover'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isBest) {
                                  setBestImages(bestImages.filter(b => b !== img));
                                } else {
                                  setBestImages([...bestImages, img]);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-0.5 cursor-pointer transition-colors ${
                                isBest ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'bg-stone-800 text-stone-400 hover:text-amber-400'
                              }`}
                            >
                              <Star className={`w-2.5 h-2.5 ${isBest ? 'fill-amber-300' : ''}`} />
                              <span>{isBest ? 'Best' : 'Mark Best'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const filtered = images.filter((_, i) => i !== idx);
                                setImages(filtered);
                                setBestImages(bestImages.filter(b => b !== img));
                                if (isPrimary && filtered.length > 0) {
                                  setImageUrl(filtered[0]);
                                }
                              }}
                              className="p-1 rounded bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer transition-colors"
                              title="Remove screenshot"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Custom Screenshot URL */}
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Add another image URL (https://...)"
                  value={newCustomImageUrl}
                  onChange={(e) => setNewCustomImageUrl(e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCustomImageUrl.trim()) {
                      const trimmed = newCustomImageUrl.trim();
                      if (!images.includes(trimmed)) {
                        setImages([...images, trimmed]);
                      }
                      if (!imageUrl) setImageUrl(trimmed);
                      setNewCustomImageUrl('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] text-stone-500 font-mono self-center">Presets:</span>
                {presetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      if (!images.includes(preset.url)) {
                        setImages([preset.url, ...images]);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 hover:text-white text-[10px] font-mono cursor-pointer hover:bg-amber-600 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Highlights (line separated) */}
            <div className="space-y-1">
              <label className="font-mono font-bold">Key Technical Highlights (one per line)</label>
              <textarea
                rows={3}
                placeholder="100% offline-first architecture&#10;Custom animations with Motion&#10;Sub-second loading times"
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                  darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                }`}
              />
            </div>

            {/* SEO & OpenGraph Section Accordion */}
            <div className={`rounded-xl border overflow-hidden ${
              darkMode ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-amber-200'
            }`}>
              <button
                type="button"
                onClick={() => setShowSeoSection(!showSeoSection)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-amber-500/5 transition-colors"
              >
                <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Globe className="w-4 h-4" />
                  <span>SEO & OpenGraph Metadata Suggestions</span>
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  {showSeoSection ? 'Hide SEO Fields [-]' : 'Show SEO Fields [+]'}
                </span>
              </button>

              {showSeoSection && (
                <div className="p-4 border-t border-stone-800 space-y-3 bg-stone-900/40">
                  <div className="space-y-1">
                    <label className="font-mono font-bold text-[11px]">Meta Title (Search Engines):</label>
                    <input
                      type="text"
                      placeholder="e.g. Kirlous Wael | NovaTrack Android App"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                        darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-[11px]">Meta Description (Google Snippet):</label>
                    <textarea
                      rows={2}
                      placeholder="150-160 characters describing the project for search engine ranking..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                        darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-mono font-bold text-[11px]">OpenGraph Social Title:</label>
                      <input
                        type="text"
                        placeholder="og:title"
                        value={ogTitle}
                        onChange={(e) => setOgTitle(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                          darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono font-bold text-[11px]">OpenGraph Type:</label>
                      <select
                        value={ogType}
                        onChange={(e) => setOgType(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                          darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
                        }`}
                      >
                        <option value="website">website</option>
                        <option value="article">article</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-[11px]">SEO Keywords (comma separated):</label>
                    <input
                      type="text"
                      placeholder="android, kotlin, jetpack compose, sqlite, room db, developer portfolio"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                        darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="featured-checkbox" className="font-bold cursor-pointer">
                Mark as Featured Project (Displays prominent badge)
              </label>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-amber-900/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-stone-800 text-white font-semibold cursor-pointer hover:bg-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform shadow-md shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Project</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>

      {/* AI Suggestion Review Drawer Modal */}
      {showAiModal && aiSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`max-w-2xl w-full p-6 sm:p-8 rounded-2xl border space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar ${
            darkMode ? 'bg-stone-900 border-amber-900/40 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-base">Gemini AI Metadata Generated</h4>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Suggested Marketing Title */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-mono font-bold text-amber-500 uppercase text-[10px]">
                  Auto Title Generation
                </span>
                <p className="font-extrabold text-sm text-stone-100">{aiSuggestion.autoTitle}</p>
              </div>

              {/* Structured Problem & Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="font-mono font-bold text-amber-500 uppercase text-[10px]">Problem Statement</span>
                  <p className="text-stone-300 leading-relaxed">{aiSuggestion.problem}</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="font-mono font-bold text-amber-500 uppercase text-[10px]">Technical Solution</span>
                  <p className="text-stone-300 leading-relaxed">{aiSuggestion.solution}</p>
                </div>
              </div>

              {/* Enhanced Description */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-mono font-bold text-amber-500 uppercase text-[10px]">Enhanced Short Summary</span>
                <p className="text-stone-300 leading-relaxed">{aiSuggestion.enhancedDescription}</p>
              </div>

              {/* Auto Detected Tech Stack */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-mono font-bold text-amber-500 uppercase text-[10px]">Tech Stack Auto-Detection</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {aiSuggestion.techStack.map((tech, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] font-bold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Technical Highlights */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-mono font-bold text-amber-500 uppercase text-[10px]">Generated Technical Highlights</span>
                <ul className="list-disc list-inside space-y-1 text-stone-300 pt-1">
                  {aiSuggestion.highlights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* SEO & OpenGraph Snippet */}
              {aiSuggestion.seoMetadata && (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <span className="font-mono font-bold text-amber-500 uppercase text-[10px]">Generated SEO & OpenGraph Tags</span>
                  <div className="space-y-1 text-stone-300">
                    <p><strong className="text-stone-100">Meta Title:</strong> {aiSuggestion.seoMetadata.metaTitle}</p>
                    <p><strong className="text-stone-100">Meta Description:</strong> {aiSuggestion.seoMetadata.metaDescription}</p>
                    <p><strong className="text-stone-100">Keywords:</strong> {(aiSuggestion.seoMetadata.keywords || []).join(', ')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleApplyAISuggestion}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer hover:scale-105 transition-transform"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply All AI Suggestions</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
