import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
  FolderKanban,
  CheckCircle2,
  Clock,
  Search,
  Activity,
  ArrowUpDown
} from 'lucide-react';
import { projectApi, analyticsApi } from '../api/client';
import { StatsCards } from '../components/StatsCards';
import { ProjectCard } from '../components/ProjectCard';
import { ActivityTracker } from '../components/ActivityTracker';
import { useToast } from '../components/Toast';

export const Dashboard = ({ onSelectProject, onOpenNewProject, onEditProject, searchQuery }) => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, statsRes] = await Promise.all([
        projectApi.getAll(),
        analyticsApi.getStats(),
      ]);
      setProjects(projRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      addToast('Error loading project data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project and all its checklists?')) {
      try {
        await projectApi.delete(id);
        addToast('Project deleted successfully');
        loadData();
      } catch (err) {
        addToast('Failed to delete project: ' + err.message, 'error');
      }
    }
  };

  // Filter & Search Logic
  const filteredProjects = projects
    .filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.lead?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'date') return (b.targetDate || '').localeCompare(a.targetDate || '');
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

  const statuses = ['All', 'In Progress', 'Planning', 'Under Review', 'Completed', 'On Hold'];
  const categories = ['All', 'Engineering', 'Cloud Ops', 'Security & Audit', 'Client Onboarding', 'Quality Assurance', 'Product', 'Infrastructure'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome / Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-radora-100 via-white to-indigo-100 dark:from-radora-950 dark:via-slate-900 dark:to-indigo-950 border border-radora-200/60 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-radora-500/15 border border-radora-500/30 text-radora-700 dark:text-radora-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Radora Project Orchestration Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manage Projects & Checklists with Precision
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Standardize deployments, security certifications, and engineering releases across your organization with automated checklists and velocity analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-radora-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-radora-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Overview */}
      <StatsCards stats={stats} />

      {/* Projects Controls & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  statusFilter === st
                    ? 'bg-radora-600 text-white border-radora-600 shadow-md shadow-radora-600/30'
                    : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Right filters: Category, Sort, View mode */}
          <div className="flex items-center gap-3">
            {/* Category select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-radora-500 shadow-sm"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* Sort select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-radora-500 shadow-sm"
            >
              <option value="updated">Recently Updated</option>
              <option value="progress">Highest Progress</option>
              <option value="title">Alphabetical</option>
              <option value="date">Target Date</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Projects View */}
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">
            Loading Radora projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/30">
            <FolderKanban className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by creating your first Radora project!'}
            </p>
            <button
              onClick={onOpenNewProject}
              className="mt-4 px-4 py-2 rounded-xl bg-radora-600 hover:bg-radora-500 text-white text-xs font-bold transition-all"
            >
              Create Project
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project._id || project.id}
                project={project}
                onSelect={onSelectProject}
                onEdit={onEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Project Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Progress</th>
                    <th className="py-3.5 px-4">Target Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {filteredProjects.map(p => (
                    <tr
                      key={p._id || p.id}
                      onClick={() => onSelectProject(p)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-radora-600 dark:text-radora-300">
                        {p.code}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {p.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {p.category}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200 dark:border-slate-700 uppercase">
                          {p.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-radora-500 rounded-full"
                              style={{ width: `${p.progress || 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-700 dark:text-slate-300">{p.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {p.targetDate || '—'}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditProject(p)}
                          className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p._id || p.id)}
                          className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Live Project Activity Tracker Block */}
      <div className="pt-2">
        <ActivityTracker onSelectProject={onSelectProject} />
      </div>

    </div>
  );
};
