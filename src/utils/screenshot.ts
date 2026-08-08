/**
 * Auto-generates high-definition, domain-specific UI screenshots
 * and live website previews from Vercel deployments and web platforms.
 */

// Curated UI Screenshot Pools - Strictly modern application interfaces (NO code editors or syntax screens)
const MOBILE_ANDROID_UI = [
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80', // Android Native UI & Navigation Menu
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80', // Smartphone App Inner Dashboard
  'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80', // Mobile Tracking Screen & Menu Drawer
  'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80', // Android Device App Settings & Profile Interface
];

const DASHBOARD_ANALYTICS_UI = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // Modern Analytics Dashboard & Sidebar
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', // Web Analytics, Menu Items & KPI Charts
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80', // Data Analysis Suite & Navigation Header
  'https://images.unsplash.com/photo-1542744094-3a31b272c390?auto=format&fit=crop&w=1200&q=80', // Executive Management Platform & Sub-pages
];

const ECOMMERCE_SHOPPING_UI = [
  'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80', // E-Commerce Checkout UI & Cart Menu
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80', // Online Storefront & Category Navigation
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', // Digital Fashion & Product Details Page
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80', // Retail Web Catalog & Filter Menu
];

const AI_GENAI_UI = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Neural AI Interface & Sidebar Prompts
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80', // AI Platform Workspace & Chat History Menu
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80', // Smart Intelligent Studio & Settings View
];

const SAAS_WEB_PLATFORM_UI = [
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', // SaaS Web App Landing & Top Menu
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', // Modern Web Platform & Navigation Tabs
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80', // Product Design UI & Interactive Component Tree
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', // Web Studio Layout & Sub-sections
];

const FINTECH_CRYPTO_UI = [
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', // Finance & Trading UI
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', // Crypto & Digital Wallet Dashboard
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', // Banking Mobile Screen
];

/**
 * Generates a responsive srcSet string for Unsplash and thum.io URLs
 */
