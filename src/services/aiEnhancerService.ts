import { AIEnhancementResponse } from './types';

export interface AIEnhanceInput {
  title?: string;
  description?: string;
  techStack?: string | string[];
  category?: 'Web' | 'Android' | 'Full Stack';
  githubUrl?: string;
  readmeContent?: string;
}

/**
 * Client-Side Smart AI Enhancement Fallback Generator
 * Produces structured, high-converting portfolio metadata even when static hosting
 * lacks a Node backend API or GEMINI_API_KEY environment variable.
 */
export function generateClientSideAIEnhancement(input: AIEnhanceInput): AIEnhancementResponse {
  const rawTitle = (input.title || 'Portfolio App').trim();
  const category = input.category || 'Web';
  const rawDesc = (input.description || 'Modern full stack application built with cutting edge tools.').trim();
  const githubUrl = input.githubUrl || '';
  const readme = input.readmeContent || '';

  // Parse tech stack
  let techArray: string[] = [];
  if (Array.isArray(input.techStack)) {
    techArray = input.techStack;
  } else if (typeof input.techStack === 'string' && input.techStack.trim()) {
    techArray = input.techStack.split(',').map(s => s.trim()).filter(Boolean);
  }

  if (techArray.length === 0) {
    if (category === 'Android') {
      techArray = ['Kotlin', 'Jetpack Compose', 'Room DB', 'Android SDK', 'Coroutines'];
    } else if (category === 'Full Stack') {
      techArray = ['TypeScript', 'React', 'Node.js', 'Express', 'Tailwind CSS', 'REST API'];
    } else {
      techArray = ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Framer Motion'];
    }
  }

  // Generate marketing title
  const cleanTitle = rawTitle.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let autoTitle = cleanTitle;
  if (!autoTitle.toLowerCase().includes('android') && category === 'Android') {
    autoTitle = `${cleanTitle} - Native Android Application`;
  } else if (!autoTitle.toLowerCase().includes('web') && category === 'Web') {
    autoTitle = `${cleanTitle} - Modern Web Platform`;
  } else if (category === 'Full Stack' && !autoTitle.includes('-')) {
    autoTitle = `${cleanTitle} - Full Stack Application`;
  }

  // Derive problem & solution
  const problem = `Managing complex user requirements and maintaining real-time performance without sacrificing UI fluid dynamics or data persistence.`;
  const solution = `Engineered a modular ${category} architecture leveraging ${techArray.slice(0, 3).join(', ')} with optimized state management and offline-first capabilities.`;

  // Enhanced Short Description
  const enhancedDescription = `${cleanTitle} is a ${category.toLowerCase()} application designed for high performance and seamless user experience, built using ${techArray.slice(0, 4).join(', ')}.`;

  // Long description & Case Study
  const longDescription = `### ${autoTitle}\n\n` +
    `#### 🎯 Problem Statement\n${problem}\n\n` +
    `#### 💡 Technical Solution & Architecture\n${solution}\n\n` +
    `#### 🛠️ Technology Stack & Tools\n${techArray.map(t => `- **${t}**`).join('\n')}\n` +
    (readme ? `\n\n#### 📄 Repository README Overview\n${readme.slice(0, 800)}...` : '');

  // Highlights
  const highlights = [
    `Architected with modular ${techArray[0] || 'TypeScript'} component structure and responsive design`,
    `Optimized rendering performance with clean state management and zero layout shifts`,
    `Integrated real-time interactions, custom UI controls, and theme modes`,
    githubUrl ? `Direct GitHub integration: ${githubUrl}` : `Production ready deployment with CI/CD optimization`,
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
      'full stack',
      'software engineer'
    ].slice(0, 8),
  };

  return {
    autoTitle,
    enhancedDescription,
    longDescription,
    problem,
    solution,
    techStack: techArray,
    highlights,
    seoMetadata,
  };
}

/**
 * Safely calls backend AI endpoint or falls back to client generator.
 * NEVER throws JSON parse error!
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
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API endpoint unavailable or non-JSON, using Client AI generator fallback.');
  }

  // Safe fallback guarantee
  return generateClientSideAIEnhancement(input);
}
