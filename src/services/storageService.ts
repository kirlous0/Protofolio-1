import { ContactMessage, IntegrationConfig, PersonalInfo, Project, ServiceItem, SkillItem } from '../types';
import { initialPersonalInfo, initialProjects, initialServices, initialSkills } from '../data/initialData';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const PROJECTS_KEY = 'kirlous_portfolio_projects_v1';
const MESSAGES_KEY = 'kirlous_portfolio_messages_v1';
const PERSONAL_INFO_KEY = 'kirlous_portfolio_info_v1';
const PASSCODE_KEY = 'kirlous_admin_passcode_v1';
const INTEGRATIONS_KEY = 'kirlous_integrations_config_v1';

export const storageService = {
  // Sync with Firebase Firestore across browsers & devices
  async syncWithServer(): Promise<{ projects: Project[]; personalInfo: PersonalInfo; messages: ContactMessage[] }> {
    let syncedProjects: Project[] | null = null;
    let syncedInfo: PersonalInfo | null = null;
    let syncedMessages: ContactMessage[] | null = null;

    // 1. Try syncing from Firebase Firestore first
    try {
      if (db) {
        // Fetch Projects
        const projectsSnap = await getDocs(collection(db, 'projects'));
        if (!projectsSnap.empty) {
          syncedProjects = projectsSnap.docs.map(d => ({ ...d.data() } as Project));
        } else {
          // First time seeding Firestore with initial projects
          const batch = writeBatch(db);
          initialProjects.forEach(p => {
            const ref = doc(db, 'projects', p.id);
            batch.set(ref, p);
          });
          await batch.commit();
          syncedProjects = initialProjects;
        }

        // Fetch Personal Info
        const infoDocSnap = await getDoc(doc(db, 'personalInfo', 'main'));
        if (infoDocSnap.exists()) {
          syncedInfo = infoDocSnap.data() as PersonalInfo;
        } else {
          await setDoc(doc(db, 'personalInfo', 'main'), initialPersonalInfo);
          syncedInfo = initialPersonalInfo;
        }

        // Fetch Messages
        const msgSnap = await getDocs(collection(db, 'messages'));
        if (!msgSnap.empty) {
          syncedMessages = msgSnap.docs.map(d => ({ ...d.data() } as ContactMessage));
          syncedMessages.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        }
      }
    } catch (e) {
      console.warn('Firestore fetch encountered an issue, falling back to local server/localStorage:', e);
    }

    // Update localStorage if Firestore returned valid data
    if (syncedProjects && syncedProjects.length > 0) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(syncedProjects));
    }
    if (syncedInfo) {
      localStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(syncedInfo));
    }
    if (syncedMessages) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(syncedMessages));
    }

    // 2. Fallback check from Express server endpoints if Firestore didn't produce data
    if (!syncedProjects || syncedProjects.length === 0) {
      try {
        const [projRes, infoRes, msgRes] = await Promise.allSettled([
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/personal-info').then(r => r.json()),
          fetch('/api/messages').then(r => r.json()),
        ]);

        if (projRes.status === 'fulfilled' && projRes.value?.success && Array.isArray(projRes.value?.projects) && projRes.value.projects.length > 0) {
          syncedProjects = projRes.value.projects;
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(syncedProjects));
        }
        if (infoRes.status === 'fulfilled' && infoRes.value?.success && infoRes.value?.personalInfo) {
          syncedInfo = infoRes.value.personalInfo;
          localStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(syncedInfo));
        }
        if (msgRes.status === 'fulfilled' && msgRes.value?.success && Array.isArray(msgRes.value?.messages)) {
          syncedMessages = msgRes.value.messages;
          localStorage.setItem(MESSAGES_KEY, JSON.stringify(syncedMessages));
        }
      } catch (err) {
        console.warn('API endpoint sync failed:', err);
      }
    }

    return {
      projects: syncedProjects || this.getProjects(),
      personalInfo: syncedInfo || this.getPersonalInfo(),
      messages: syncedMessages || this.getMessages(),
    };
  },

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
    if (db) {
      setDoc(doc(db, 'integrations', 'main'), config).catch(() => {});
    }
    fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    }).catch(() => {});
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
    if (db) {
      setDoc(doc(db, 'personalInfo', 'main'), info).catch(() => {});
    }
    fetch('/api/personal-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ info }),
    }).catch(() => {});
  },

  // Projects CRUD
  getProjects(): Project[] {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (!stored) {
      return initialProjects;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return initialProjects;
    } catch {
      return initialProjects;
    }
  },

  saveProjects(projects: Project[]): void {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    if (db) {
      const batch = writeBatch(db);
      projects.forEach(p => {
        const ref = doc(db, 'projects', p.id);
        batch.set(ref, p);
      });
      batch.commit().catch(() => {});
    }
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects }),
    }).catch(() => {});
  },

  addProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const id = `proj-${Date.now()}`;
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newProject, ...projects];
    this.saveProjects(updated);
    if (db) {
      setDoc(doc(db, 'projects', id), newProject).catch(() => {});
    }
    return newProject;
  },

  updateProject(id: string, updatedData: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject = { ...projects[index], ...updatedData };
    projects[index] = updatedProject;
    this.saveProjects(projects);
    if (db) {
      setDoc(doc(db, 'projects', id), updatedProject, { merge: true }).catch(() => {});
    }
    return updatedProject;
  },

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    this.saveProjects(filtered);
    if (db) {
      deleteDoc(doc(db, 'projects', id)).catch(() => {});
    }
    return true;
  },

  resetProjectsToDefault(): Project[] {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
    if (db) {
      const batch = writeBatch(db);
      initialProjects.forEach(p => {
        const ref = doc(db, 'projects', p.id);
        batch.set(ref, p);
      });
      batch.commit().catch(() => {});
    }
    fetch('/api/projects/reset', { method: 'POST' }).catch(() => {});
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

  saveMessagesArray(messages: ContactMessage[]): void {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    }).catch(() => {});
  },

  saveMessage(name: string, email: string, subject: string, message: string): ContactMessage {
    const messages = this.getMessages();
    const id = `msg-${Date.now()}`;
    const newMessage: ContactMessage = {
      id,
      name,
      email,
      subject,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    const updated = [newMessage, ...messages];
    this.saveMessagesArray(updated);
    if (db) {
      setDoc(doc(db, 'messages', id), newMessage).catch(() => {});
    }
    return newMessage;
  },

  markMessageAsRead(id: string): void {
    const messages = this.getMessages();
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    this.saveMessagesArray(updated);
    if (db) {
      setDoc(doc(db, 'messages', id), { read: true }, { merge: true }).catch(() => {});
    }
  },

  deleteMessage(id: string): void {
    const messages = this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    this.saveMessagesArray(filtered);
    if (db) {
      deleteDoc(doc(db, 'messages', id)).catch(() => {});
    }
  },

  clearAllMessages(): void {
    const messages = this.getMessages();
    localStorage.removeItem(MESSAGES_KEY);
    if (db) {
      const batch = writeBatch(db);
      messages.forEach(m => {
        const ref = doc(db, 'messages', m.id);
        batch.delete(ref);
      });
      batch.commit().catch(() => {});
    }
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    }).catch(() => {});
  },

  // Skills & Services getters
  getSkills(): SkillItem[] {
    return initialSkills;
  },

  getServices(): ServiceItem[] {
    return initialServices;
  }
};