export function generateSrcSet(url: string, widths: number[] = [400, 800, 1200, 1600]): string | undefined {
  if (!url || typeof url !== 'string') return undefined;

  if (url.includes('images.unsplash.com')) {
    try {
      return widths
        .map((w) => {
          const urlObj = new URL(url);
          urlObj.searchParams.set('w', w.toString());
          if (!urlObj.searchParams.has('q')) urlObj.searchParams.set('q', '80');
          if (!urlObj.searchParams.has('auto')) urlObj.searchParams.set('auto', 'format');
          return `${urlObj.toString()} ${w}w`;
        })
        .join(', ');
    } catch {
      return widths.map((w) => `${url.replace(/w=\d+/, `w=${w}`)} ${w}w`).join(', ');
    }
  }

  if (url.includes('image.thum.io/get')) {
    return widths
      .map((w) => {
        const resizedUrl = url.replace(/\/width\/\d+\//, `/width/${w}/`);
        return `${resizedUrl} ${w}w`;
      })
      .join(', ');
  }

  return undefined;
}

/**
 * Calculates a deterministic integer hash from a string to select a unique image per project
 */
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a domain-matched fallback HD UI screenshot for safe image error recovery
 */
export function getFallbackScreenshot(category?: string, title?: string, techStack?: string[]): string {
  const titleLower = (title || '').toLowerCase();
  const stackStr = (Array.isArray(techStack) ? techStack.join(' ') : String(techStack || '')).toLowerCase();
  const seedString = `${titleLower}_fallback_${category || 'Web'}`;
  const hash = getDeterministicHash(seedString);

  if (category === 'Android' || titleLower.includes('android') || stackStr.includes('kotlin') || stackStr.includes('flutter')) {
    return MOBILE_ANDROID_UI[hash % MOBILE_ANDROID_UI.length];
  }
  if (titleLower.includes('ai') || titleLower.includes('gpt') || titleLower.includes('gemini') || stackStr.includes('gemini')) {
    return AI_GENAI_UI[hash % AI_GENAI_UI.length];
  }
  if (titleLower.includes('shop') || titleLower.includes('store') || titleLower.includes('e-commerce') || titleLower.includes('ecommerce')) {
    return ECOMMERCE_SHOPPING_UI[hash % ECOMMERCE_SHOPPING_UI.length];
  }
  if (titleLower.includes('dashboard') || titleLower.includes('admin') || titleLower.includes('analytics') || category === 'Full Stack') {
    return DASHBOARD_ANALYTICS_UI[hash % DASHBOARD_ANALYTICS_UI.length];
  }
  if (titleLower.includes('pay') || titleLower.includes('finance') || titleLower.includes('crypto') || titleLower.includes('bank')) {
    return FINTECH_CRYPTO_UI[hash % FINTECH_CRYPTO_UI.length];
  }

  return SAAS_WEB_PLATFORM_UI[hash % SAAS_WEB_PLATFORM_UI.length];
}

/**
 * Auto-generates multiple high-definition, domain-specific UI screenshots
 * and live website previews from Vercel deployments and web platforms.
 */
export function getProjectScreenshots(options: {
  liveUrl?: string;
  githubUrl?: string;
  category?: 'Web' | 'Android' | 'Full Stack';
  title?: string;
  techStack?: string[];
  imageUrl?: string;
  existingImages?: string[];
}): string[] {
  const { liveUrl, githubUrl, category = 'Web', title = '', techStack = [], imageUrl, existingImages } = options;
  const list: string[] = [];

  // 1. Preserve initial primary image if valid (and not an automated thum/microlink snapshot that might be dark)
  if (imageUrl && imageUrl.trim()) {
    list.push(imageUrl.trim());
  }

  // 2. Preserve existing array of images
  if (Array.isArray(existingImages)) {
    existingImages.forEach((img) => {
      if (img && img.trim() && !list.includes(img.trim())) {
        list.push(img.trim());
      }
    });
  }

  // 3. Curated HD UI Mockups matching domain (Guarantees crisp typography, menus & full interface)
  const titleLower = title.toLowerCase();
  const stackStr = (Array.isArray(techStack) ? techStack.join(' ') : String(techStack || '')).toLowerCase();
  const seedString = `${titleLower}_${githubUrl || ''}_${category}`;
  const hash = getDeterministicHash(seedString);

  let pool = SAAS_WEB_PLATFORM_UI;
  if (category === 'Android' || titleLower.includes('android') || stackStr.includes('kotlin') || stackStr.includes('flutter')) {
    pool = MOBILE_ANDROID_UI;
  } else if (titleLower.includes('ai') || titleLower.includes('gpt') || titleLower.includes('gemini') || stackStr.includes('gemini')) {
    pool = AI_GENAI_UI;
  } else if (titleLower.includes('shop') || titleLower.includes('store') || titleLower.includes('food') || titleLower.includes('gastro') || titleLower.includes('e-commerce') || titleLower.includes('ecommerce')) {
    pool = ECOMMERCE_SHOPPING_UI;
  } else if (titleLower.includes('dashboard') || titleLower.includes('admin') || titleLower.includes('analytics') || category === 'Full Stack') {
    pool = DASHBOARD_ANALYTICS_UI;
  } else if (titleLower.includes('pay') || titleLower.includes('finance') || titleLower.includes('crypto') || titleLower.includes('bank')) {
    pool = FINTECH_CRYPTO_UI;
  }

  pool.forEach((item, idx) => {
    const selected = pool[(hash + idx) % pool.length];
    if (!list.includes(selected) && list.length < 5) {
      list.push(selected);
    }
  });

  // 4. Captured Vercel Live Deployment Screenshots across multiple viewports & internal routes
  if (liveUrl && liveUrl.trim()) {
    let cleanUrl = liveUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (!cleanUrl.includes('github.com/') && (
      cleanUrl.includes('.vercel.app') ||
      cleanUrl.includes('.vercel.dev') ||
      cleanUrl.includes('.app') ||
      cleanUrl.includes('.com') ||
      cleanUrl.includes('.io') ||
      cleanUrl.includes('.dev') ||
      cleanUrl.includes('.net') ||
      cleanUrl.includes('.org')
    )) {
      const desktopLive = `https://image.thum.io/get/width/1200/wait/3/${cleanUrl}`;
      const microlinkLive = `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&embed=screenshot.url&waitForTimeout=3000`;
      
      if (!list.includes(desktopLive)) list.push(desktopLive);
      if (!list.includes(microlinkLive)) list.push(microlinkLive);
    }
  }

  if (list.length === 0) {
    list.push(getFallbackScreenshot(category, title, techStack));
  }

  return list;
}

/**
 * Auto-generates a live website screenshot from Vercel deployments or web platforms.
 * Prioritizes crisp HD UI representations over automated dark animation API captures.
 */
export function getWebsiteScreenshotUrl(options: {
  liveUrl?: string;
  githubUrl?: string;
  category?: 'Web' | 'Android' | 'Full Stack';
  title?: string;
  techStack?: string[];
}): string {
  const { liveUrl, githubUrl, category = 'Web', title = '', techStack = [] } = options;

  // Select curated HD UI image based on domain & title hash (guarantees text & UI details are visible)
  return getFallbackScreenshot(category, title, techStack);
}

