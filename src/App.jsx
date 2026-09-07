import React, { useState } from 'react';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { TemplatesPage } from './pages/TemplatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { ChatroomPage } from './pages/ChatroomPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { ProjectModal } from './components/ProjectModal';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { initSocket } from './api/socket';
import { RefreshCw } from 'lucide-react';

export const AppContent = () => {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'templates' | 'analytics' | 'team' | 'chat' | 'profile' | 'project_detail'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Safeguard: If non-admin is on 'team' tab, redirect to dashboard
  React.useEffect(() => {
    if (activeTab === 'team' && !isAdmin) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isAdmin, user]);

  // Real-time Platform Synchronization Engine (Multi-user instant updates with 0 reload)
  React.useEffect(() => {
    initSocket();

    const handlePlatformUpdate = (e) => {
      console.log('[Real-Time Engine] Platform update received:', e.detail);
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('radora:platform_update', handlePlatformUpdate);
    return () => {
      window.removeEventListener('radora:platform_update', handlePlatformUpdate);
    };
  }, []);

  // If initial auth check is ongoing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-radora-600/10 border border-radora-500/20 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 animate-spin text-radora-500" />
        </div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
          Initializing Radora Hub...
        </p>
      </div>
    );
  }

  // If not logged in, render LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSelectProject = (project) => {
    setSelectedProjectId(project._id || project.id);
    setActiveTab('project_detail');
  };

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleViewProfile = (targetUserOrId) => {
    const id = targetUserOrId 
      ? (typeof targetUserOrId === 'object' ? (targetUserOrId._id || targetUserOrId.id) : targetUserOrId)
      : (user?._id || user?.id);
    setSelectedProfileUserId(id);
    setActiveTab('profile');
  };

  return (
    <div className={`bg-slate-50 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 ${
      activeTab === 'chat' ? 'h-screen overflow-hidden' : 'min-h-screen'
    }`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab === 'project_detail' ? 'dashboard' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'project_detail') {
            setSelectedProjectId(null);
          }
        }}
        onOpenNewProject={handleOpenNewProject}
        onViewProfile={handleViewProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onDataReset={() => setRefreshKey(prev => prev + 1)}
      />

      {/* Main Container - Full-screen layout for Chatroom, Standard container for Modules */}
      {activeTab === 'chat' ? (
        <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          <ChatroomPage key={refreshKey} />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={refreshKey}
              onSelectProject={handleSelectProject}
              onOpenNewProject={handleOpenNewProject}
              onEditProject={handleEditProject}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'project_detail' && (
            <ProjectDetail
              key={`${selectedProjectId}-${refreshKey}`}
              projectId={selectedProjectId}
              onBack={() => {
                setActiveTab('dashboard');
                setSelectedProjectId(null);
              }}
              onEditProject={handleEditProject}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesPage key={refreshKey} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage key={refreshKey} />
          )}

          {activeTab === 'team' && isAdmin && (
            <TeamManagementPage 
              key={refreshKey}
              onViewProfile={handleViewProfile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              key={selectedProfileUserId || 'self'}
              userId={selectedProfileUserId}
              onBack={() => {
                if (isAdmin && selectedProfileUserId && String(selectedProfileUserId) !== String(user?._id || user?.id)) {
                  setActiveTab('team');
                } else {
                  setActiveTab('dashboard');
                }
              }}
              onSelectMember={(id) => setSelectedProfileUserId(id)}
            />
          )}
        </main>
      )}

      {/* Ubiquitous Floating Chatroom Pop-up (Visible across all screens while working) */}
      {activeTab !== 'chat' && (
        <FloatingChatWidget onOpenFullScreen={() => setActiveTab('chat')} />
      )}

      {/* Project Create / Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectSaved={handleProjectSaved}
        editingProject={editingProject}
      />

      {/* Footer with Developed by Radora & Company Hyperlinks */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 py-4 text-xs text-slate-500 transition-colors backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Radora Hub &copy; {new Date().getFullYear()} — Enterprise Project & Checklist Orchestration
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Authenticated: <strong className="text-slate-800 dark:text-slate-200">{user?.name}</strong> ({isAdmin ? '👑 Architect Admin' : '👤 Team Member'})
            </span>
          </div>

          {/* Developed by Radora branding with company logo & www.radora.tech links */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Developed by</span>
            <a
              href="https://www.radora.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group transition-all"
              title="Visit Radora Tech (www.radora.tech)"
            >
              <img
                src="https://res.cloudinary.com/dcilrqmox/image/upload/v1785686879/radora_office_-_Copy_sigbnd.png"
                alt="Radora"
                className="h-7 w-auto object-contain rounded transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-radora-600 dark:text-radora-400 group-hover:text-radora-500 dark:group-hover:text-radora-300 underline underline-offset-2 transition-colors">
                www.radora.tech
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
