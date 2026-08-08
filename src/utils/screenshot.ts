/**
 * Auto-generates high-definition, domain-specific UI screenshots
 * and live website previews without code editors or 404 error pages.
 */

// Curated UI Screenshot Pools - Strictly modern application interfaces (NO code editors or syntax screens)
const MOBILE_ANDROID_UI = [
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80', // Android Native UI
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80', // Smartphone App Dashboard
  'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80', // Mobile Tracking Screen
  'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80', // Android Device App Interface
];

const DASHBOARD_ANALYTICS_UI = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // Modern Analytics Dashboard
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', // Web Analytics & KPI Charts
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80', // Data Analysis Suite
  'https://images.unsplash.com/photo-1542744094-3a31b272c390?auto=format&fit=crop&w=1200&q=80', // Executive Management Platform
];

const ECOMMERCE_SHOPPING_UI = [
  'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80', // E-Commerce Checkout UI
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80', // Online Storefront
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', // Digital Fashion & Shopping UI
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80', // Retail Web Catalog
];

const AI_GENAI_UI = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Neural AI Interface
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80', // AI Platform Workspace
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80', // Smart Intelligent Studio
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Generative AI Screen
];

const SAAS_WEB_PLATFORM_UI = [
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', // SaaS Web App Landing UI
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', // Modern Web Platform
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80', // Product Design UI
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', // Web Studio Layout
];

const FINTECH_CRYPTO_UI = [
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', // Finance & Trading UI
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', // Crypto & Digital Wallet Dashboard
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', // Banking Mobile Screen
];

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
 * Auto-generates a live website screenshot or domain-matched HD UI mockup
 */
export function getWebsiteScreenshotUrl(options: {
  liveUrl?: string;
  githubUrl?: string;
  category?: 'Web' | 'Android' | 'Full Stack';
  title?: string;
  techStack?: string[];
}): string {
  const { liveUrl, githubUrl, category = 'Web', title = '', techStack = [] } = options;

  // 1. Live Website Screenshot ONLY if liveUrl is a explicit deployed production web URL
  if (liveUrl && liveUrl.trim().startsWith('http')) {
    const cleanUrl = liveUrl.trim();
    // Verify it's not a github repository URL or non-web link
    if (!cleanUrl.includes('github.com/') && (cleanUrl.includes('.app') || cleanUrl.includes('.com') || cleanUrl.includes('.io') || cleanUrl.includes('.dev') || cleanUrl.includes('.net') || cleanUrl.includes('.org'))) {
      return `https://image.thum.io/get/width/1200/crop/800/noanimate/${cleanUrl}`;
    }
  }

  // 2. Select curated HD UI image based on domain & title hash
  const titleLower = title.toLowerCase();
  const stackStr = (Array.isArray(techStack) ? techStack.join(' ') : String(techStack)).toLowerCase();
  const seedString = `${titleLower}_${githubUrl || ''}_${category}`;
  const hash = getDeterministicHash(seedString);

  // Android / Mobile App domain
  if (category === 'Android' || titleLower.includes('android') || stackStr.includes('kotlin') || stackStr.includes('jetpack') || stackStr.includes('flutter')) {
    return MOBILE_ANDROID_UI[hash % MOBILE_ANDROID_UI.length];
  }

  // AI & Smart Tools domain
  if (titleLower.includes('ai') || titleLower.includes('gpt') || titleLower.includes('gemini') || titleLower.includes('bot') || titleLower.includes('smart') || stackStr.includes('gemini') || stackStr.includes('openai')) {
    return AI_GENAI_UI[hash % AI_GENAI_UI.length];
  }

  // E-Commerce / Store domain
  if (titleLower.includes('shop') || titleLower.includes('store') || titleLower.includes('e-commerce') || titleLower.includes('ecommerce') || titleLower.includes('nile') || titleLower.includes('cart') || titleLower.includes('market')) {
    return ECOMMERCE_SHOPPING_UI[hash % ECOMMERCE_SHOPPING_UI.length];
  }

  // Analytics & Dashboard / Admin domain
  if (titleLower.includes('dashboard') || titleLower.includes('admin') || titleLower.includes('analytics') || titleLower.includes('metrics') || titleLower.includes('manager') || category === 'Full Stack') {
    return DASHBOARD_ANALYTICS_UI[hash % DASHBOARD_ANALYTICS_UI.length];
  }

  // Fintech & Finance domain
  if (titleLower.includes('pay') || titleLower.includes('finance') || titleLower.includes('crypto') || titleLower.includes('bank') || titleLower.includes('wallet') || titleLower.includes('budget')) {
    return FINTECH_CRYPTO_UI[hash % FINTECH_CRYPTO_UI.length];
  }

  // General SaaS & Web Platform UI domain
  return SAAS_WEB_PLATFORM_UI[hash % SAAS_WEB_PLATFORM_UI.length];
}
