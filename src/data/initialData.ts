import { PersonalInfo, Project, ServiceItem, SkillItem } from '../types';

export const initialPersonalInfo: PersonalInfo = {
  name: 'Kirlous Wael',
  title: 'Full Stack Web Developer & Android Developer',
  tagline: 'Crafting responsive web solutions & high-performance Android applications with modern clean architecture.',
  bio: 'Kirlous Wael is a passionate developer focused on building modern high-performance websites and Android applications. Experienced in creating responsive, scalable, and user-friendly digital solutions.',
  email: 'waelkirlous@gmail.com',
  location: 'Cairo, Egypt / Remote Worldwide',
  github: 'https://github.com/kirlouswael',
  linkedin: 'https://linkedin.com/in/kirlouswael',
  availableForWork: true,
  yearsExperience: 3,
  completedProjects: 18,
  happyClients: 15,
};

export const initialSkills: SkillItem[] = [
  // Web & Full Stack Development
  { name: 'HTML5', category: 'Web Development', level: 95, iconName: 'Code2', description: 'Semantic structure, accessibility & modern markup standards.' },
  { name: 'CSS3', category: 'Web Development', level: 90, iconName: 'Palette', description: 'Flexbox, Grid, CSS animations & custom design tokens.' },
  { name: 'JavaScript', category: 'Web Development', level: 92, iconName: 'FileCode', description: 'ES6+, Async/Await, Web APIs, DOM manipulation & state patterns.' },
  { name: 'React', category: 'Web Development', level: 90, iconName: 'Atom', description: 'Custom hooks, Context API, component design & state optimization.' },
  { name: 'Next.js', category: 'Web Development', level: 88, iconName: 'Globe', description: 'App Router, SSR, SSG, Server Actions & API routes.' },
  { name: 'Tailwind CSS', category: 'Web Development', level: 95, iconName: 'Sparkles', description: 'Utility-first design, custom configurations & responsive layouts.' },

  // Mobile & Native Engineering
  { name: 'Kotlin', category: 'Mobile Development', level: 88, iconName: 'Smartphone', description: 'Coroutines, Flow, OOP, functional patterns & Android SDK.' },
  { name: 'Jetpack Compose', category: 'Mobile Development', level: 85, iconName: 'Layout', description: 'Declarative UI, State management, Material 3 & custom animations.' },
  { name: 'Android Simulator Frame', category: 'Mobile Development', level: 90, iconName: 'Smartphone', description: 'In-browser mobile emulator for running native Compose UI apps.' },
  { name: 'SQLite / Room DB', category: 'Mobile Development', level: 82, iconName: 'Database', description: 'Room DB, local caching, indexing & relational mobile schemas.' },

  // Specialized Cloud, AI & Performance Technologies
  { name: 'Google Gemini AI Engine', category: 'Programming & Tools', level: 92, iconName: 'Sparkles', description: 'Gemini 2.5 Flash API with JSON Schema validation & multi-model fallback.' },
  { name: 'Firebase Firestore Sync', category: 'Programming & Tools', level: 90, iconName: 'Flame', description: 'Real-time cloud database sync with local cache locks & instant reactivity.' },
  { name: 'HD Screenshot & CDN Engine', category: 'Programming & Tools', level: 88, iconName: 'Globe', description: 'Automated live website screenshot generator & progressive CDN image fallback.' },
  { name: 'Git & GitHub Workflows', category: 'Programming & Tools', level: 92, iconName: 'GitBranch', description: 'CI/CD workflows, version control, branching & code review.' },
];

