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
import { enhanceProjectWithAI } from '../../services/aiEnhancerService';
import { getWebsiteScreenshotUrl } from '../../utils/screenshot';

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

interface VercelUser {
  id: string;
  email: string;
  name?: string;
  username: string;
  avatar?: string;
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
  const [vUser, setVUser] = useState<VercelUser | null>(null);
  const [vUserLoading, setVUserLoading] = useState(false);
  const [vProjects, setVProjects] = useState<VercelProjectItem[]>([]);
  const [vLoading, setVLoading] = useState(false);
  const [vError, setVError] = useState('');
  const [vSearch, setVSearch] = useState('');
  const [activeDeployments, setActiveDeployments] = useState<Record<string, VercelDeployment[]>>({});
  const [loadingDeployments, setLoadingDeployments] = useState<Record<string, boolean>>({});
  const [syncingAllLinked, setSyncingAllLinked] = useState(false);

  // Correlation helper: Find matching Vercel Project for a GitHub Repo
  const findMatchingVercelForRepo = (repo: GitHubRepoItem): VercelProjectItem | null => {
    if (!repo || !vProjects.length) return null;
    const repoNameLower = repo.name.toLowerCase();
    const repoFullNameLower = repo.full_name.toLowerCase();

    return vProjects.find((vp) => {
      const vpNameLower = vp.name.toLowerCase();
      if (vpNameLower === repoNameLower) return true;
      if (vp.link && vp.link.repo && vp.link.repo.toLowerCase() === repoFullNameLower) return true;
      if (vp.link && vp.link.repo && vp.link.repo.toLowerCase().includes(repoNameLower)) return true;
      if (vpNameLower.replace(/[-_]/g, '') === repoNameLower.replace(/[-_]/g, '')) return true;
      return false;
    }) || null;
  };

