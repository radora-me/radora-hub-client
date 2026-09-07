import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Edit3,
  PlusCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Layers,
  User,
  Shield,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { activityApi } from '../api/client';

const FILTER_TABS = [
  { id: 'ALL', label: 'All Updates' },
  { id: 'CHECKLIST', label: 'Checklist Marks', icon: CheckCircle2 },
  { id: 'STATUS', label: 'Status Changes', icon: ArrowRightLeft },
  { id: 'PROJECT', label: 'Project Edits', icon: Edit3 },
];

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';
  const now = new Date();
  const date = new Date(dateInput);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getActionBadge = (action) => {
  switch (action) {
    case 'CHECKLIST_ITEM_CHECKED':
      return {
        label: 'Marked Checkbox',
        icon: CheckCircle2,
        bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
        iconColor: 'text-emerald-500',
      };
    case 'CHECKLIST_ITEM_UNCHECKED':
      return {
        label: 'Unchecked Item',
        icon: XCircle,
        bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
        iconColor: 'text-rose-500',
      };
    case 'PROJECT_STATUS_CHANGED':
      return {
        label: 'Status Changed',
        icon: ArrowRightLeft,
        bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
        iconColor: 'text-amber-500',
      };
    case 'PROJECT_UPDATED':
      return {
        label: 'Project Updated',
        icon: Edit3,
        bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
        iconColor: 'text-blue-500',
      };
    case 'PROJECT_CREATED':
      return {
        label: 'Project Created',
        icon: Sparkles,
        bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
        iconColor: 'text-indigo-500',
      };
    case 'CHECKLIST_ITEM_ADDED':
      return {
        label: 'Task Added',
        icon: PlusCircle,
        bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25',
        iconColor: 'text-purple-500',
      };
    case 'TEMPLATE_INSTANTIATED':
      return {
        label: 'Template Instantiated',
        icon: Layers,
        bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25',
        iconColor: 'text-teal-500',
      };
    default:
      return {
        label: 'Activity',
        icon: Activity,
        bg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25',
        iconColor: 'text-slate-500',
      };
  }
};

export const ActivityTracker = ({
  projectId = null,
  onSelectProject = null,
  title = 'Live Project Activity Tracker',
  subtitle = 'Real-time audit log of checklist marks, status transitions, and project modifications',
  maxHeight = '520px',
  compact = false,
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const params = { limit: 60 };
      if (projectId) params.projectId = projectId;
      if (activeTab !== 'ALL') params.action = activeTab;

      const res = await activityApi.getAll(params);
      if (res.data?.success) {
        setActivities(res.data.data || []);
      }
    } catch (err) {
      console.error('[ActivityTracker] Failed to load activities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, activeTab]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Real-time socket sync: slide new activity in directly without reload
  useEffect(() => {
    const handlePlatformUpdate = (e) => {
      const { type, payload } = e.detail || {};

      if (type === 'ACTIVITY_RECORDED' && payload?.activity) {
        const newAct = payload.activity;
        // If scoped to a specific project, verify it matches
        if (projectId && String(newAct.projectId) !== String(projectId)) {
          return;
        }

        setActivities(prev => {
          const actId = newAct._id || newAct.id;
          if (prev.some(a => (a._id || a.id) === actId)) return prev;
          return [newAct, ...prev];
        });
      } else if (['CHECKLIST_ITEM_UPDATED', 'PROJECT_UPDATED', 'PROJECT_CREATED'].includes(type)) {
        // Fallback re-fetch to ensure fresh data
        fetchActivities(false);
      }
    };

    window.addEventListener('radora:platform_update', handlePlatformUpdate);
    return () => window.removeEventListener('radora:platform_update', handlePlatformUpdate);
  }, [projectId, fetchActivities]);

  // Filter by search text
  const filteredActivities = activities.filter(a => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      a.message?.toLowerCase().includes(q) ||
      a.userName?.toLowerCase().includes(q) ||
      a.projectTitle?.toLowerCase().includes(q) ||
      a.projectCode?.toLowerCase().includes(q) ||
      a.details?.itemText?.toLowerCase().includes(q) ||
      a.details?.sectionName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-radora-500/10 text-radora-600 dark:text-radora-400 border border-radora-500/20 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Activity Stream
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({filteredActivities.length} recorded)
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Activity className="w-5 h-5 text-radora-500" />
            <span>{title}</span>
          </h2>
          {!compact && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action / Search & Refresh Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Quick Search */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter user or task..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500 transition-all shadow-inner"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchActivities(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh Activity Log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-radora-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto text-xs">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-radora-600 text-white shadow-md shadow-radora-600/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activities Scroll Area */}
      <div 
        style={{ maxHeight }} 
        className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar p-2 sm:p-4 space-y-1"
      >
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-radora-500 mb-2" />
            <span>Loading recent activity events...</span>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Activity Events Found</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
              {searchFilter
                ? 'No activities matching your filter criteria. Try clearing search.'
                : 'Project updates, checklist toggles, and status transitions will appear here live.'}
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const badge = getActionBadge(act.action);
            const BadgeIcon = badge.icon;
            const isAdmin = act.userRole === 'architect_admin';
            const actId = act._id || act.id;

            return (
              <div
                key={actId}
                className="group relative p-3 sm:p-3.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all flex items-start gap-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              >
                {/* User Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  {act.userAvatar ? (
                    <img
                      src={act.userAvatar}
                      alt={act.userName}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs ${
                      isAdmin
                        ? 'bg-gradient-to-tr from-radora-600 to-indigo-600'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                    }`}>
                      {act.userName ? act.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  {/* Action Micro-Icon */}
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs`}>
                    <BadgeIcon className={`w-2.5 h-2.5 ${badge.iconColor}`} />
                  </span>
                </div>

                {/* Content Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {/* User Name */}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {act.userName}
                    </span>

                    {/* Role Tag */}
                    {isAdmin ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-radora-500/15 text-radora-600 dark:text-radora-400 border border-radora-500/20">
                        👑 Admin
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        👤 Member
                      </span>
                    )}

                    {/* Action Type Tag */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>

                    {/* Relative Timestamp */}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(act.createdAt)}
                    </span>
                  </div>

                  {/* Message Narrative */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {act.message}
                  </p>

                  {/* Context Meta: Project Code + Transition Badges */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                    {act.projectTitle && (
                      <button
                        type="button"
                        onClick={() => onSelectProject && act.projectId && onSelectProject({ _id: act.projectId, title: act.projectTitle })}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors"
                        title={`Open Project: ${act.projectTitle}`}
                      >
                        <span className="font-mono text-[10px] font-bold text-radora-500">
                          {act.projectCode || 'RAD'}
                        </span>
                        <span className="truncate max-w-[150px]">{act.projectTitle}</span>
                        {onSelectProject && <ChevronRight className="w-3 h-3 text-slate-400" />}
                      </button>
                    )}

                    {/* Status Transition Pill if available */}
                    {act.details?.previousStatus && act.details?.newStatus && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg">
                        <span className="line-through opacity-70">{act.details.previousStatus}</span>
                        <ArrowRightLeft className="w-2.5 h-2.5 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{act.details.newStatus}</span>
                      </span>
                    )}

                    {/* Section Name if available */}
                    {act.details?.sectionName && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        in section: <strong className="text-slate-600 dark:text-slate-400">{act.details.sectionName}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