export const initialServices: ServiceItem[] = [
  {
    id: 'web-dev',
    title: 'Website Development',
    description: 'Modern responsive websites for businesses and individuals built with cutting-edge tech.',
    icon: 'Monitor',
    deliverables: [
      'Custom React & Next.js Web Applications',
      'Pixel-perfect responsive design across devices',
      'SEO optimization & Lighthouse performance',
      'CMS / Dynamic Admin Dashboard integration'
    ],
    popular: true
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    description: 'High-converting modern landing pages designed to showcase product value and drive action.',
    icon: 'Zap',
    deliverables: [
      'Modern hero sections with visual animations',
      'Fast loading speed (<1s load time)',
      'Lead capture forms & CRM integrations',
      'Analytics & smooth micro-interactions'
    ]
  },
  {
    id: 'android-apps',
    title: 'Android Applications',
    description: 'Custom mobile applications with modern UI, robust native performance, and offline capability.',
    icon: 'Smartphone',
    deliverables: [
      'Native Kotlin & Jetpack Compose development',
      'Material 3 design language implementation',
      'Offline-first caching with Room / SQLite',
      'Firebase auth, database & push notifications'
    ],
    popular: true
  },
  {
    id: 'fullstack-apis',
    title: 'Full Stack & APIs',
    description: 'Scalable backend API services, relational/NoSQL database management, and cloud architecture.',
    icon: 'Server',
    deliverables: [
      'RESTful & GraphQL API development',
      'Secure authentication & role-based access',
      'Database integration (Supabase, Firebase, SQL)',
      'Clean architecture & unit testing'
    ]
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Kirlous Developer Portfolio & Studio',
    description: 'Modern, high-performance portfolio platform featuring live Vercel deployments, interactive project browser, Android simulator, and AI project enhancer.',
    longDescription: '## 🚀 What is Kirlous Developer Portfolio & Studio?\nAn interactive developer portfolio built for Kirlous Wael with React, TypeScript, and Tailwind CSS. Integrated with GitHub & Vercel live APIs, local persistence, Android app simulator, and AI project analysis.\n\n## 💡 Key Architectural Highlights\n- **Real-Time Data Sync**: Firebase Firestore integration for cross-device updates.\n- **Interactive Android Simulator**: In-browser mobile device preview running Jetpack Compose UI apps.\n- **AI Assistant**: Powered by Google Gemini AI for automated project analysis and case study generation.',
    category: 'Web',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vercel', 'Node.js', 'Firebase'],
    githubUrl: 'https://github.com/kirlouswael/portfolio',
    liveUrl: 'https://kirlous-portfolio.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80'
    ],
    bestImages: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
    ],
    fitMode: 'contain',
    featured: true,
    createdAt: '2026-08-01',
    highlights: [
      '⚡ Live Vercel Production Integration & Sub-Page Menu Browser',
      '📷 Multi-Screenshot Live Gallery Carousel & Lightbox View',
      '🤖 Integrated Gemini AI Project Assistant',
      '📱 Android In-Browser Device Emulator'
    ]
  },
  {
    id: 'proj-2',
    title: 'FitPulse Android Fitness & Health Tracker',
    description: 'Native Android mobile application built with Kotlin and Jetpack Compose featuring offline Room DB and Firebase sync.',
    longDescription: '## 🚀 What is FitPulse Android?\nFitPulse is a modern Android application engineered with Kotlin, Jetpack Compose, Coroutines, and Room local SQLite database. Includes workout logging, step tracking, custom health charts, and Firebase real-time user authentication.\n\n## 💡 Mobile Architecture\n- **Declarative UI**: Built with Jetpack Compose & Material 3.\n- **Offline-First**: Powered by Room SQLite and Kotlin Flow streams.',
    category: 'Android',
    techStack: ['Kotlin', 'Jetpack Compose', 'Room DB', 'Firebase', 'Android SDK'],
    githubUrl: 'https://github.com/kirlouswael/fitpulse-android',
    liveUrl: 'https://fitpulse-app.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80'
    ],
    bestImages: [
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80'
    ],
    fitMode: 'contain',
    featured: true,
    createdAt: '2026-07-15',
    androidPackageName: 'com.kirlous.fitpulse',
    highlights: [
      '📱 Built with Native Jetpack Compose & Material 3 UI',
      '💾 100% Offline-First Architecture with Room Database',
      '🔥 Realtime Firebase Authentication & Cloud Sync',
      '📊 Interactive Health Analytics & Step Counters'
    ]
  },
  {
    id: 'proj-3',
    title: 'Nexus Analytics & E-Commerce Dashboard',
    description: 'Full-stack enterprise management dashboard with live metrics, sales analytics, and dynamic inventory system.',
    longDescription: '## 🚀 What is Nexus Analytics?\nEnterprise-grade full-stack dashboard built with Next.js, TypeScript, Express API routes, and PostgreSQL database. Provides real-time revenue analytics, order tracking, product inventory controls, and automated business reporting.',
    category: 'Full Stack',
    techStack: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    githubUrl: 'https://github.com/kirlouswael/nexus-analytics',
    liveUrl: 'https://nexus-analytics.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542744094-3a31b272c390?auto=format&fit=crop&w=1200&q=80'
    ],
    bestImages: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ],
    fitMode: 'contain',
    featured: true,
    createdAt: '2026-06-20',
    highlights: [
      '📈 Real-time Analytics & KPI Performance Visualizations',
      '🔐 Secure Role-based JWT Authentication',
      '⚡ Express & PostgreSQL High-Performance API',
      '📷 Full Screen Lightbox & Responsive Screenshot Gallery'
    ]
  },
  {
    id: 'proj-4',
    title: 'Nile Store - E-Commerce Engine & Merchant Portal',
    description: 'High-converting digital storefront with instant category search, optimistic shopping cart, and multi-currency checkout.',
    longDescription: '## 🚀 What is Nile Store?\nNile Store is a modern e-commerce application featuring an intuitive storefront, real-time product filtering, persistent shopping cart state, and a merchant admin portal for managing product inventories and promotional campaigns.',
    category: 'Web',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'REST API'],
    githubUrl: 'https://github.com/kirlouswael/nile-store',
    liveUrl: 'https://nile-store.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80'
    ],
    bestImages: [
      'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80'
    ],
    fitMode: 'contain',
    featured: false,
    createdAt: '2026-05-10',
    highlights: [
      '🛒 Optimistic Shopping Cart with Instant Price Calculations',
      '🔍 Real-Time Product Catalog Filter & Search Indexing',
      '💳 Secure Multi-Step Checkout Workflow',
      '📱 Responsive Design Across Desktop & Mobile Viewports'
    ]
  },
  {
    id: 'proj-5',
    title: 'MindGenius - Gemini AI Task & Knowledge Assistant',
    description: 'Intelligent AI workspace powered by Google Gemini API providing automated content summarization and structured code analysis.',
    longDescription: '## 🚀 What is MindGenius?\nMindGenius is a generative AI companion built with Google Gemini 2.5 Flash. It provides structured JSON reasoning, markdown document generation, live code snippet execution analysis, and contextual conversation memory.',
    category: 'Full Stack',
    techStack: ['React', 'TypeScript', 'Node.js', 'Google Gemini API', 'Tailwind CSS'],
    githubUrl: 'https://github.com/kirlouswael/mindgenius-ai',
    liveUrl: 'https://mindgenius-ai.vercel.app',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80'
    ],
    bestImages: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80'
    ],
    fitMode: 'contain',
    featured: true,
    createdAt: '2026-04-18',
    highlights: [
      '🤖 Powered by Google Gemini AI API with JSON Schema Validation',
      '⚡ Real-time Markdown Streaming & Syntax Highlighting',
      '🧠 Contextual Memory Buffer for Multi-Turn AI Reasoning',
      '🎨 Custom Dark Theme UI with Glassmorphism Accents'
    ]
  }
];

