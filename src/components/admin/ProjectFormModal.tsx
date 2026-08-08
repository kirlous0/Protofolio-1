import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Sparkles, Smartphone, Globe, Code, Wand2, RefreshCw, CheckCircle2, AlertCircle, Search, Layers, FileText, Camera, Image, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIEnhancementResponse, Project, SEOMetadata } from '../../types';
import { enhanceProjectWithAI } from '../../services/aiEnhancerService';
import { getWebsiteScreenshotUrl } from '../../utils/screenshot';

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
    const generatedUrl = getWebsiteScreenshotUrl({
      liveUrl,
      githubUrl,
      category,
      title,
      techStack: techStackInput.split(',').map(s => s.trim()).filter(Boolean),
    });
    setImageUrl(generatedUrl);
    setAiSuccessMsg('📷 Live website screenshot URL auto-generated!');
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
      imageUrl,
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

            {/* Image URL & Presets & Auto-Screenshot */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="font-mono font-bold">Image Preview URL / Screenshot *</label>
                <button
                  type="button"
                  onClick={handleAutoGenerateScreenshot}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
                  title="Auto-capture live website screenshot from Live URL or GitHub"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-200" />
                  <span>📷 Auto Website Screenshot</span>
                </button>
              </div>

              <input
                type="url"
                required
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 ${
                  darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                }`}
              />

              {/* Live Thumbnail Image Preview */}
              {imageUrl && (
                <div className={`p-2.5 rounded-xl border flex items-center gap-3 ${
                  darkMode ? 'bg-stone-950/80 border-stone-800' : 'bg-stone-100 border-amber-200'
                }`}>
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-700 relative">
                    <img
                      src={imageUrl}
                      alt="Preview screenshot"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                  </div>
                  <div className="text-[11px] min-w-0 space-y-0.5">
                    <p className="font-bold text-amber-500 flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" />
                      <span>Live Image Preview Active</span>
                    </p>
                    <p className="text-stone-400 font-mono text-[10px] truncate max-w-[320px]">
                      {imageUrl}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] text-stone-500 font-mono self-center">Presets:</span>
                {presetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="px-2.5 py-1 rounded bg-stone-800 text-stone-300 hover:text-white text-[10px] font-mono cursor-pointer hover:bg-amber-600 transition-colors"
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
