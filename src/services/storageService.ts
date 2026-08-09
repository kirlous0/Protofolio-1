import { ContactMessage, IntegrationConfig, PersonalInfo, Project, ServiceItem, SkillItem } from '../types';
import { initialPersonalInfo, initialProjects, initialServices, initialSkills } from '../data/initialData';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const PROJECTS_KEY = 'kirlous_portfolio_projects_v1';
const MESSAGES_KEY = 'kirlous_portfolio_messages_v1';
const PERSONAL_INFO_KEY = 'kirlous_portfolio_info_v1';
const PASSCODE_KEY = 'kirlous_admin_passcode_v1';
const INTEGRATIONS_KEY = 'kirlous_integrations_config_v1';
const SEEDED_KEY = 'kirlous_projects_seeded_v1';

function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Firestore timeout')), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

let lastLocalModificationTime = 0;

export const storageService = {
  // Sync with Firebase Firestore across browsers & devices
  async syncWithServer(): Promise<{ projects: Project[]; personalInfo: PersonalInfo; messages: ContactMessage[] }> {
    // If a local modification (add/edit/delete/wipe) happened within the last 10s, don't overwrite local storage with remote data
    if (Date.now() - lastLocalModificationTime < 10000) {
      return {
        projects: this.getProjects(),
        personalInfo: this.getPersonalInfo(),
        messages: this.getMessages(),
      };
    }

    let syncedProjects: Project[] | null = null;
    let syncedInfo: PersonalInfo | null = null;
    let syncedMessages: ContactMessage[] | null = null;

    // 1. Try syncing from Firebase Firestore first (with 3 second timeout for network resilience)
    try {
      if (db) {
        await withTimeout((async () => {
          // Check system status doc to see if database was initialized before
          const systemDocRef = doc(db, 'system', 'status');
          const systemSnap = await getDoc(systemDocRef);

          if (systemSnap.exists()) {
            // Database was already seeded. Trust whatever documents are in 'projects' collection (even if empty/0 items).
            const projectsSnap = await getDocs(collection(db, 'projects'));
            syncedProjects = projectsSnap.docs.map(d => ({ ...d.data() } as Project));
          } else {
            // First time seeding Firestore with initial default projects
            const batch = writeBatch(db);
            initialProjects.forEach(p => {
              const ref = doc(db, 'projects', p.id);
              batch.set(ref, p);
            });
            batch.set(systemDocRef, { seeded: true, createdAt: new Date().toISOString() });
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
          } else {
            syncedMessages = [];
          }
        })(), 3000);
      }
    } catch (e) {
      console.warn('Firestore fetch encountered an issue or timeout, falling back to local server/localStorage:', e);
    }

    // Check again if local modification happened during network wait
    if (Date.now() - lastLocalModificationTime < 10000) {
      return {
        projects: this.getProjects(),
        personalInfo: this.getPersonalInfo(),
        messages: this.getMessages(),
      };
    }

    // Update localStorage if Firestore sync succeeded
    if (syncedProjects !== null) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(syncedProjects));
      localStorage.setItem(SEEDED_KEY, 'true');
    }
    if (syncedInfo !== null) {
      localStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(syncedInfo));
    }
    if (syncedMessages !== null) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(syncedMessages));
    }

    // 2. Fallback check from Express server endpoints if Firestore did not respond
    if (syncedProjects === null) {
      try {
        const [projRes, infoRes, msgRes] = await Promise.allSettled([
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/personal-info').then(r => r.json()),
          fetch('/api/messages').then(r => r.json()),
        ]);

        if (projRes.status === 'fulfilled' && projRes.value?.success && Array.isArray(projRes.value?.projects)) {
          syncedProjects = projRes.value.projects;
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(syncedProjects));
          localStorage.setItem(SEEDED_KEY, 'true');
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
      projects: syncedProjects !== null ? syncedProjects : this.getProjects(),
      personalInfo: syncedInfo !== null ? syncedInfo : this.getPersonalInfo(),
      messages: syncedMessages !== null ? syncedMessages : this.getMessages(),
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
    lastLocalModificationTime = Date.now();
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
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Ensure any project with boilerplate generic description gets upgraded to bespoke description
          let changed = false;
          const updated = parsed.map((p: Project) => {
            if (p.description && (p.description.includes('Modern application built with cutting-edge') || p.description.includes('Modern high-performance application'))) {
              const matchedInit = initialProjects.find(i => i.id === p.id);
              if (matchedInit) {
                changed = true;
                return {
                  ...p,
                  description: matchedInit.description,
                  longDescription: matchedInit.longDescription,
                };
              }
            }
            return p;
          });

          if (changed) {
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
          }

          return updated;
        }
      } catch {
        // Fall through
      }
    }

    // Default seed only if key never existed in localStorage
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
    localStorage.setItem(SEEDED_KEY, 'true');
    return initialProjects;
  },

  saveProjects(projects: Project[]): void {
    lastLocalModificationTime = Date.now();
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    localStorage.setItem(SEEDED_KEY, 'true');

    if (db) {
      // Sync complete projects list with Firestore
      (async () => {
        try {
          const systemDocRef = doc(db, 'system', 'status');
          const projectsSnap = await getDocs(collection(db, 'projects'));
          const existingDocIds = new Set(projectsSnap.docs.map(d => d.id));
          const newDocIds = new Set(projects.map(p => p.id));

          const batch = writeBatch(db);

          // Delete docs in Firestore that are no longer in projects array
          existingDocIds.forEach(id => {
            if (!newDocIds.has(id)) {
              batch.delete(doc(db, 'projects', id));
            }
          });

          // Set all projects in projects array
          projects.forEach(p => {
            batch.set(doc(db, 'projects', p.id), p);
          });

          batch.set(systemDocRef, { seeded: true, updatedAt: new Date().toISOString() });
          await batch.commit();
        } catch (err) {
          console.error('Error syncing projects to Firestore:', err);
        }
      })();
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
    lastLocalModificationTime = Date.now();
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    this.saveProjects(filtered);
    return true;
  },

  toggleLikeProject(id: string): { updatedProject: Project | null; projects: Project[] } {
    lastLocalModificationTime = Date.now();
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return { updatedProject: null, projects };

    const current = projects[index];
    const isLiked = !current.isLikedByMe;
    const currentStars = current.starsCount || 12;
    const updatedStars = isLiked ? currentStars + 1 : Math.max(0, currentStars - 1);

    const updatedProject: Project = {
      ...current,
      isLikedByMe: isLiked,
      starsCount: updatedStars,
    };

    projects[index] = updatedProject;
    this.saveProjects(projects);
    return { updatedProject, projects };
  },

  resetProjectsToDefault(): Project[] {
    lastLocalModificationTime = Date.now();
    this.saveProjects(initialProjects);
    return initialProjects;
  },

  // Full Site Reset / Wipe
  wipeAllData(): { projects: Project[]; personalInfo: PersonalInfo; messages: ContactMessage[] } {
    lastLocalModificationTime = Date.now();
    
    // 1. Reset local storage completely
    localStorage.setItem(PROJECTS_KEY, JSON.stringify([]));
    localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    localStorage.setItem(PERSONAL_INFO_KEY, JSON.stringify(initialPersonalInfo));
    localStorage.setItem(SEEDED_KEY, 'true');
    localStorage.removeItem(INTEGRATIONS_KEY);

    // 2. Wipe Firestore collections
    if (db) {
      (async () => {
        try {
          const projSnap = await getDocs(collection(db, 'projects'));
          const msgSnap = await getDocs(collection(db, 'messages'));
          const batch = writeBatch(db);
          projSnap.docs.forEach(d => batch.delete(d.ref));
          msgSnap.docs.forEach(d => batch.delete(d.ref));
          batch.set(doc(db, 'system', 'status'), { seeded: true, wipedAt: new Date().toISOString() });
          await batch.commit();
        } catch (err) {
          console.error('Error wiping Firestore:', err);
        }
      })();
    }

    // 3. Clear Express backend JSON files
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects: [] }),
    }).catch(() => {});

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    }).catch(() => {});

    fetch('/api/personal-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ info: initialPersonalInfo }),
    }).catch(() => {});

    return {
      projects: [],
      messages: [],
      personalInfo: initialPersonalInfo,
    };
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

