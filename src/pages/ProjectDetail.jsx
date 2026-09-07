import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  CheckSquare,
  Calendar,
  Users,
  Tag,
  Clock,
  Layers,
  Edit3,
  FileCheck2,
  Trash2,
  Activity
} from 'lucide-react';
import { projectApi, checklistApi } from '../api/client';
import { ChecklistView } from '../components/ChecklistView';
import { TemplateSelectorModal } from '../components/TemplateSelectorModal';
import { ChecklistBuilderModal } from '../components/ChecklistBuilderModal';
import { ActivityTracker } from '../components/ActivityTracker';
import { useToast } from '../components/Toast';

export const ProjectDetail = ({ projectId, onBack, onEditProject }) => {
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [activeChecklistId, setActiveChecklistId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCustomChecklistModalOpen, setIsCustomChecklistModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('checklists'); // 'checklists' | 'overview'

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const res = await projectApi.getById(projectId);
      const proj = res.data.data;
      setProject(proj);
      const chkList = proj.checklists || [];
      setChecklists(chkList);
      if (chkList.length > 0) {
        setActiveChecklistId(chkList[0]._id || chkList[0].id);
      } else {
        setActiveChecklistId(null);
      }
    } catch (err) {
      addToast('Failed to load project: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await projectApi.update(projectId, { status: newStatus });
      setProject(res.data.data);
      addToast(`Project status changed to ${newStatus}`);
    } catch (err) {
      addToast('Failed to update status: ' + err.message, 'error');
    }
  };

  const handleChecklistUpdated = (updatedChk) => {
    const updatedId = updatedChk._id || updatedChk.id;
    setChecklists(prev =>
      prev.map(c => ((c._id === updatedId || c.id === updatedId) ? updatedChk : c))
    );
    // Refresh project to get recalculated average progress
    projectApi.getById(projectId).then(res => {
      setProject(res.data.data);
    });
  };

  const handleChecklistCreated = (newChk) => {
    setChecklists(prev => [newChk, ...prev]);
    setActiveChecklistId(newChk._id || newChk.id);
    projectApi.getById(projectId).then(res => {
      setProject(res.data.data);
    });
  };

  const handleDeleteChecklist = async (chkId) => {
    if (window.confirm('Are you sure you want to remove this checklist?')) {
      try {
        await checklistApi.delete(chkId);
        addToast('Checklist removed');
        const remaining = checklists.filter(c => c._id !== chkId && c.id !== chkId);
        setChecklists(remaining);
        if (remaining.length > 0) {
          setActiveChecklistId(remaining[0]._id || remaining[0].id);
        } else {
          setActiveChecklistId(null);
        }
        // Refresh project
        projectApi.getById(projectId).then(res => {
          setProject(res.data.data);
        });
      } catch (err) {
        addToast('Failed to delete checklist: ' + err.message, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-slate-400 animate-fade-in">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center text-sm text-slate-400">
        Project not found.
        <button onClick={onBack} className="ml-3 text-radora-400 hover:underline">
          Go back to dashboard
        </button>
      </div>
    );
  }

  const activeChecklist = checklists.find(c => (c._id === activeChecklistId || c.id === activeChecklistId));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <button
          onClick={() => onEditProject(project)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Project Details</span>
        </button>
      </div>

      {/* Project Banner & Information */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-radora-700 dark:text-radora-300 border border-slate-200 dark:border-slate-700">
                {project.code || 'RAD'}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {project.category}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                Priority: {project.priority}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {project.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Quick Status Control */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Project Status
            </span>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-radora-500 cursor-pointer shadow-sm"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Metadata Pills: Dates, Lead, Team, Overall Progress */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Lead</span>
              <span className="font-medium truncate">{project.lead || 'Radora Team'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Target Date</span>
              <span className="font-medium">{project.targetDate || 'Flexible'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Attached Checklists</span>
              <span className="font-medium">{checklists.length} checklist runs</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Overall Project Progress</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{project.progress || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-radora-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation: Checklists vs Overview */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('checklists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'checklists'
                ? 'bg-radora-600 text-white shadow-md shadow-radora-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Checklists ({checklists.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-radora-600 text-white shadow-md shadow-radora-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Project Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'activity'
                ? 'bg-radora-600 text-white shadow-md shadow-radora-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity Stream</span>
          </button>
        </div>

        {/* Add Checklist Actions */}
        {activeTab === 'checklists' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-radora-50 hover:bg-radora-100 text-radora-700 border border-radora-200 dark:bg-radora-600/20 dark:hover:bg-radora-600/30 dark:text-radora-300 dark:border-radora-500/40 text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add from Template</span>
            </button>
            <button
              onClick={() => setIsCustomChecklistModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Checklist</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'checklists' && (
        checklists.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/30">
            <CheckSquare className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Checklists Attached Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Every robust Radora project is driven by structured checklists. Instantiate a pre-engineered template or build a bespoke checklist now.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-radora-600 hover:bg-radora-500 text-white text-xs font-bold shadow-lg shadow-radora-600/30 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Instantiate Radora Template</span>
              </button>
              <button
                onClick={() => setIsCustomChecklistModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent text-xs font-bold transition-all shadow-sm"
              >
                Create from Scratch
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Checklist Tabs (if multiple) */}
            {checklists.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {checklists.map(c => {
                  const isActive = (c._id === activeChecklistId || c.id === activeChecklistId);
                  return (
                    <button
                      key={c._id || c.id}
                      onClick={() => setActiveChecklistId(c._id || c.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-radora-700 dark:text-radora-300 border border-radora-500/50 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{c.title}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-400">
                        {c.progress || 0}%
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render Selected Checklist */}
            {activeChecklist && (
              <ChecklistView
                checklist={activeChecklist}
                onChecklistUpdated={handleChecklistUpdated}
                onDeleteChecklist={handleDeleteChecklist}
              />
            )}
          </div>
        )
      )}

      {/* Project Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Project Description & Scope
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              {project.description || 'No detailed scope written for this project.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Team Roster
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-radora-600/20 dark:bg-radora-600/30 border border-radora-500/30 dark:border-radora-500/40 flex items-center justify-center font-bold text-xs text-radora-700 dark:text-radora-300">
                    {project.lead?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{project.lead || 'Radora Lead'}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Project Lead</span>
                  </div>
                </div>

                {(project.team || []).map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                      {member.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{member}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Labels & Key Tags
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {(project.tags || []).map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <Tag className="w-3 h-3 text-radora-500 dark:text-radora-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Milestones & Dates
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Project Kickoff</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{project.startDate || '—'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Target Go-Live / Acceptance</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{project.targetDate || 'Flexible'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Stream Tab */}
      {activeTab === 'activity' && (
        <div className="pt-2">
          <ActivityTracker
            projectId={projectId}
            title={`${project.title} — Activity Stream`}
            subtitle="Chronological audit log of all checklist marks, status transitions, and edits on this project"
          />
        </div>
      )}

      {/* Modals */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        projectId={projectId}
        onTemplateInstantiated={handleChecklistCreated}
      />

      <ChecklistBuilderModal
        isOpen={isCustomChecklistModalOpen}
        onClose={() => setIsCustomChecklistModalOpen(false)}
        projectId={projectId}
        onChecklistCreated={handleChecklistCreated}
      />

    </div>
  );
};
