import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Activity,
  Server,
  RefreshCw,
  TrendingUp,
  FolderKanban
} from 'lucide-react';
import { analyticsApi, projectApi } from '../api/client';
import { useToast } from '../components/Toast';

export const AnalyticsPage = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, healthRes] = await Promise.all([
        analyticsApi.getStats(),
        analyticsApi.getHealth(),
      ]);
      setStats(statsRes.data.data || null);
      setHealth(healthRes.data || null);
    } catch (err) {
      addToast('Failed to load analytics: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading Hub telemetry...</div>;
  }

  const statusCounts = stats?.statusCounts || {};
  const statusItems = [
    { label: 'Planning', count: statusCounts['Planning'] || 0, color: 'bg-blue-500' },
    { label: 'In Progress', count: statusCounts['In Progress'] || 0, color: 'bg-radora-500' },
    { label: 'Under Review', count: statusCounts['Under Review'] || 0, color: 'bg-amber-500' },
    { label: 'Completed', count: statusCounts['Completed'] || 0, color: 'bg-emerald-500' },
    { label: 'On Hold', count: statusCounts['On Hold'] || 0, color: 'bg-slate-600' },
  ];

  const totalProjects = stats?.totalProjects || 1;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-radora-500/15 border border-radora-500/30 text-radora-700 dark:text-radora-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          Hub Telemetry & Audit
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Radora Performance & Velocity Analytics
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Real-time oversight of project distribution, checklist completion velocity, blockers, and system audit logs.
        </p>
      </div>

      {/* Grid: Status Distribution & Task Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Project Pipeline Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Project Pipeline Status
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{stats?.totalProjects || 0} Total Projects</span>
          </div>

          <div className="space-y-3 pt-2">
            {statusItems.map(st => {
              const pct = Math.round((st.count / totalProjects) * 100);
              return (
                <div key={st.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{st.label}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className={`h-full rounded-full ${st.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Velocity Breakdown */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Checklist Tasks Status
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{stats?.totalItems || 0} Total Tasks</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Tasks</span>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.completedItems || 0}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400/80 block mt-1">
                {stats?.overallProgress || 0}% overall completion
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-1">
                <Clock className="w-4 h-4" />
                <span>In Progress</span>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.inProgressItems || 0}</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400/80 block mt-1">Active execution</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Active Blockers</span>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.blockedItems || 0}</span>
              <span className="text-[11px] text-rose-600 dark:text-rose-400/80 block mt-1">
                {stats?.blockedItems > 0 ? 'Requires attention' : 'No blockers'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Checklists Attached</span>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.checklistsCount || 0}</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                across active projects
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Log & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Activity Feed */}
        <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-radora-500 dark:text-radora-400" />
              <span>Recent Activity & Audit Trail</span>
            </h3>
            <button
              onClick={loadAnalytics}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(stats?.recentActivity || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No activity recorded yet.</div>
            ) : (
              (stats?.recentActivity || []).map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-radora-500 dark:bg-radora-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{act.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="lg:col-span-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Infrastructure Status</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Database Engine</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {health?.databaseMode || 'Online'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Server Health</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {health?.status === 'online' ? 'Operational' : 'Online'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Stack</span>
              <span className="font-semibold text-radora-700 dark:text-radora-300">
                MERN Stack (Vite + Node)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Version</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">1.0.0</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
