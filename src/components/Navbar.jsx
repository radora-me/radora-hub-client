import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  FolderKanban,
  Layers,
  BarChart3,
  MessageSquare,
  Users,
  Search,
  Sun,
  Moon,
  Plus,
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  Sparkles,
  Command,
  Database,
  User
} from 'lucide-react';
import { analyticsApi } from '../api/client';
import { useToast } from './Toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenNewProject,
  onViewProfile,
  searchQuery,
  setSearchQuery,
  onDataReset,
}) => {
  const { addToast } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, isAdmin, logout } = useAuth();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dbMode, setDbMode] = useState('Checking...');

  const searchInputRef = useRef(null);
  const drawerRef = useRef(null);

  const logoUrl = "https://res.cloudinary.com/dcilrqmox/image/upload/v1788804756/ChatGPT_Image_Sep_7_2026_11_37_40_PM_r3gs2x.png";

  // System Modules Configuration
  const modules = [
    {
      id: 'dashboard',
      name: 'Projects & Checklists',
      shortName: 'Projects',
      description: 'Orchestrate enterprise projects, checklist items, and verify progress velocity',
      icon: FolderKanban,
      color: 'from-blue-600 to-indigo-600',
      tag: 'Core Engine',
      adminOnly: false,
    },
    {
      id: 'templates',
      name: 'Templates Library',
      shortName: 'Templates',
      description: 'Standardized operational blueprints and reusable compliance checklists',
      icon: Layers,
      color: 'from-violet-600 to-purple-600',
      tag: 'Blueprints',
      adminOnly: false,
    },
    {
      id: 'analytics',
      name: 'Velocity & Analytics',
      shortName: 'Analytics',
      description: 'Progress burndown, completion telemetry, and architectural distribution metrics',
      icon: BarChart3,
      color: 'from-emerald-600 to-teal-600',
      tag: 'Metrics',
      adminOnly: false,
    },
    {
      id: 'chat',
      name: 'Team Chatroom',
      shortName: 'Chat',
      description: 'Real-time multi-channel collaboration, announcements, and developer syncs',
      icon: MessageSquare,
      color: 'from-radora-600 to-indigo-600',
      tag: 'Live Channels',
      adminOnly: false,
    },
    {
      id: 'profile',
      name: 'Personnel Profile',
      shortName: 'Profile',
      description: 'Review corporate profile, assigned architecture scope, and access telemetry',
      icon: User,
      color: 'from-rose-600 to-pink-600',
      tag: 'My Identity',
      adminOnly: false,
    },
    {
      id: 'team',
      name: 'Team Governance',
      shortName: 'Team',
      description: 'Personnel access control, profile provisioning, and credential management',
      icon: Users,
      color: 'from-amber-600 to-orange-600',
      tag: 'Admin Only',
      adminOnly: true,
    },
  ];

  // Available modules based on role
  const availableModules = modules.filter(m => !m.adminOnly || isAdmin);

  // Active module object
  const currentModule = modules.find(m => m.id === activeTab) || modules[0];
  const CurrentIcon = currentModule.icon;

  useEffect(() => {
    fetchStatus();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    const handleKeyDown = (e) => {
      // Close drawer on Escape
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
      // Focus search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  const fetchStatus = async () => {
    try {
      const res = await analyticsApi.getHealth();
      setDbMode(res.data.databaseMode || 'Local DB');
    } catch {
      setDbMode('Local Mode');
    }
  };

  const handleSelectModule = (moduleId) => {
    setActiveTab(moduleId);
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of Radora Hub?')) {
      logout();
      addToast('Signed out successfully.', 'info');
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* Top Navigation Bar */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'py-2.5 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 dark:shadow-black/40 border-b border-slate-200/80 dark:border-slate-800'
            : 'py-3.5 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left Side: 3-Line Nav Button & Brand */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Production-Grade 3-Line Menu Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(prev => !prev)}
                className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-200 group ${
                  isDrawerOpen
                    ? 'bg-radora-500/15 border-radora-500 text-radora-600 dark:text-radora-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Open Modules Navigation (Ctrl+M)"
                aria-label="Open Modules Navigation"
              >
                <Menu className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>

              {/* Brand Logo & Title */}
              <div
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-3 cursor-pointer group shrink-0"
              >
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-radora-600/20 group-hover:scale-105 transition-transform shrink-0 border border-radora-500/30 bg-slate-950 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Radora Hub Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                    RADORA <span className="text-radora-500">HUB</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5 hidden xs:inline">
                    Enterprise Orchestration
                  </span>
                </div>
              </div>

              {/* Active Module Indicator Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all truncate"
                  title="Click to switch module"
                >
                  <CurrentIcon className="w-3.5 h-3.5 text-radora-500 shrink-0" />
                  <span className="font-bold truncate">{currentModule.name}</span>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    Switch
                  </span>
                </button>
              </div>
            </div>

            {/* Right Side: Search, Theme Toggle, Action, Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Search Bar */}
              <div className="relative hidden lg:block w-52 xl:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-8 pr-8 py-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-radora-500 focus:ring-1 focus:ring-radora-500/20 transition-all"
                />
                <kbd className="hidden xl:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
                  ⌘K
                </kbd>
              </div>

              {/* Light / Dark Mode Toggle */}
              <div
                className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner"
                role="group"
                aria-label="Theme Switcher"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isDark) {
                      toggleTheme();
                      addToast('Switched to Light Mode ☀️', 'info', 1200);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    !isDark
                      ? 'bg-white text-amber-600 shadow-sm font-bold scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  title="Switch to Light Mode"
                >
                  <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline text-[11px]">Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isDark) {
                      toggleTheme();
                      addToast('Switched to Dark Mode 🌙', 'info', 1200);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isDark
                      ? 'bg-slate-800 text-radora-400 shadow-sm font-bold scale-[1.02] border border-slate-700/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Switch to Dark Mode"
                >
                  <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-radora-400' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline text-[11px]">Dark</span>
                </button>
              </div>

              {/* Current User Profile Pill */}
              {user && (
                <div className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div
                    onClick={() => onViewProfile ? onViewProfile(user) : setActiveTab('profile')}
                    className="flex items-center gap-2 cursor-pointer group/user"
                    title="View My Profile"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-radora-600 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] uppercase shrink-0 shadow-sm group-hover/user:scale-105 transition-transform">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>

                    <div className="hidden sm:flex flex-col text-left leading-tight">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[100px] group-hover/user:text-radora-500 transition-colors">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-radora-600 dark:text-radora-400 font-semibold truncate">
                        {isAdmin ? '👑 Architect Admin' : '👤 Team Member'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Create Project Action Button */}
              {isAdmin && (
                <button
                  onClick={onOpenNewProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-radora-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Create New Project"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Project</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3-Line Modules Navigation Drawer (Production Grade) */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div
              ref={drawerRef}
              className="w-screen max-w-md bg-white dark:bg-[#0c1222] border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-250"
            >
              
              {/* Drawer Top Header */}
              <div>
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-radora-600/20 shrink-0 border border-radora-500/30 bg-slate-950 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt="Radora Hub"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Radora Hub Modules
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Enterprise project & verification suite
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800/80 hidden sm:inline">
                      ESC
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Close Navigation (Esc)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modules Navigation List */}
                <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Navigation Modules</span>
                    <span>{availableModules.length} Available</span>
                  </div>

                  {availableModules.map((mod) => {
                    const ModIcon = mod.icon;
                    const isCurrent = activeTab === mod.id;

                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleSelectModule(mod.id)}
                        className={`w-full p-3.5 rounded-2xl text-left transition-all duration-150 flex items-start gap-3.5 group relative ${
                          isCurrent
                            ? 'bg-radora-500/10 dark:bg-radora-600/15 border-2 border-radora-500/60 shadow-sm'
                            : 'border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 hover:scale-[1.01]'
                        }`}
                      >
                        {/* Module Icon Container */}
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shrink-0 shadow-md transition-transform group-hover:scale-105`}>
                          <ModIcon className="w-5 h-5" />
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className={`text-xs sm:text-sm font-bold truncate ${
                              isCurrent ? 'text-radora-600 dark:text-radora-300' : 'text-slate-900 dark:text-white'
                            }`}>
                              {mod.name}
                            </span>
                            
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              isCurrent
                                ? 'bg-radora-500/20 text-radora-600 dark:text-radora-300 border-radora-500/40'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}>
                              {isCurrent ? 'Active' : mod.tag}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {mod.description}
                          </p>
                        </div>

                        {/* Arrow indicator */}
                        <ChevronRight className={`w-4 h-4 shrink-0 mt-2.5 transition-transform ${
                          isCurrent
                            ? 'text-radora-500 translate-x-0.5'
                            : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-1'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Bottom Status & User Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3">
                {/* User Card */}
                {user && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-radora-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase">
                        {user.name ? user.name.charAt(0) : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-radora-600 dark:text-radora-400 font-semibold truncate">
                          {isAdmin ? '👑 Project Architect Admin' : '👤 Team Member'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* System Status telemetry */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold">System Online</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    Radora Hub Enterprise
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
