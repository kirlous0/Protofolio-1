/**
 * Auto-generates a live website screenshot preview URL
 * using reliable screenshot rendering services or category-optimized HD UI mockups.
 */
export function getWebsiteScreenshotUrl(options: {
  liveUrl?: string;
  githubUrl?: string;
  category?: 'Web' | 'Android' | 'Full Stack';
  title?: string;
  techStack?: string[];
}): string {
  const { liveUrl, githubUrl, category = 'Web', title = '', techStack = [] } = options;

  // 1. Live Website Screenshot Service if liveUrl is valid http/https
  if (liveUrl && liveUrl.trim().startsWith('http')) {
    const cleanUrl = liveUrl.trim();
    // Using Thum.io live web screenshot renderer (fast & reliable without API keys)
    return `https://image.thum.io/get/width/1200/crop/800/noanimate/${cleanUrl}`;
  }

  // 2. Infer GitHub Pages or Vercel URL from GitHub repository URL
  if (githubUrl && githubUrl.includes('github.com/')) {
    const cleaned = githubUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const parts = cleaned.split('/');
    if (parts.length >= 2) {
      const [owner, repo] = parts;
      const ghPagesUrl = `https://${owner}.github.io/${repo}/`;
      return `https://image.thum.io/get/width/1200/crop/800/noanimate/${ghPagesUrl}`;
    }
  }

  // 3. Category & Tech Stack Smart HD Visual UI Screenshot Presets
  const lowerTitle = title.toLowerCase();
  const stackStr = (Array.isArray(techStack) ? techStack.join(' ') : String(techStack)).toLowerCase();

  if (category === 'Android' || lowerTitle.includes('android') || stackStr.includes('kotlin') || stackStr.includes('jetpack')) {
    return 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80';
  }

  if (lowerTitle.includes('dashboard') || lowerTitle.includes('admin') || lowerTitle.includes('analytics') || category === 'Full Stack') {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';
  }

  if (lowerTitle.includes('shop') || lowerTitle.includes('e-commerce') || lowerTitle.includes('store') || lowerTitle.includes('nile')) {
    return 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80';
  }

  if (lowerTitle.includes('ai') || lowerTitle.includes('gpt') || lowerTitle.includes('smart') || stackStr.includes('gemini')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  }

  // Modern Web UI Default
  return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';
}
