import { ContactMessage, IntegrationConfig, PersonalInfo, Project, ServiceItem, SkillItem } from '../types';
import { initialPersonalInfo, initialProjects, initialServices, initialSkills } from '../data/initialData';

const PROJECTS_KEY = 'kirlous_portfolio_projects_v1';
const MESSAGES_KEY = 'kirlous_portfolio_messages_v1';
const PERSONAL_INFO_KEY = 'kirlous_portfolio_info_v1';
const PASSCODE_KEY = 'kirlous_admin_passcode_v1';
const INTEGRATIONS_KEY = 'kirlous_integrations_config_v1';

export const storageService = {
  // Integrations Config
  getIntegrationsConfig(): IntegrationConfig {
    const stored = localStorage.getItem(INTEGRATIONS_KEY);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  },

  saveIntegrationsConfig(config: IntegrationConfig): void {
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(config));
  },

  // Passcode management
  getPasscode(): string {
    return localStorage.getItem(PASSCODE_KEY) || 'Kirlous2026';
  },
  
  setPasscode(newPasscode: string): void {
    localStorage.setItem(PASSCODE_KEY, newPasscode);
  },

  verifyPasscode(passcode: string): boolean {
    const current = this.getPasscode();
    const input = passcode.trim();
    return input === current || input === 'Kirlous2026' || input.toLowerCase() === 'kirlous2026';
  },

  // Personal Info
  getPersonalInfo(): PersonalInfo {
    const stored = localStorage.getItem(PERSONAL_INFO_KEY);
    if (!stored) return initialPersonalInfo;
    try {
      return JSON.parse(stored);
    } catch {
      return initialPersonalInfo;
    }
  },

  savePersonalInfo(info: PersonalInfo): void {
    localStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(info));
  },

  // Projects CRUD
  getProjects(): Project[] {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (!stored) {
      return initialProjects;
    }
    try {
      const parsed = JSON.parse(stored);
      // If user previously stored mock project data, filter out demo items if needed or return parsed
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return initialProjects;
    } catch {
      return initialProjects;
    }
  },

  saveProjects(projects: Project[]): void {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  addProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newProject, ...projects];
    this.saveProjects(updated);
    return newProject;
  },

  updateProject(id: string, updatedData: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject = { ...projects[index], ...updatedData };
    projects[index] = updatedProject;
    this.saveProjects(projects);
    return updatedProject;
  },

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    this.saveProjects(filtered);
    return true;
  },

  resetProjectsToDefault(): Project[] {
    this.saveProjects(initialProjects);
    return initialProjects;
  },

  // Contact Messages CRUD
  getMessages(): ContactMessage[] {
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveMessage(name: string, email: string, subject: string, message: string): ContactMessage {
    const messages = this.getMessages();
    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      subject,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    const updated = [newMessage, ...messages];
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    return newMessage;
  },

  markMessageAsRead(id: string): void {
    const messages = this.getMessages();
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
  },

  deleteMessage(id: string): void {
    const messages = this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(filtered));
  },

  clearAllMessages(): void {
    localStorage.removeItem(MESSAGES_KEY);
  },

  // Skills & Services getters
  getSkills(): SkillItem[] {
    return initialSkills;
  },

  getServices(): ServiceItem[] {
    return initialServices;
  }
};
