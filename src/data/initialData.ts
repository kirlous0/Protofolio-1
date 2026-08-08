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
  // Web Development
  { name: 'HTML5', category: 'Web Development', level: 95, iconName: 'Code2', description: 'Semantic structure, accessibility & modern markup standards.' },
  { name: 'CSS3', category: 'Web Development', level: 90, iconName: 'Palette', description: 'Flexbox, Grid, CSS animations & custom design tokens.' },
  { name: 'JavaScript', category: 'Web Development', level: 92, iconName: 'FileCode', description: 'ES6+, Async/Await, Web APIs, DOM manipulation & state patterns.' },
  { name: 'React', category: 'Web Development', level: 90, iconName: 'Atom', description: 'Custom hooks, Context API, component design & state optimization.' },
  { name: 'Next.js', category: 'Web Development', level: 88, iconName: 'Globe', description: 'App Router, SSR, SSG, Server Actions & API routes.' },
  { name: 'Tailwind CSS', category: 'Web Development', level: 95, iconName: 'Sparkles', description: 'Utility-first design, custom configurations & responsive layouts.' },

  // Mobile Development
  { name: 'Kotlin', category: 'Mobile Development', level: 88, iconName: 'Smartphone', description: 'Coroutines, Flow, OOP, functional patterns & Android SDK.' },
  { name: 'Jetpack Compose', category: 'Mobile Development', level: 85, iconName: 'Layout', description: 'Declarative UI, State management, Material 3 & custom animations.' },
  { name: 'Firebase', category: 'Mobile Development', level: 85, iconName: 'Flame', description: 'Firestore, Authentication, Cloud Storage & Realtime DB.' },
  { name: 'SQLite', category: 'Mobile Development', level: 82, iconName: 'Database', description: 'Room DB, local caching, indexing & relational mobile schemas.' },

  // Programming & Tools
  { name: 'Python', category: 'Programming & Tools', level: 80, iconName: 'Terminal', description: 'Automation scripts, REST APIs & backend utilities.' },
  { name: 'Git', category: 'Programming & Tools', level: 90, iconName: 'GitBranch', description: 'Version control, branching strategies, rebasing & merge workflows.' },
  { name: 'GitHub', category: 'Programming & Tools', level: 92, iconName: 'Github', description: 'CI/CD workflows, issue tracking, actions & code review.' },
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

export const initialProjects: Project[] = [];

