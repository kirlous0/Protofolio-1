/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Services } from './components/Services';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AndroidSimulatorModal } from './components/AndroidSimulatorModal';
import { TerminalModal } from './components/TerminalModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ProjectFormModal } from './components/admin/ProjectFormModal';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { InteractiveFloatingWidget } from './components/InteractiveFloatingWidget';
import { storageService } from './services/storageService';
import { ContactMessage, PersonalInfo, Project } from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [bgAnimationEnabled, setBgAnimationEnabled] = useState<boolean>(true);

  // Dynamic Data States
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(storageService.getPersonalInfo());
  const [projects, setProjects] = useState<Project[]>(storageService.getProjects());
  const [messages, setMessages] = useState<ContactMessage[]>(storageService.getMessages());
  const skills = storageService.getSkills();
  const services = storageService.getServices();

  // Modal States
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [selectedProjectForAndroidSim, setSelectedProjectForAndroidSim] = useState<Project | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  // Contact form prefill
  const [prefilledService, setPrefilledService] = useState<string>('');

  // Refresh data from storage
  const handleRefreshData = () => {
    setPersonalInfo(storageService.getPersonalInfo());
    setProjects(storageService.getProjects());
    setMessages(storageService.getMessages());
  };

  // Sync data with backend server on mount & window focus
  useEffect(() => {
    let isMounted = true;
    const syncData = async () => {
      const data = await storageService.syncWithServer();
      if (isMounted) {
        setProjects(data.projects);
        setPersonalInfo(data.personalInfo);
        setMessages(data.messages);
      }
    };

    syncData();

    const handleFocus = () => {
      syncData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Scroll section listener
  useEffect(() => {
    const sections = ['hero', 'about', 'skills', 'services', 'projects', 'contact'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl + Shift + A to trigger Admin Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectService = (serviceTitle: string) => {
    setPrefilledService(serviceTitle);
    handleNavigate('contact');
  };

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'createdAt'>, editId?: string) => {
    if (editId) {
      storageService.updateProject(editId, projectData);
    } else {
      storageService.addProject(projectData);
    }
    handleRefreshData();
  };

  const handleOpenProjectForm = (proj?: Partial<Project> | Project | null) => {
    setProjectToEdit((proj as Project) || null);
    setIsProjectFormOpen(true);
  };

  const unreadMessagesCount = messages.filter(m => !m.read).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Interactive Particle Animation */}
      <BackgroundAnimation darkMode={darkMode} enabled={bgAnimationEnabled} />

      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        unreadCount={unreadMessagesCount}
      />

      {/* Main Page Sections */}
      <main>
        <Hero
          personalInfo={personalInfo}
          onNavigate={handleNavigate}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          darkMode={darkMode}
        />

        <About
          personalInfo={personalInfo}
          darkMode={darkMode}
          onNavigate={handleNavigate}
        />

        <Skills
          skills={skills}
          darkMode={darkMode}
        />

        <Services
          services={services}
          darkMode={darkMode}
          onSelectService={handleSelectService}
        />

        <Projects
          projects={projects}
          darkMode={darkMode}
          onSelectProject={(proj) => setSelectedProjectForDetail(proj)}
          onLaunchAndroidSim={(proj) => setSelectedProjectForAndroidSim(proj)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        <Contact
          personalInfo={personalInfo}
          darkMode={darkMode}
          prefilledSubject={prefilledService}
          onMessageSent={handleRefreshData}
        />
      </main>

      {/* Footer */}
      <Footer
        personalInfo={personalInfo}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
        darkMode={darkMode}
      />

      {/* Modals & Dialogs */}
      <ProjectDetailModal
        project={selectedProjectForDetail}
        onClose={() => setSelectedProjectForDetail(null)}
        onLaunchAndroidSim={(proj) => setSelectedProjectForAndroidSim(proj)}
        darkMode={darkMode}
      />

      <AndroidSimulatorModal
        project={selectedProjectForAndroidSim}
        onClose={() => setSelectedProjectForAndroidSim(null)}
        darkMode={darkMode}
      />

      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        personalInfo={personalInfo}
        projects={projects}
        skills={skills}
        darkMode={darkMode}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        projects={projects}
        messages={messages}
        personalInfo={personalInfo}
        onRefreshData={handleRefreshData}
        onOpenProjectForm={handleOpenProjectForm}
        darkMode={darkMode}
      />

      <ProjectFormModal
        isOpen={isProjectFormOpen}
        projectToEdit={projectToEdit}
        onClose={() => setIsProjectFormOpen(false)}
        onSave={handleSaveProject}
        darkMode={darkMode}
      />

      {/* Floating Interactive Controls Widget */}
      <InteractiveFloatingWidget
        darkMode={darkMode}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        bgAnimationEnabled={bgAnimationEnabled}
        onToggleBgAnimation={() => setBgAnimationEnabled(!bgAnimationEnabled)}
      />
    </div>
  );
}
