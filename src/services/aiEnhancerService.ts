import { AIEnhancementResponse } from '../types';
import { getWebsiteScreenshotUrl } from '../utils/screenshot';

export interface AIEnhanceInput {
  title?: string;
  description?: string;
  techStack?: string | string[];
  category?: 'Web' | 'Android' | 'Full Stack';
  githubUrl?: string;
  liveUrl?: string;
  readmeContent?: string;
}

/**
 * Client-Side Smart AI Enhancement Fallback & Enhancer
 * Produces deep, intelligent, structured portfolio metadata and screenshot URLs.
 */
export function generateClientSideAIEnhancement(input: AIEnhanceInput): AIEnhancementResponse {
  const rawTitle = (input.title || 'Portfolio App').trim();
  const category = input.category || 'Web';
  const rawDesc = (input.description || 'Modern high-performance application built with cutting-edge tools.').trim();
  const githubUrl = input.githubUrl || '';
  const liveUrl = input.liveUrl || '';
  const readme = input.readmeContent || '';

  // Parse tech stack
  let techArray: string[] = [];
  if (Array.isArray(input.techStack)) {
    techArray = input.techStack;
  } else if (typeof input.techStack === 'string' && input.techStack.trim()) {
    techArray = input.techStack.split(',').map(s => s.trim()).filter(Boolean);
  }

  // Auto-detect missing tech stack from README or Title
  if (readme) {
    const lowerReadme = readme.toLowerCase();
    const commonTech = ['TypeScript', 'React', 'Kotlin', 'Jetpack Compose', 'Node.js', 'Express', 'Tailwind CSS', 'Vite', 'Firebase', 'Next.js', 'PostgreSQL', 'Docker', 'REST API', 'GraphQL', 'Redux', 'Room DB', 'Coroutines'];
    commonTech.forEach(t => {
      if (lowerReadme.includes(t.toLowerCase()) && !techArray.some(e => e.toLowerCase() === t.toLowerCase())) {
        techArray.push(t);
      }
    });
  }

  if (techArray.length === 0) {
    if (category === 'Android') {
      techArray = ['Kotlin', 'Jetpack Compose', 'Room DB', 'Android SDK', 'Coroutines', 'Material 3'];
    } else if (category === 'Full Stack') {
      techArray = ['TypeScript', 'React', 'Node.js', 'Express', 'Tailwind CSS', 'REST API', 'Vite'];
    } else {
      techArray = ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Framer Motion'];
    }
  }

  // Generate marketing title
  const cleanTitle = rawTitle.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let autoTitle = cleanTitle;
  if (!autoTitle.toLowerCase().includes('android') && category === 'Android') {
    autoTitle = `${cleanTitle} - Native Android Platform`;
  } else if (!autoTitle.toLowerCase().includes('web') && category === 'Web' && !autoTitle.includes('-')) {
    autoTitle = `${cleanTitle} - Interactive Web Application`;
  } else if (category === 'Full Stack' && !autoTitle.includes('-')) {
    autoTitle = `${cleanTitle} - Full Stack Architecture`;
  }

  // Tailored problem & solution statement
  const problem = `Delivering a seamless, highly responsive user experience across devices while maintaining reliable real-time state synchronization and fast initial load times.`;
  const solution = `Engineered a robust, modular ${category} solution using ${techArray.slice(0, 4).join(', ')}. Implemented scalable architecture, responsive UI components, and optimized data flow.`;

  // Key Features
  const keyFeatures = [
    `Intuitive, responsive user interface built with ${techArray[0] || 'Modern UI Framework'}`,
    `Optimized data management with low latency and clean component architecture`,
    `Seamless integration with external APIs and automated state persistence`,
    `Cross-platform compatibility with high performance scoring and smooth transitions`,
  ];

  // Enhanced Short Description
  const enhancedDescription = `${cleanTitle} is a production-grade ${category.toLowerCase()} application designed for speed, fluid interactions, and scalability, built with ${techArray.slice(0, 4).join(', ')}.`;

  // Long description & Case Study
  const longDescription = `### ${autoTitle}\n\n` +
    `#### 🎯 Problem Statement\n${problem}\n\n` +
    `#### 💡 Technical Solution & Architecture\n${solution}\n\n` +
    `#### 🛠️ Technology Stack & Tools\n${techArray.map(t => `- **${t}**`).join('\n')}\n` +
    (readme ? `\n\n#### 📄 Repository README Snippet\n${readme.slice(0, 900)}...` : '');

  // Highlights
  const highlights = [
    `Architected with modular ${techArray[0] || 'TypeScript'} structure and high test coverage standards`,
    `Achieved zero layout shift and fluid 60fps animations across all screen viewports`,
    `Built production-ready deployment pipelines with automated CI/CD workflows`,
    liveUrl ? `Live production environment: ${liveUrl}` : (githubUrl ? `Open-source codebase on GitHub: ${githubUrl}` : `Fully tested & deployed application`),
  ];

  // SEO Metadata
  const seoMetadata = {
    metaTitle: `${autoTitle} | Kirlous Wael Portfolio`,
    metaDescription: enhancedDescription.slice(0, 155),
    ogTitle: autoTitle,
    ogDescription: enhancedDescription.slice(0, 155),
    ogType: 'website',
    keywords: [
      category.toLowerCase(),
      ...techArray.map(t => t.toLowerCase()),
      'kirlous wael',
      'developer portfolio',
      'full stack engineer',
      'software showcase'
    ].slice(0, 8),
  };

  // Auto Screenshot URL
  const screenshotUrl = getWebsiteScreenshotUrl({
    liveUrl,
    githubUrl,
    category,
    title: autoTitle,
    techStack: techArray,
  });

  return {
    autoTitle,
    problem,
    solution,
    keyFeatures,
    enhancedDescription,
    longDescription,
    techStack: techArray,
    highlights,
    seoMetadata,
    screenshotUrl,
  };
}

/**
 * Safely calls backend AI endpoint or falls back to client generator.
 * Guaranteed response with screenshot URL!
 */
export async function enhanceProjectWithAI(input: AIEnhanceInput): Promise<AIEnhancementResponse> {
  try {
    const res = await fetch('/api/ai/enhance-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.data) {
        // Ensure screenshotUrl is present
        if (!data.data.screenshotUrl) {
          data.data.screenshotUrl = getWebsiteScreenshotUrl({
            liveUrl: input.liveUrl,
            githubUrl: input.githubUrl,
            category: input.category,
            title: data.data.autoTitle || input.title,
            techStack: data.data.techStack || input.techStack,
          });
        }
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API endpoint unavailable or non-JSON, using Client AI generator fallback.');
  }

  // Safe fallback guarantee
  return generateClientSideAIEnhancement(input);
}

