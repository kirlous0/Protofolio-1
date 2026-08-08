export type ProjectCategory = 'Web' | 'Android' | 'Full Stack' | 'All';

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  keywords: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: 'Web' | 'Android' | 'Full Stack';
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
  highlights?: string[];
  androidPackageName?: string;
  seoMetadata?: SEOMetadata;
  isDraft?: boolean;
}

export interface IntegrationConfig {
  githubToken?: string;
  vercelToken?: string;
  vercelTeamId?: string;
  autoSyncRepos?: boolean;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  topics?: string[];
  homepage?: string | null;
}

export interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  state: string;
  createdAt: number;
  creator?: { username: string };
}

export interface VercelProjectItem {
  id: string;
  name: string;
  framework?: string | null;
  updatedAt: number;
  latestDeployments?: VercelDeployment[];
  link?: {
    type: string;
    repo: string;
  };
  targets?: {
    production?: {
      url: string;
    };
  };
}

export interface AIEnhancementResponse {
  autoTitle: string;
  problem: string;
  solution: string;
  keyFeatures: string[];
  enhancedDescription: string;
  longDescription: string;
  techStack: string[];
  highlights: string[];
  seoMetadata: SEOMetadata;
}

export interface SkillItem {
  name: string;
  category: 'Web Development' | 'Mobile Development' | 'Programming & Tools';
  level: number; // 0 to 100
  iconName: string;
  description?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  deliverables: string[];
  popular?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  replied?: boolean;
}

export interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  availableForWork: boolean;
  yearsExperience: number;
  completedProjects: number;
  happyClients: number;
}
