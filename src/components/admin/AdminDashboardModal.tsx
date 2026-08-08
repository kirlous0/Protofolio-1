import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  Mail, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  Key, 
  Sparkles,
  Smartphone,
  Globe,
  Eye,
  LogOut,
  FolderKanban,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactMessage, PersonalInfo, Project } from '../../types';
import { storageService } from '../../services/storageService';
import { IntegrationsTab } from './IntegrationsTab';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  messages: ContactMessage[];
  personalInfo: PersonalInfo;
  onRefreshData: () => void;
  onOpenProjectForm: (projectToEdit?: Partial<Project> | null) => void;
  darkMode: boolean;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  projects,
  messages,
  personalInfo,
  onRefreshData,
  onOpenProjectForm,
  darkMode,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'integrations' | 'messages' | 'personal' | 'settings'>('projects');
  
  // Settings & Passcode edit state
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  // Personal Info edit state
  const [infoState, setInfoState] = useState<PersonalInfo>(personalInfo);
  const [infoSaved, setInfoSaved] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storageService.verifyPasscode(passcode)) {
      setIsAuthenticated(true);
      setPasscodeError(false);
      setPasscode('');
    } else {
      setPasscodeError(true);
    }
  };

  const handleDeleteProject = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete project "${title}"?`)) {
      storageService.deleteProject(id);
      onRefreshData();
    }
  };

  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    storageService.updateProject(id, { featured: !currentStatus });
    onRefreshData();
  };

  const handleResetProjects = () => {
    if (confirm('Reset all projects to Kirlous Wael\'s default pre-seeded portfolio projects?')) {
      storageService.resetProjectsToDefault();
      onRefreshData();
    }
  };

  const handleDeleteMessage = (id: string) => {
    storageService.deleteMessage(id);
    onRefreshData();
  };

  const handleMarkAsRead = (id: string) => {
    storageService.markMessageAsRead(id);
    onRefreshData();
  };

  const handleClearMessages = () => {
    if (confirm('Clear all received contact messages?')) {
      storageService.clearAllMessages();
      onRefreshData();
    }
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.savePersonalInfo(infoState);
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
    onRefreshData();
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode || newPasscode.length < 4) return;
    storageService.setPasscode(newPasscode);
    setPasscodeSaved(true);
    setNewPasscode('');
    setTimeout(() => setPasscodeSaved(false), 2000);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative max-w-4xl w-full rounded-2xl border p-6 sm:p-8 shadow-2xl flex flex-col h-[85vh] max-h-[750px] overflow-hidden ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-900/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-700 p-[2px]">
                <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-sm ${
                  darkMode ? 'bg-stone-950 text-amber-400' : 'bg-white text-amber-600'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  Portfolio Admin Dashboard
                </h3>
                <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
                  Owner Management & CMS Portal (Kirlous Wael)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setIsAuthenticated(false)}
                  id="admin-logout-btn"
                  title="Lock Dashboard"
                  className="p-2 rounded-xl border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                id="admin-close-btn"
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  darkMode ? 'bg-stone-800 border-stone-700 hover:bg-stone-700' : 'bg-stone-100 border-stone-200 hover:bg-stone-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isAuthenticated ? (
            /* Passcode Entry Form */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className={`text-xl font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  Owner Authentication
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Enter your secure admin passcode to access project CRUD controls, client contact messages, and site configuration.
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <div className="space-y-1">
                  <input
                    type="password"
                    required
                    placeholder="Enter admin passcode..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border font-mono text-center focus:outline-none focus:border-amber-500 ${
                      darkMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-amber-200 text-stone-900'
                    }`}
                  />
                  {passcodeError && (
                    <p className="text-xs text-rose-500 font-mono mt-1">Invalid passcode. Please try again.</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="admin-login-submit-btn"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  Unlock Admin Dashboard
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard Layout */
            <div className="flex-1 flex flex-col md:flex-row gap-6 pt-4 overflow-hidden">
              
              {/* Sidebar Navigation */}
              <div className="w-full md:w-56 shrink-0 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-amber-900/10 pb-3 md:pb-0 md:pr-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('projects')}
                  id="admin-tab-projects"
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'projects'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                      : darkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span className="flex-1">Projects ({projects.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('integrations')}
                  id="admin-tab-integrations"
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'integrations'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                      : darkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="flex-1">Integrations & API Keys</span>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  id="admin-tab-messages"
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'messages'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                      : darkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4" />
                    <span>Inbox</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('personal')}
                  id="admin-tab-personal"
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'personal'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                      : darkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Personal Info</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  id="admin-tab-settings"
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
                      : darkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>Passcode</span>
                </button>

                <div className="hidden md:block mt-auto pt-4 border-t border-amber-900/10 text-[10px] text-stone-500 font-mono space-y-1">
                  <p>Storage Engine: LocalStorage</p>
                  <p>Live Sync Active</p>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                
                {/* PROJECTS TAB */}
                {activeTab === 'projects' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-base font-bold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                          Manage Portfolio Projects
                        </h4>
                        <p className="text-xs text-stone-400">Add new web/Android projects or edit existing cards</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleResetProjects}
                          id="admin-reset-projects-btn"
                          className="px-3 py-2 rounded-xl border border-stone-700 text-stone-400 hover:text-stone-100 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                          title="Reset to default seed projects"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reset Defaults</span>
                        </button>
                        <button
                          onClick={() => onOpenProjectForm()}
                          id="admin-add-project-btn"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform shadow-md shadow-amber-500/20"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Project</span>
                        </button>
                      </div>
                    </div>

                    {/* Project List Table / Cards */}
                    <div className="space-y-3">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={proj.imageUrl}
                              alt={proj.title}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                  proj.category === 'Android' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {proj.category}
                                </span>
                                {proj.featured && (
                                  <span className="text-amber-400 font-mono text-[9px] flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    Featured
                                  </span>
                                )}
                              </div>
                              <h5 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {proj.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
                                {proj.techStack.join(', ')}
                              </p>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => handleToggleFeatured(proj.id, proj.featured)}
                              id={`admin-feature-toggle-${proj.id}`}
                              className={`p-2 rounded-lg border text-xs cursor-pointer ${
                                proj.featured 
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                              title="Toggle Featured"
                            >
                              <Star className={`w-4 h-4 ${proj.featured ? 'fill-amber-400' : ''}`} />
                            </button>

                            <button
                              onClick={() => onOpenProjectForm(proj)}
                              id={`admin-edit-proj-${proj.id}`}
                              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-400 text-xs cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              id={`admin-delete-proj-${proj.id}`}
                              className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INTEGRATIONS & API KEYS TAB */}
                {activeTab === 'integrations' && (
                  <IntegrationsTab
                    darkMode={darkMode}
                    existingProjects={projects}
                    onImportDraftProject={(draft) => {
                      onOpenProjectForm(draft);
                    }}
                    onUpdateProjectLiveUrl={(projectId, liveUrl) => {
                      storageService.updateProject(projectId, { liveUrl });
                      onRefreshData();
                    }}
                  />
                )}

                {/* MESSAGES TAB */}
                {activeTab === 'messages' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          Contact Messages Inbox
                        </h4>
                        <p className="text-xs text-slate-400">Messages sent by prospective clients via portfolio contact form</p>
                      </div>

                      {messages.length > 0 && (
                        <button
                          onClick={handleClearMessages}
                          id="admin-clear-messages-btn"
                          className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Inbox</span>
                        </button>
                      )}
                    </div>

                    {messages.length === 0 ? (
                      <div className="text-center py-12 rounded-xl border border-slate-800 font-mono text-slate-500 text-xs">
                        No received messages in inbox yet. Send a test message via the Contact form!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-5 rounded-xl border space-y-3 transition-colors ${
                              !msg.read 
                                ? darkMode ? 'bg-slate-950 border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-300' 
                                : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {msg.name}
                                  </h5>
                                  <span className="text-xs text-emerald-400 font-mono">&lt;{msg.email}&gt;</span>
                                  {!msg.read && (
                                    <span className="bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">Subject: {msg.subject}</p>
                              </div>

                              <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                            </div>

                            <p className="text-xs leading-relaxed text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                              {msg.message}
                            </p>

                            <div className="flex items-center justify-between pt-1 text-xs">
                              <a
                                href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                                className="text-emerald-400 hover:underline font-semibold text-xs flex items-center gap-1"
                              >
                                Reply via Email &rarr;
                              </a>

                              <div className="flex items-center gap-2">
                                {!msg.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(msg.id)}
                                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-mono cursor-pointer"
                                  >
                                    Mark Read
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PERSONAL INFO TAB */}
                {activeTab === 'personal' && (
                  <form onSubmit={handleSavePersonalInfo} className="space-y-4 text-xs">
                    <div>
                      <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Personal Brand & Stats Config
                      </h4>
                      <p className="text-xs text-slate-400">Update developer metrics and status displayed on homepage</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-mono font-bold">Years Experience</label>
                        <input
                          type="number"
                          value={infoState.yearsExperience}
                          onChange={(e) => setInfoState({ ...infoState, yearsExperience: parseInt(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono font-bold">Completed Projects Counter</label>
                        <input
                          type="number"
                          value={infoState.completedProjects}
                          onChange={(e) => setInfoState({ ...infoState, completedProjects: parseInt(e.target.value) || 0 })}
                          className={`w-full px-3 py-2 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono font-bold">Short Tagline</label>
                      <input
                        type="text"
                        value={infoState.tagline}
                        onChange={(e) => setInfoState({ ...infoState, tagline: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="avail-work-check"
                        checked={infoState.availableForWork}
                        onChange={(e) => setInfoState({ ...infoState, availableForWork: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-500"
                      />
                      <label htmlFor="avail-work-check" className="font-bold cursor-pointer">
                        Display "Available for Freelance & Full-Time Roles" status badge
                      </label>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center gap-2 cursor-pointer hover:bg-emerald-400"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Config Updates</span>
                      </button>
                      {infoSaved && <span className="text-emerald-400 font-mono ml-3">Saved!</span>}
                    </div>
                  </form>
                )}

                {/* SETTINGS / PASSCODE TAB */}
                {activeTab === 'settings' && (
                  <form onSubmit={handleChangePasscode} className="space-y-4 max-w-sm text-xs">
                    <div>
                      <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Change Owner Passcode
                      </h4>
                      <p className="text-xs text-slate-400">Update passcode required to access the admin portal</p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono font-bold">New Admin Passcode</label>
                      <input
                        type="password"
                        required
                        minLength={4}
                        placeholder="Enter new passcode..."
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border font-mono ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold cursor-pointer hover:bg-emerald-400"
                    >
                      Update Passcode
                    </button>
                    {passcodeSaved && <p className="text-emerald-400 font-mono">Passcode updated successfully!</p>}
                  </form>
                )}

              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
