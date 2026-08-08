import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Globe, 
  Key, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Plus, 
  Lock, 
  Star, 
  GitFork, 
  Link2, 
  Zap, 
  Code2,
  Check,
  UserCheck,
  Activity,
  Layers,
  Bot
} from 'lucide-react';
import { GitHubRepoItem, IntegrationConfig, Project, VercelProjectItem } from '../../types';
import { storageService } from '../../services/storageService';

interface IntegrationsTabProps {
  darkMode: boolean;
  onImportDraftProject: (draft: Partial<Project>) => void;
  existingProjects: Project[];
  onUpdateProjectLiveUrl: (projectId: string, liveUrl: string) => void;
}

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'READY' | 'BUILDING' | 'ERROR' | string;
  created: number;
  meta?: { githubCommitMessage?: string; gitCommitMessage?: string };
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  darkMode,
  onImportDraftProject,
  existingProjects,
  onUpdateProjectLiveUrl,
}) => {
  const [config, setConfig] = useState<IntegrationConfig>({
    githubToken: '',
    vercelToken: '',
    vercelTeamId: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // GitHub state
  const [ghUser, setGhUser] = useState<GitHubUser | null>(null);
  const [ghUserLoading, setGhUserLoading] = useState(false);
  const [ghRepos, setGhRepos] = useState<GitHubRepoItem[]>([]);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState('');
  const [ghSearch, setGhSearch] = useState('');
  const [ghFilter, setGhFilter] = useState<'all' | 'public' | 'private'>('all');
  const [aiGeneratingRepo, setAiGeneratingRepo] = useState<string | null>(null);

  // Vercel state
  const [vProjects, setVProjects] = useState<VercelProjectItem[]>([]);
  const [vLoading, setVLoading] = useState(false);
  const [vError, setVError] = useState('');
  const [vSearch, setVSearch] = useState('');
  const [activeDeployments, setActiveDeployments] = useState<Record<string, VercelDeployment[]>>({});
  const [loadingDeployments, setLoadingDeployments] = useState<Record<string, boolean>>({});

  // Auto-link modal state
  const [linkingVercelUrl, setLinkingVercelUrl] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [linkSuccessMsg, setLinkSuccessMsg] = useState('');

  useEffect(() => {
    const loaded = storageService.getIntegrationsConfig();
    setConfig(loaded);

    if (loaded.githubToken) {
      fetchGitHubUser(loaded.githubToken);
      fetchGitHubRepos(loaded.githubToken);
    }
    if (loaded.vercelToken) {
      fetchVercelProjects(loaded.vercelToken, loaded.vercelTeamId);
    }
  }, []);

  const handleSaveConfig = () => {
    storageService.saveIntegrationsConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (config.githubToken) {
      fetchGitHubUser(config.githubToken);
      fetchGitHubRepos(config.githubToken);
    }
    if (config.vercelToken) {
      fetchVercelProjects(config.vercelToken, config.vercelTeamId);
    }
  };

  const fetchGitHubUser = async (token: string) => {
    setGhUserLoading(true);
    try {
      const res = await fetch('/api/integrations/github/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setGhUser(data.user);
      }
    } catch (err) {
      console.log('Error fetching GitHub user profile:', err);
    } finally {
      setGhUserLoading(false);
    }
  };

  const fetchGitHubRepos = async (token: string) => {
    setGhLoading(true);
    setGhError('');
    try {
      const res = await fetch('/api/integrations/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch repositories.');
      }
      setGhRepos(data.repos || []);
    } catch (err: any) {
      setGhError(err.message || 'Error connecting to GitHub.');
    } finally {
      setGhLoading(false);
    }
  };

  const fetchVercelProjects = async (token: string, teamId?: string) => {
    setVLoading(true);
    setVError('');
    try {
      const res = await fetch('/api/integrations/vercel/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, teamId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch Vercel projects.');
      }
      setVProjects(data.projects || []);
    } catch (err: any) {
      setVError(err.message || 'Error connecting to Vercel.');
    } finally {
      setVLoading(false);
    }
  };

  const fetchVercelDeployments = async (projectId: string) => {
    if (!config.vercelToken) return;
    setLoadingDeployments((prev) => ({ ...prev, [projectId]: true }));
    try {
      const res = await fetch('/api/integrations/vercel/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.vercelToken,
          projectId,
          teamId: config.vercelTeamId,
        }),
      });
      const data = await res.json();
      if (data.success && data.deployments) {
        setActiveDeployments((prev) => ({ ...prev, [projectId]: data.deployments }));
      }
    } catch (err) {
      console.log('Error fetching deployments:', err);
    } finally {
      setLoadingDeployments((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // One-click AI Project Generator from GitHub Repo
  const handleAiEnhanceRepoToDraft = async (repo: GitHubRepoItem) => {
    setAiGeneratingRepo(repo.name);
    try {
      // 1. Fetch README
      let readmeText = '';
      try {
        const readmeRes = await fetch('/api/integrations/github/readme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner: repo.full_name.split('/')[0],
            repo: repo.name,
            token: config.githubToken,
          }),
        });
        const readmeData = await readmeRes.json();
        if (readmeData.success && readmeData.content) {
          readmeText = readmeData.content;
        }
      } catch (e) {
        console.log('No README found for AI enhancement.');
      }

      // 2. Call Gemini AI route
      const aiRes = await fetch('/api/ai/enhance-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: repo.name,
          description: repo.description,
          category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
          techStack: [repo.language, ...(repo.topics || [])].filter(Boolean),
          githubUrl: repo.html_url,
          readmeContent: readmeText,
        }),
      });

      const aiData = await aiRes.json();

      let liveUrl = repo.homepage || '';
      const matchingVercel = vProjects.find(
        (v) => v.name.toLowerCase() === repo.name.toLowerCase()
      );
      if (!liveUrl && matchingVercel && matchingVercel.targets?.production?.url) {
        liveUrl = `https://${matchingVercel.targets.production.url}`;
      }

      if (aiData.success && aiData.data) {
        const enriched = aiData.data;
        onImportDraftProject({
          title: enriched.autoTitle || repo.name,
          description: enriched.enhancedDescription || repo.description || 'Modern full stack project.',
          longDescription: enriched.longDescription,
          category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
          techStack: enriched.techStack || [repo.language || 'TypeScript'],
          githubUrl: repo.html_url,
          liveUrl,
          imageUrl: repo.language === 'Kotlin'
            ? 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80'
            : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
          featured: true,
          highlights: enriched.highlights || [
            `AI Enriched from repository ${repo.full_name}`,
            `Stars: ${repo.stargazers_count}`,
          ],
          isDraft: true,
        });
      } else {
        // Fallback standard draft
        handleConvertToDraft(repo);
      }
    } catch (err) {
      console.log('AI enhancement error, falling back to basic draft:', err);
      handleConvertToDraft(repo);
    } finally {
      setAiGeneratingRepo(null);
    }
  };

  const handleConvertToDraft = async (repo: GitHubRepoItem) => {
    let readmeText = '';
    try {
      const res = await fetch('/api/integrations/github/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repo.full_name.split('/')[0],
          repo: repo.name,
          token: config.githubToken,
        }),
      });
      const data = await res.json();
      if (data.success && data.content) {
        readmeText = data.content;
      }
    } catch (e) {
      console.log('No README found.');
    }

    const matchingVercel = vProjects.find(
      (v) => v.name.toLowerCase() === repo.name.toLowerCase() || (v.link && v.link.repo.toLowerCase() === repo.full_name.toLowerCase())
    );

    let liveUrl = repo.homepage || '';
    if (!liveUrl && matchingVercel && matchingVercel.targets?.production?.url) {
      liveUrl = `https://${matchingVercel.targets.production.url}`;
    }

    const draft: Partial<Project> = {
      title: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: repo.description || `Modern ${repo.language || 'Full Stack'} application built by Kirlous Wael.`,
      category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
      techStack: [repo.language, ...(repo.topics || [])].filter(Boolean) as string[],
      githubUrl: repo.html_url,
      liveUrl,
      imageUrl: repo.language === 'Kotlin' ? 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      featured: repo.stargazers_count > 0,
      highlights: [
        `Auto-imported from GitHub repository ${repo.full_name}`,
        `Primary Language: ${repo.language || 'Multi-stack'}`,
        `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`,
      ],
      isDraft: true,
      longDescription: readmeText ? `### GitHub README Snippet\n\n${readmeText}` : undefined,
    };

    onImportDraftProject(draft);
  };

  const handleConfirmLinkVercelUrl = () => {
    if (!linkingVercelUrl || !selectedProjectId) return;
    onUpdateProjectLiveUrl(selectedProjectId, linkingVercelUrl);
    setLinkSuccessMsg('Successfully linked Vercel URL to selected portfolio project!');
    setTimeout(() => {
      setLinkSuccessMsg('');
      setLinkingVercelUrl(null);
      setSelectedProjectId('');
    }, 2000);
  };

  const filteredRepos = ghRepos.filter((repo) => {
    const matchesSearch = repo.name.toLowerCase().includes(ghSearch.toLowerCase()) || (repo.description && repo.description.toLowerCase().includes(ghSearch.toLowerCase()));
    if (ghFilter === 'public') return matchesSearch && !repo.private;
    if (ghFilter === 'private') return matchesSearch && repo.private;
    return matchesSearch;
  });

  const filteredVercel = vProjects.filter((p) => p.name.toLowerCase().includes(vSearch.toLowerCase()));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base">GitHub & Vercel API Developer Integrations</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connect personal API keys to auto-import repositories, generate AI-enriched project drafts, monitor live Vercel deployments, and link production URLs directly.
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          id="save-integrations-btn"
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings Saved & Synced!</span>
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              <span>Save & Connect API Keys</span>
            </>
          )}
        </button>
      </div>

      {/* Authenticated GitHub Profile Health Card (If Connected) */}
      {ghUser && (
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <img
              src={ghUser.avatar_url}
              alt={ghUser.name || ghUser.login}
              className="w-12 h-12 rounded-full border-2 border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-bold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {ghUser.name || ghUser.login}
                </h4>
                <a
                  href={ghUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  @{ghUser.login} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{ghUser.bio || 'GitHub Developer Account Connected'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="text-center px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 text-[10px] block">Public Repos</span>
              <span className="font-bold text-slate-200">{ghUser.public_repos}</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 text-[10px] block">Followers</span>
              <span className="font-bold text-slate-200">{ghUser.followers}</span>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Active Token
            </span>
          </div>
        </div>
      )}

      {/* Credentials Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub Credential Box */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  GitHub Personal Access Token (PAT)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Allows fetching all public & private repositories & READMEs
                </p>
              </div>
            </div>

            {config.githubToken ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] font-mono">
                Not Configured
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-400">
              Personal Access Token (repo scope):
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
              value={config.githubToken || ''}
              onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-slate-500 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Vercel Credential Box */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Vercel API Key & Team ID
                </h4>
                <p className="text-[11px] text-slate-500">
                  Auto-syncs live deployment URLs & build logs
                </p>
              </div>
            </div>

            {config.vercelToken ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] font-mono">
                Not Configured
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-400">Vercel API Token:</label>
              <input
                type="password"
                placeholder="vca_xxxxxxxxxxxx"
                value={config.vercelToken || ''}
                onChange={(e) => setConfig({ ...config, vercelToken: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-slate-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-400">Team ID (Optional):</label>
              <input
                type="text"
                placeholder="team_xxxxxxxxxxxx"
                value={config.vercelTeamId || ''}
                onChange={(e) => setConfig({ ...config, vercelTeamId: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-slate-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Repositories Explorer Section */}
      <div className={`p-6 rounded-2xl border space-y-5 ${
        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className={`text-base font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              <Github className="w-5 h-5 text-slate-300" />
              <span>GitHub Repositories Explorer ({ghRepos.length})</span>
            </h4>
            <p className="text-xs text-slate-500">
              Import repos or click <span className="font-bold text-blue-400">"AI Enhance & Draft"</span> to auto-generate enriched portfolio descriptions using Gemini AI!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {config.githubToken && (
              <button
                onClick={() => {
                  fetchGitHubUser(config.githubToken!);
                  fetchGitHubRepos(config.githubToken!);
                }}
                disabled={ghLoading || ghUserLoading}
                className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ghLoading ? 'animate-spin' : ''}`} />
                <span>Sync Repos & Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        {config.githubToken ? (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search repository name or description..."
                  value={ghSearch}
                  onChange={(e) => setGhSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:border-slate-500 ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 shrink-0">
                {(['all', 'public', 'private'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setGhFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer ${
                      ghFilter === f ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {ghError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ghError}</span>
              </div>
            )}

            {/* Repositories Grid */}
            {ghLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p>Fetching repositories from GitHub API...</p>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-2xl">
                No matching repositories found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`p-4 rounded-xl border transition-all hover:border-slate-700 flex flex-col justify-between space-y-3 ${
                      darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <h5 className={`font-bold text-xs truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {repo.name}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {repo.private ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Private
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                              Public
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {repo.description || 'No description provided for this GitHub repository.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <span className="text-slate-300 font-bold">{repo.language}</span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400" /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <GitFork className="w-3 h-3 text-slate-500" /> {repo.forks_count}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAiEnhanceRepoToDraft(repo)}
                          disabled={aiGeneratingRepo === repo.name}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                          title="Use Gemini AI to analyze README and auto-generate portfolio metadata"
                        >
                          {aiGeneratingRepo === repo.name ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Bot className="w-3 h-3 text-cyan-300" />
                          )}
                          <span>AI Enhance</span>
                        </button>

                        <button
                          onClick={() => handleConvertToDraft(repo)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Import repository directly as draft"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Draft</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl space-y-3">
            <Github className="w-10 h-10 mx-auto text-slate-600" />
            <h5 className="font-bold text-sm text-slate-300">GitHub PAT Required</h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please enter and save your GitHub Personal Access Token above to load your repositories and import project drafts.
            </p>
          </div>
        )}
      </div>

      {/* Vercel Projects & Deployments Explorer */}
      <div className={`p-6 rounded-2xl border space-y-5 ${
        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className={`text-base font-bold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              <Globe className="w-5 h-5 text-slate-300" />
              <span>Vercel Projects & Deployments ({vProjects.length})</span>
            </h4>
            <p className="text-xs text-slate-500">
              Fetch hosted web applications, inspect live build states, and auto-link production deployment URLs to portfolio cards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {config.vercelToken && (
              <button
                onClick={() => fetchVercelProjects(config.vercelToken!, config.vercelTeamId)}
                disabled={vLoading}
                className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${vLoading ? 'animate-spin' : ''}`} />
                <span>Fetch Vercel Apps</span>
              </button>
            )}
          </div>
        </div>

        {config.vercelToken ? (
          <>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Vercel project name..."
                value={vSearch}
                onChange={(e) => setVSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:border-slate-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {vError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{vError}</span>
              </div>
            )}

            {vLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p>Fetching projects from Vercel REST API...</p>
              </div>
            ) : filteredVercel.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-2xl">
                No Vercel projects found. Ensure your Vercel Token is valid.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {filteredVercel.map((vp) => {
                  const prodUrl = vp.targets?.production?.url ? `https://${vp.targets.production.url}` : null;
                  const deployments = activeDeployments[vp.id] || [];
                  const isLoadingDep = loadingDeployments[vp.id];

                  return (
                    <div
                      key={vp.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                        darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className={`font-bold text-xs truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {vp.name}
                          </h5>
                          {vp.framework && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                              {vp.framework}
                            </span>
                          )}
                        </div>

                        {prodUrl ? (
                          <a
                            href={prodUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{prodUrl}</span>
                          </a>
                        ) : (
                          <p className="text-[10px] text-slate-500 font-mono">No active production deployment URL</p>
                        )}
                      </div>

                      {/* Deployments status inspector block */}
                      {deployments.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[10px] font-mono">
                          <div className="text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1 font-bold text-slate-300">
                              <Activity className="w-3 h-3 text-emerald-400" /> Latest Deployment
                            </span>
                            <span className={`px-1.5 py-0.2 rounded font-bold ${
                              deployments[0].state === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {deployments[0].state}
                            </span>
                          </div>
                          <p className="text-slate-400 truncate">
                            Commit: {deployments[0].meta?.githubCommitMessage || deployments[0].meta?.gitCommitMessage || 'Production deployment'}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => fetchVercelDeployments(vp.id)}
                            disabled={isLoadingDep}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                            title="Inspect live build history and logs"
                          >
                            <RefreshCw className={`w-3 h-3 ${isLoadingDep ? 'animate-spin' : ''}`} />
                            <span>Builds</span>
                          </button>

                          {prodUrl && (
                            <button
                              onClick={() => setLinkingVercelUrl(prodUrl)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Link2 className="w-3 h-3 text-blue-400" />
                              <span>Link URL</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            onImportDraftProject({
                              title: vp.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                              description: `Live web application hosted on Vercel platform.`,
                              category: 'Web',
                              techStack: vp.framework ? [vp.framework, 'Vercel', 'TypeScript'] : ['React', 'Vercel'],
                              liveUrl: prodUrl || undefined,
                              imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
                              featured: true,
                              isDraft: true,
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span>Import Draft</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl space-y-3">
            <Globe className="w-10 h-10 mx-auto text-slate-600" />
            <h5 className="font-bold text-sm text-slate-300">Vercel API Key Required</h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please enter your Vercel API Token above to fetch your hosted web applications and live deployment links.
            </p>
          </div>
        )}
      </div>

      {/* Auto-link Vercel URL Modal */}
      {linkingVercelUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`max-w-md w-full p-6 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h4 className="text-base font-bold flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-400" />
              <span>Link Vercel Live URL to Project</span>
            </h4>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">Target Vercel Production URL:</p>
              <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-blue-400 border border-slate-800 truncate">
                {linkingVercelUrl}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold">Select Portfolio Project:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-slate-500 ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="">-- Choose a Project --</option>
                {existingProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {linkSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{linkSuccessMsg}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setLinkingVercelUrl(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLinkVercelUrl}
                disabled={!selectedProjectId}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md disabled:opacity-50 cursor-pointer"
              >
                Apply URL Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