  // Correlation helper: Find matching GitHub Repo for a Vercel Project
  const findMatchingRepoForVercel = (vp: VercelProjectItem): GitHubRepoItem | null => {
    if (!vp || !ghRepos.length) return null;
    const vpNameLower = vp.name.toLowerCase();
    const linkedRepo = vp.link?.repo?.toLowerCase();

    return ghRepos.find((repo) => {
      const repoNameLower = repo.name.toLowerCase();
      const repoFullNameLower = repo.full_name.toLowerCase();

      if (linkedRepo && (linkedRepo === repoFullNameLower || linkedRepo.endsWith(`/${repoNameLower}`))) return true;
      if (repoNameLower === vpNameLower) return true;
      if (repoNameLower.replace(/[-_]/g, '') === vpNameLower.replace(/[-_]/g, '')) return true;
      return false;
    }) || null;
  };

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
      fetchVercelUser(config.vercelToken);
      fetchVercelProjects(config.vercelToken, config.vercelTeamId);
    }
  };

  // Safe fetch helper to parse JSON regardless of HTTP status
  const safeJsonFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`Safe fetch warning for ${url}:`, err);
    }
    return null;
  };

  const fetchVercelUser = async (token: string) => {
    if (!token) return;
    setVUserLoading(true);
    try {
      const proxyData = await safeJsonFetch('/api/integrations/vercel/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (proxyData?.success && proxyData.user) {
        setVUser(proxyData.user);
        return;
      }

      // Direct fallback for user profile
      const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
      const directRes = await fetch('https://api.vercel.com/v2/user', {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      if (directRes.ok && directRes.headers.get('content-type')?.includes('application/json')) {
        const uData = await directRes.json();
        setVUser(uData.user || uData);
      }
    } catch (err) {
      console.log('Error fetching Vercel user profile:', err);
    } finally {
      setVUserLoading(false);
    }
  };

  const fetchGitHubUser = async (token: string) => {
    if (!token) return;
    setGhUserLoading(true);
    try {
      // Try backend proxy first
      const proxyData = await safeJsonFetch('/api/integrations/github/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (proxyData?.success && proxyData.user) {
        setGhUser(proxyData.user);
        return;
      }

      // Fallback: Direct GitHub API fetch
      const directRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (directRes.ok && directRes.headers.get('content-type')?.includes('application/json')) {
        const user = await directRes.json();
        setGhUser(user);
      }
    } catch (err) {
      console.log('Error fetching GitHub user profile:', err);
    } finally {
      setGhUserLoading(false);
    }
  };

  const fetchGitHubRepos = async (token: string) => {
    if (!token) return;
    setGhLoading(true);
    setGhError('');
    try {
      // Try backend proxy first
      const proxyData = await safeJsonFetch('/api/integrations/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (proxyData?.success && Array.isArray(proxyData.repos)) {
        setGhRepos(proxyData.repos);
        return;
      }

      // Fallback: Direct GitHub API fetch
      const directRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const isJson = directRes.headers.get('content-type')?.includes('application/json');
      if (directRes.ok && isJson) {
        const repos = await directRes.json();
        if (Array.isArray(repos)) {
          setGhRepos(repos);
          return;
        }
      }

      if (!directRes.ok) {
        const errJson = isJson ? await directRes.json() : null;
        throw new Error(errJson?.message || `GitHub API returned ${directRes.status}. Please check your token scopes.`);
      }

      throw new Error('Failed to retrieve GitHub repositories.');
    } catch (err: any) {
      setGhError(err.message || 'Error connecting to GitHub.');
    } finally {
      setGhLoading(false);
    }
  };

  const fetchVercelProjects = async (token: string, teamId?: string) => {
    if (!token) return;
    setVLoading(true);
    setVError('');
    try {
      // Fetch Vercel user profile concurrently
      fetchVercelUser(token);

      // Try backend proxy first
      const proxyData = await safeJsonFetch('/api/integrations/vercel/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, teamId }),
      });

      if (proxyData?.success && Array.isArray(proxyData.projects)) {
        setVProjects(proxyData.projects);
        return;
      }

      if (proxyData?.error) {
        throw new Error(proxyData.error);
      }

      // Fallback: Direct Vercel API fetch
      let url = 'https://api.vercel.com/v9/projects';
      const cleanTeam = teamId?.trim();
      if (cleanTeam && cleanTeam !== 'undefined' && cleanTeam !== 'null') {
        url += `?teamId=${encodeURIComponent(cleanTeam)}`;
      }

      const cleanToken = token.trim().replace(/^Bearer\s+/i, '');

      const directRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const isJson = directRes.headers.get('content-type')?.includes('application/json');
      if (directRes.ok && isJson) {
        const data = await directRes.json();
        if (Array.isArray(data.projects)) {
          setVProjects(data.projects);
          return;
        }
      }

      if (!directRes.ok) {
        const errJson = isJson ? await directRes.json() : null;
        throw new Error(errJson?.error?.message || errJson?.message || `Vercel API returned ${directRes.status}. Check token credentials.`);
      }

      throw new Error('Failed to fetch Vercel projects.');
    } catch (err: any) {
      setVError(err.message || 'Error connecting to Vercel API. Please verify your token.');
    } finally {
      setVLoading(false);
    }
  };

  const fetchVercelDeployments = async (projectId: string) => {
    if (!config.vercelToken) return;
    setLoadingDeployments((prev) => ({ ...prev, [projectId]: true }));
    try {
      const proxyData = await safeJsonFetch('/api/integrations/vercel/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.vercelToken,
          projectId,
          teamId: config.vercelTeamId,
        }),
      });

      if (proxyData?.success && Array.isArray(proxyData.deployments)) {
        setActiveDeployments((prev) => ({ ...prev, [projectId]: proxyData.deployments }));
        return;
      }

      // Fallback: Direct Vercel API
      let url = `https://api.vercel.com/v6/deployments?limit=10&projectId=${encodeURIComponent(projectId.trim())}`;
      if (config.vercelTeamId) {
        url += `&teamId=${encodeURIComponent(config.vercelTeamId.trim())}`;
      }

      const directRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${config.vercelToken.trim()}`,
        },
      });

      if (directRes.ok && directRes.headers.get('content-type')?.includes('application/json')) {
        const data = await directRes.json();
        if (Array.isArray(data.deployments)) {
          setActiveDeployments((prev) => ({ ...prev, [projectId]: data.deployments }));
        }
      }
    } catch (err) {
      console.log('Error fetching deployments:', err);
    } finally {
      setLoadingDeployments((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // One-click AI Project Generator from GitHub Repo & correlated Vercel deployment
  const handleAiEnhanceRepoToDraft = async (repo: GitHubRepoItem) => {
    setAiGeneratingRepo(repo.name);
    try {
      // 1. Fetch README
      let readmeText = '';
      try {
        const readmeData = await safeJsonFetch('/api/integrations/github/readme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner: repo.full_name.split('/')[0],
            repo: repo.name,
            token: config.githubToken,
          }),
        });

        if (readmeData?.success && readmeData.content) {
          readmeText = readmeData.content;
        } else if (config.githubToken) {
          // Direct fallback for README
          const directReadme = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
            headers: {
              Authorization: `Bearer ${config.githubToken.trim()}`,
              Accept: 'application/vnd.github.v3.raw',
            },
          });
          if (directReadme.ok) {
            readmeText = await directReadme.text();
          }
        }
      } catch (e) {
        console.log('No README found for AI enhancement.');
      }

      // Find matching Vercel deployment
      const matchingVercel = findMatchingVercelForRepo(repo);
      let liveUrl = repo.homepage || '';
      if (!liveUrl && matchingVercel && matchingVercel.targets?.production?.url) {
        liveUrl = `https://${matchingVercel.targets.production.url}`;
      }

      const combinedTechStack = [
        repo.language,
        ...(matchingVercel?.framework ? [matchingVercel.framework] : []),
        ...(repo.topics || []),
      ].filter(Boolean) as string[];

      // 2. Call Gemini AI with combined GitHub + Vercel metadata
      const enriched = await enhanceProjectWithAI({
        title: repo.name,
        description: repo.description,
        category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
        techStack: combinedTechStack,
        githubUrl: repo.html_url,
        liveUrl,
        readmeContent: readmeText,
      });

      const autoScreenshot = enriched.screenshotUrl || getWebsiteScreenshotUrl({
        liveUrl,
        githubUrl: repo.html_url,
        category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
        title: repo.name,
        techStack: combinedTechStack,
      });

      const highlights = enriched.highlights || [
        `Source Code: ${repo.full_name}`,
        `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`,
      ];

      if (matchingVercel && liveUrl) {
        highlights.unshift(`Live Vercel Production: ${liveUrl}`);
      }

      onImportDraftProject({
        title: enriched.autoTitle || repo.name,
        description: enriched.enhancedDescription || repo.description || 'Modern full stack project.',
        longDescription: enriched.longDescription,
        category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
        techStack: enriched.techStack || (combinedTechStack.length ? combinedTechStack : ['TypeScript', 'React']),
        githubUrl: repo.html_url,
        liveUrl,
        imageUrl: autoScreenshot,
        featured: true,
        highlights,
        isDraft: true,
      });
    } catch (err) {
      console.log('AI enhancement error, falling back to basic draft:', err);
      handleConvertToDraft(repo);
    } finally {
      setAiGeneratingRepo(null);
    }
  };

  const handleImportVercelWithGitHubToDraft = async (vp: VercelProjectItem) => {
    const matchingRepo = findMatchingRepoForVercel(vp);
    if (matchingRepo) {
      await handleAiEnhanceRepoToDraft(matchingRepo);
      return;
    }

    // Fallback if no matching GitHub repo found
    const liveUrl = vp.targets?.production?.url ? `https://${vp.targets.production.url}` : '';
    const autoScreenshot = getWebsiteScreenshotUrl({
      liveUrl,
      title: vp.name,
      category: 'Web',
      techStack: [vp.framework || 'React', 'Vercel'],
    });

    onImportDraftProject({
      title: vp.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: `Production web application deployed on Vercel${vp.framework ? ` using ${vp.framework}` : ''}.`,
      category: 'Web',
      techStack: [vp.framework || 'Next.js', 'Vercel', 'TypeScript'],
      liveUrl,
      imageUrl: autoScreenshot,
      featured: true,
      highlights: [
        `Hosted on Vercel Platform`,
        `Framework: ${vp.framework || 'Web SPA'}`,
        `Production URL: ${liveUrl || 'Live App'}`,
      ],
      isDraft: true,
    });
  };

  const handleSyncAllLinkedProjects = async () => {
    setSyncingAllLinked(true);
    try {
      const linkedRepos = ghRepos.filter((repo) => findMatchingVercelForRepo(repo) !== null);
      for (const repo of linkedRepos) {
        await handleAiEnhanceRepoToDraft(repo);
      }
      setLinkSuccessMsg(`Successfully imported and AI-enhanced ${linkedRepos.length} correlated GitHub ⚡ Vercel projects!`);
      setTimeout(() => setLinkSuccessMsg(''), 4000);
    } catch (err) {
      console.log('Error syncing all linked projects:', err);
    } finally {
      setSyncingAllLinked(false);
    }
  };

  const handleConvertToDraft = async (repo: GitHubRepoItem) => {
    let readmeText = '';
    try {
      const readmeData = await safeJsonFetch('/api/integrations/github/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repo.full_name.split('/')[0],
          repo: repo.name,
          token: config.githubToken,
        }),
      });

      if (readmeData?.success && readmeData.content) {
        readmeText = readmeData.content;
      } else if (config.githubToken) {
        const directReadme = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
          headers: {
            Authorization: `Bearer ${config.githubToken.trim()}`,
            Accept: 'application/vnd.github.v3.raw',
          },
        });
        if (directReadme.ok) {
          readmeText = await directReadme.text();
        }
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

    const autoScreenshot = getWebsiteScreenshotUrl({
      liveUrl,
      githubUrl: repo.html_url,
      category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
      title: repo.name,
      techStack: [repo.language, ...(repo.topics || [])].filter(Boolean) as string[],
    });

    const draft: Partial<Project> = {
      title: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: repo.description || `Modern ${repo.language || 'Full Stack'} application built by Kirlous Wael.`,
      category: repo.language === 'Kotlin' || repo.language === 'Java' ? 'Android' : 'Web',
      techStack: [repo.language, ...(repo.topics || [])].filter(Boolean) as string[],
      githubUrl: repo.html_url,
      liveUrl,
      imageUrl: autoScreenshot,
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

      {/* Authenticated GitHub & Vercel Profile Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ghUser && (
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-4">
              <img
                src={ghUser.avatar_url}
                alt={ghUser.name || ghUser.login}
                className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover shrink-0"
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

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">GitHub Repos</span>
                <span className="font-bold text-slate-200">{ghRepos.length}</span>
              </div>
              <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0">
                <UserCheck className="w-3.5 h-3.5" /> GitHub
              </span>
            </div>
          </div>
        )}

        {vUser && (
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center font-bold text-white text-base overflow-hidden shrink-0">
                {vUser.avatar ? (
                  <img src={vUser.avatar} alt={vUser.username} className="w-full h-full object-cover" />
                ) : (
                  <Globe className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {vUser.name || vUser.username}
                  </h4>
                  <span className="text-xs font-mono text-cyan-400">@{vUser.username}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{vUser.email || 'Vercel Cloud Account Connected'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">Vercel Apps</span>
                <span className="font-bold text-slate-200">{vProjects.length}</span>
              </div>
              <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0">
                <UserCheck className="w-3.5 h-3.5" /> Vercel
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Smart GitHub ⚡ Vercel Correlation Banner */}
      {ghRepos.length > 0 && vProjects.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                GitHub ⚡ Vercel Auto-Correlation Active
              </h4>
            </div>
            <p className="text-xs text-slate-300">
              Found <span className="font-bold text-cyan-300">{ghRepos.filter(r => findMatchingVercelForRepo(r)).length} matched projects</span> sharing both GitHub source code and Vercel live deployments.
            </p>
          </div>

          <button
            onClick={handleSyncAllLinkedProjects}
            disabled={syncingAllLinked}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAllLinked ? 'animate-spin' : ''}`} />
            <span>{syncingAllLinked ? 'Syncing All Linked Drafts...' : 'Import All Linked GitHub ⚡ Vercel Projects'}</span>
          </button>
        </div>
      )}

      {/* Credentials Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub Credential Box */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 shrink-0">
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

            {/* Real-time Status Badge */}
            {!(config.githubToken && config.githubToken.trim()) ? (
              <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] font-mono shrink-0">
                Not Configured
              </span>
            ) : (ghLoading || ghUserLoading) ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" /> Connecting...
              </span>
            ) : ghError ? (
              <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                <AlertCircle className="w-3 h-3 text-red-400" /> Auth Failed
              </span>
            ) : (ghUser || ghRepos.length > 0) ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono shrink-0">
                Token Saved
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-400 flex items-center justify-between">
              <span>Personal Access Token (repo scope):</span>
              {config.githubToken && (
                <button
                  type="button"
                  onClick={() => {
                    fetchGitHubUser(config.githubToken!);
                    fetchGitHubRepos(config.githubToken!);
                  }}
                  disabled={ghLoading || ghUserLoading}
                  className="text-[10px] font-mono text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${ghLoading || ghUserLoading ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                value={config.githubToken || ''}
                onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-slate-500 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  fetchGitHubUser(config.githubToken || '');
                  fetchGitHubRepos(config.githubToken || '');
                }}
                disabled={!config.githubToken || ghLoading || ghUserLoading}
                className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ghLoading || ghUserLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Test</span>
              </button>
            </div>
          </div>

          {/* Connection Status & Debugging Feedback Banner */}
          {config.githubToken && (
            <div className="text-[11px] font-mono space-y-1">
              {ghError ? (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold">GitHub Connection Error:</p>
                    <p className="text-[10px] opacity-90 break-words">{ghError}</p>
                    <p className="text-[9px] text-red-300/80 pt-0.5">Tip: Ensure PAT has "repo" scope enabled in GitHub Developer Settings.</p>
                  </div>
                </div>
              ) : (ghUser || ghRepos.length > 0) ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="truncate">
                      Connected {ghUser ? `as @${ghUser.login}` : ''} ({ghRepos.length} Repositories ready)
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                    HTTP 200 OK
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Vercel Credential Box */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 shrink-0">
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

            {/* Real-time Status Badge */}
            {!(config.vercelToken && config.vercelToken.trim()) ? (
              <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] font-mono shrink-0">
                Not Configured
              </span>
            ) : vLoading ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" /> Connecting...
              </span>
            ) : vError ? (
              <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                <AlertCircle className="w-3 h-3 text-red-400" /> Auth Failed
              </span>
            ) : vProjects.length > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono shrink-0">
                Token Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-400 flex items-center justify-between">
                <span>Vercel API Token:</span>
              </label>
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
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="team_xxxxxxxxxxxx"
                  value={config.vercelTeamId || ''}
                  onChange={(e) => setConfig({ ...config, vercelTeamId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-slate-500 ${
                    darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => fetchVercelProjects(config.vercelToken || '', config.vercelTeamId)}
                  disabled={!config.vercelToken || vLoading}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer"
                  title="Test Vercel API Connection"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${vLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* Connection Status & Debugging Feedback Banner */}
          {config.vercelToken && (
            <div className="text-[11px] font-mono space-y-1">
              {vError ? (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold">Vercel Connection Error:</p>
                    <p className="text-[10px] opacity-90 break-words">{vError}</p>
                    <p className="text-[9px] text-red-300/80 pt-0.5">Tip: Check if Personal Access Token is valid and has access to the specified team ID.</p>
                  </div>
                </div>
              ) : vProjects.length > 0 ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="truncate">
                      Connected ({vProjects.length} Vercel Projects loaded)
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                    HTTP 200 OK
                  </span>
                </div>
              ) : null}
            </div>
          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto custom-scrollbar pr-2 pb-4">
                {filteredRepos.map((repo) => {
                  const matchingVercel = findMatchingVercelForRepo(repo);

                  return (
                    <div
                      key={repo.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all hover:border-slate-700 flex flex-col justify-between space-y-4 ${
                        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                            <h5 className={`font-bold text-xs sm:text-sm truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                              {repo.name}
                            </h5>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {repo.private ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-slate-700">
                                <Lock className="w-2.5 h-2.5" /> Private
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                                Public
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {repo.description || 'No description provided for this GitHub repository.'}
                        </p>

                        {/* Correlated Vercel Link Badge */}
                        {matchingVercel && (
                          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-950/70 to-slate-900 border border-blue-500/30 text-blue-300 text-[11px] font-mono flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 font-semibold truncate">
                              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">Vercel: {matchingVercel.targets?.production?.url || matchingVercel.name}</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 font-bold text-[9px] uppercase shrink-0">
                              {matchingVercel.framework || 'Live'}
                            </span>
                          </div>
                        )}

                        {/* Repository Language & Stars Stats Bar */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                          {repo.language && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700">
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-300 font-semibold">
                            <Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <GitFork className="w-3.5 h-3.5 text-slate-500" /> {repo.forks_count}
                          </span>
                        </div>
                      </div>

                      {/* Prominent Action Buttons Row */}
                      <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2.5">
                        <button
                          onClick={() => handleAiEnhanceRepoToDraft(repo)}
                          disabled={aiGeneratingRepo === repo.name}
                          className="flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 transition-all"
                          title="Use Gemini AI to analyze README and auto-generate portfolio metadata"
                        >
                          {aiGeneratingRepo === repo.name ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 text-cyan-200" />
                          )}
                          <span>{matchingVercel ? 'AI Enhance (GitHub ⚡ Vercel)' : 'AI Enhance & Draft'}</span>
                        </button>

                        <button
                          onClick={() => handleConvertToDraft(repo)}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-700 shrink-0"
                          title="Import repository directly as draft"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>Quick Draft</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto custom-scrollbar pr-2 pb-4">
                {filteredVercel.map((vp) => {
                  const prodUrl = vp.targets?.production?.url ? `https://${vp.targets.production.url}` : null;
                  const deployments = activeDeployments[vp.id] || [];
                  const isLoadingDep = loadingDeployments[vp.id];
                  const matchingRepo = findMatchingRepoForVercel(vp);

                  return (
                    <div
                      key={vp.id}
                      className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className={`font-bold text-xs sm:text-sm truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                            {vp.name}
                          </h5>
                          {vp.framework && (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold shrink-0 border border-slate-700">
                              {vp.framework}
                            </span>
                          )}
                        </div>

                        {prodUrl ? (
                          <a
                            href={prodUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                            <span className="truncate">{prodUrl}</span>
                          </a>
                        ) : (
                          <p className="text-xs text-slate-500 font-mono">No active production deployment URL</p>
                        )}

                        {/* Correlated GitHub Repo Badge */}
                        {matchingRepo && (
                          <div className="p-2 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/70 border border-indigo-500/30 text-indigo-200 text-[11px] font-mono flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 font-semibold truncate">
                              <Github className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate">Source Repo: {matchingRepo.full_name}</span>
                            </span>
                            <span className="flex items-center gap-1 text-amber-400 font-bold text-[10px] shrink-0">
                              <Star className="w-3 h-3 fill-amber-400" /> {matchingRepo.stargazers_count}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Deployments status inspector block */}
                      {deployments.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
                          <div className="text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold text-slate-300">
                              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Deployment Status
                            </span>
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              deployments[0].state === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {deployments[0].state}
                            </span>
                          </div>
                          <p className="text-slate-400 truncate text-[11px]">
                            Commit: {deployments[0].meta?.githubCommitMessage || deployments[0].meta?.gitCommitMessage || 'Production deployment'}
                          </p>
                        </div>
                      )}

                      {/* Clear, Spacious Action Buttons Row */}
                      <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => fetchVercelDeployments(vp.id)}
                            disabled={isLoadingDep}
                            className="px-3 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Inspect live build history and logs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDep ? 'animate-spin text-blue-400' : ''}`} />
                            <span>Builds</span>
                          </button>

                          {prodUrl && (
                            <button
                              onClick={() => setLinkingVercelUrl(prodUrl)}
                              className="px-3 py-2 rounded-xl border border-slate-700 text-blue-400 hover:bg-slate-800 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Link live URL to portfolio project"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>Link URL</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleImportVercelWithGitHubToDraft(vp)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700 shrink-0"
                          title="Import project draft with correlated GitHub repository & README"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{matchingRepo ? 'Import Draft (GitHub ⚡ Vercel)' : 'Import Draft'}</span>
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
