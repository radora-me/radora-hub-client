import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { projectApi } from '../api/client';
import { useToast } from './Toast';

export const ProjectModal = ({ isOpen, onClose, onProjectSaved, editingProject }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: 'Engineering',
    status: 'Planning',
    priority: 'Medium',
    lead: '',
    team: '',
    tags: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    description: '',
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title || '',
        code: editingProject.code || '',
        category: editingProject.category || 'Engineering',
        status: editingProject.status || 'Planning',
        priority: editingProject.priority || 'Medium',
        lead: editingProject.lead || '',
        team: Array.isArray(editingProject.team) ? editingProject.team.join(', ') : (editingProject.team || ''),
        tags: Array.isArray(editingProject.tags) ? editingProject.tags.join(', ') : (editingProject.tags || ''),
        startDate: editingProject.startDate || '',
        targetDate: editingProject.targetDate || '',
        description: editingProject.description || '',
      });
    } else {
      setFormData({
        title: '',
        code: `RAD-${Math.floor(100 + Math.random() * 900)}`,
        category: 'Engineering',
        status: 'Planning',
        priority: 'Medium',
        lead: 'Radora Lead',
        team: 'Sarah Chen, David Miller',
        tags: 'Sprint 1, Q3',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '',
        description: '',
      });
    }
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Project title is required', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.startDate && formData.startDate < today) {
      addToast('Start date cannot be in the past. Please select today or a future date.', 'error');
      return;
    }
    if (formData.targetDate) {
      if (formData.targetDate < today) {
        addToast('Target completion date cannot be in the past. Please select a future date.', 'error');
        return;
      }
      if (formData.startDate && formData.targetDate < formData.startDate) {
        addToast('Target date must be on or after the start date.', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        team: Array.isArray(formData.team)
          ? formData.team
          : (typeof formData.team === 'string' ? formData.team.split(',').map(s => s.trim()).filter(Boolean) : []),
        tags: Array.isArray(formData.tags)
          ? formData.tags
          : (typeof formData.tags === 'string' ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
      };

      if (editingProject) {
        const id = editingProject._id || editingProject.id;
        await projectApi.update(id, payload);
        addToast('Project updated successfully!');
      } else {
        await projectApi.create(payload);
        addToast('New project created successfully!');
      }

      onProjectSaved();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-radora-500/15 text-radora-700 dark:text-radora-400 border border-radora-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProject ? 'Edit Project' : 'Create New Radora Project'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure project metadata, timelines, and ownership
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Radora Multi-Region Cloud Deployment"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Project Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="RAD-101"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-radora-700 dark:text-radora-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Cloud Ops">Cloud Ops</option>
                <option value="Security & Audit">Security & Audit</option>
                <option value="Client Onboarding">Client Onboarding</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Product">Product</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Project Lead
              </label>
              <input
                type="text"
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                placeholder="Sarah Chen"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Team Members (comma separated)
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Alex, David, Elena"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Start Date
                </label>
                <span className="text-[10px] text-radora-600 dark:text-radora-400 font-medium">
                  Today or Future
                </span>
              </div>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  const todayStr = new Date().toISOString().split('T')[0];
                  if (val && val < todayStr) {
                    addToast('Start date cannot be in the past. Only today or future dates allowed.', 'warning');
                    setFormData({ ...formData, startDate: todayStr });
                    return;
                  }
                  setFormData({ ...formData, startDate: val });
                }}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Completion Date
                </label>
                <span className="text-[10px] text-radora-600 dark:text-radora-400 font-medium">
                  Future Only
                </span>
              </div>
              <input
                type="date"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                value={formData.targetDate}
                onChange={(e) => {
                  const val = e.target.value;
                  const minDate = formData.startDate || new Date().toISOString().split('T')[0];
                  if (val && val < minDate) {
                    addToast('Target completion date cannot be earlier than start date or in the past.', 'warning');
                    return;
                  }
                  setFormData({ ...formData, targetDate: val });
                }}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Cloud, Release, Critical"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description & Objectives
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline project scope, deliverables, and targets..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-radora-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingProject ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
