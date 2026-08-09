import { AIEnhancementResponse } from '../types';
import { getWebsiteScreenshotUrl, getProjectScreenshots } from '../utils/screenshot';

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

  // Domain-specific tailored problem, solution, features, and description generation
  const lowerTitle = cleanTitle.toLowerCase();
  const lowerReadme = readme.toLowerCase();
  const lowerRawDesc = rawDesc.toLowerCase();
  const stackSummary = techArray.slice(0, 4).join(', ');

  // Dynamic project description builder based on title, description & stack
  let domainConcept = rawDesc && !rawDesc.includes('cutting-edge') && !rawDesc.includes('Modern high-performance application')
    ? `${cleanTitle} is a ${category.toLowerCase()} project built with ${stackSummary}. ${rawDesc}`
    : `${cleanTitle} is a specialized ${category.toLowerCase()} application engineered using ${stackSummary} to streamline ${cleanTitle.toLowerCase()} workflows, deliver responsive user interactions, and ensure reliable data management.`;

  let domainProblem = `Developers and users need a responsive, reliable ${category.toLowerCase()} interface for ${cleanTitle} without performance lag, state inconsistencies, or complex setup hurdles.`;
  let domainSolution = `Architected a modern ${category} solution using ${stackSummary} with optimized component hierarchies, clean architecture patterns, and seamless data binding.`;

  let domainFeatures = [
    `Interactive, responsive user interface built with ${techArray[0] || 'Modern Tech Stack'} for a smooth multi-device experience`,
    `Optimized state management and efficient data workflows tailored specifically for ${cleanTitle}`,
    `Robust error handling, clean component design, and scalable code organization`,
    `Performance-first engineering with instant reactivity and low memory overhead`,
  ];

  if (lowerTitle.includes('shop') || lowerTitle.includes('store') || lowerTitle.includes('e-commerce') || lowerTitle.includes('nile') || lowerReadme.includes('cart') || lowerRawDesc.includes('e-commerce')) {
    domainConcept = `${cleanTitle} is a modern, scalable e-commerce digital storefront enabling seamless product browsing, shopping cart management, secure checkout workflows, and administrative product control.`;
    domainProblem = `Online shoppers demand instantaneous page load times, friction-free shopping cart updates, and reliable order state tracking without complex checkout hurdles.`;
    domainSolution = `Architected a high-converting digital storefront using ${stackSummary} featuring optimistic UI cart updates, dynamic product filtering, and scalable state persistence.`;
    domainFeatures = [
      `Dynamic product catalog with instant category filtering and real-time search indexing`,
      `Interactive shopping cart with optimistic state updates and persistent item storage`,
      `Secure multi-step checkout workflow with order summary and transaction verification`,
      `Merchant admin suite for managing inventory, pricing tiers, and promotional banners`,
    ];
  } else if (lowerTitle.includes('ai') || lowerTitle.includes('gpt') || lowerTitle.includes('gemini') || lowerTitle.includes('bot') || lowerTitle.includes('smart') || lowerReadme.includes('model') || lowerReadme.includes('prompt')) {
    domainConcept = `${cleanTitle} is an intelligent AI-powered platform leveraging state-of-the-art generative language and vision models to automate complex creative and analytical workflows.`;
    domainProblem = `Users need rapid, contextual access to AI reasoning without dealing with raw API parameters, unformatted outputs, or slow streaming response times.`;
    domainSolution = `Integrated Google Gemini AI APIs with structured JSON output schemas, real-time response streaming, and contextual memory management.`;
    domainFeatures = [
      `Real-time AI response streaming with markdown formatting and syntax highlighting`,
      `Contextual memory buffer retaining conversation history for multi-turn interactions`,
      `Structured JSON schema generation for automated data extraction and classification`,
      `Customizable system prompts and temperature parameters for targeted domain tasks`,
    ];
  } else if (lowerTitle.includes('dashboard') || lowerTitle.includes('admin') || lowerTitle.includes('analytics') || lowerTitle.includes('metrics') || lowerReadme.includes('chart')) {
    domainConcept = `${cleanTitle} is a comprehensive analytics and management dashboard offering real-time data visualization, KPI tracking, and administrative control tools.`;
    domainProblem = `Consolidating disparate data feeds into a clear, performant executive dashboard without causing visual clutter or rendering bottlenecks.`;
    domainSolution = `Built an interactive control panel using ${stackSummary} with memoized chart components, dynamic metric filters, and dark mode theme switching.`;
    domainFeatures = [
      `Interactive data visualization charts with customizable date range filters`,
      `Real-time KPI metrics panel tracking active sessions, conversion rates, and revenue`,
      `Role-based user management and activity audit logging`,
      `Exportable reports in PDF and CSV formats for offline business analysis`,
    ];
  } else if (category === 'Android' || lowerTitle.includes('android') || techArray.includes('Kotlin')) {
    domainConcept = `${cleanTitle} is a native Android application built with Jetpack Compose and Material 3 design guidelines, prioritizing high performance and offline-first data reliability.`;
    domainProblem = `Mobile users expect smooth 60fps animations, minimal battery drain, and full offline accessibility regardless of network connectivity fluctuations.`;
    domainSolution = `Developed a native Android application using Kotlin, Room DB for local caching, Coroutines for asynchronous work, and Jetpack Compose for declarative UI rendering.`;
    domainFeatures = [
      `Declarative UI components built with Jetpack Compose and Material 3 design tokens`,
      `Offline-first architecture powered by Room SQLite database and Flow state streams`,
      `Asynchronous background processing using Kotlin Coroutines and WorkManager`,
      `Optimized memory consumption and battery efficiency under heavy workload`,
    ];
  } else if (lowerTitle.includes('portfolio') || lowerTitle.includes('studio') || lowerTitle.includes('resume')) {
    domainConcept = `${cleanTitle} is an interactive developer portfolio platform showcasing live web apps, full-stack architectures, and native Android applications with real-time database sync and interactive simulators.`;
    domainProblem = `Engineers need a modern, dynamic showcase that goes beyond static text, displaying live deployment previews, interactive device emulators, and dynamic admin controls.`;
    domainSolution = `Engineered a full-featured portfolio with React, TypeScript, Tailwind CSS, Firebase Firestore sync, and an embedded Android simulator.`;
    domainFeatures = [
      `Dynamic project filtering and search indexing across Web, Android, and Full Stack categories`,
      `Interactive project modals with multi-screenshot lightboxes and live embedded browser frames`,
      `Admin control panel for live project management, skill editing, and message tracking`,
      `Firebase Firestore database integration for seamless cross-device data synchronization`,
    ];
  }

  // Enhanced Short Description
  const enhancedDescription = domainConcept;

  // Long description & Technical Case Study
  const longDescription = `## 🚀 What is ${autoTitle}?\n` +
    `${domainConcept}\n\n` +
    `## 💡 The Engineering Challenge & Solution\n` +
    `**Problem:** ${domainProblem}\n\n` +
    `**Solution:** ${domainSolution}\n\n` +
    `## ✨ Core Features & Key Capabilities\n` +
    domainFeatures.map(f => `- ${f}`).join('\n') + `\n\n` +
    `## 🛠️ Technology Stack & Architectural Rationale\n` +
    techArray.map(t => `- **${t}**: Selected for optimal performance, developer experience, and maintainability.`).join('\n') + `\n\n` +
    (readme ? `## 📄 Repository README Snippet\n\`\`\`markdown\n${readme.slice(0, 1000)}...\n\`\`\`\n` : '');

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

  // Auto Screenshots Array
  const screenshotUrl = getWebsiteScreenshotUrl({
    liveUrl,
    githubUrl,
    category,
    title: autoTitle,
    techStack: techArray,
  });

  const images = getProjectScreenshots({
    liveUrl,
    githubUrl,
    category,
    title: autoTitle,
    techStack: techArray,
    imageUrl: screenshotUrl,
  });

  return {
    autoTitle,
    problem: domainProblem,
    solution: domainSolution,
    keyFeatures: domainFeatures,
    enhancedDescription,
    longDescription,
    techStack: techArray,
    highlights,
    seoMetadata,
    screenshotUrl,
    images,
  };
}

/**
 * Safely calls backend AI endpoint or falls back to client generator.
 * Guaranteed response with screenshot URL and image gallery!
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
        // Ensure screenshotUrl & images are present
        if (!data.data.screenshotUrl) {
          data.data.screenshotUrl = getWebsiteScreenshotUrl({
            liveUrl: input.liveUrl,
            githubUrl: input.githubUrl,
            category: input.category,
            title: data.data.autoTitle || input.title,
            techStack: data.data.techStack || input.techStack,
          });
        }
        if (!data.data.images || data.data.images.length === 0) {
          data.data.images = getProjectScreenshots({
            liveUrl: input.liveUrl,
            githubUrl: input.githubUrl,
            category: input.category,
            title: data.data.autoTitle || input.title,
            techStack: data.data.techStack || input.techStack,
            imageUrl: data.data.screenshotUrl,
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

