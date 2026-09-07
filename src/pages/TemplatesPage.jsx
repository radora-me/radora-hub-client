import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  CheckSquare,
  Clock,
  Search,
  Trash2,
  FolderPlus,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Send,
  X,
  AlertTriangle
} from 'lucide-react';
import { templateApi, projectApi } from '../api/client';
import { useToast } from '../components/Toast';

export const TemplatesPage = () => {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Delete Template Confirmation Modal
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Instantiation dialog
  const [isInstantiateOpen, setIsInstantiateOpen] = useState(false);
  const [instantiatingTpl, setInstantiatingTpl] = useState(null);
  const [targetProjectId, setTargetProjectId] = useState('');
  const [instantiateTitle, setInstantiateTitle] = useState('');
  const [isInstantiating, setIsInstantiating] = useState(false);

  // New Template Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTpl, setNewTpl] = useState({
    name: '',
    category: 'Engineering',
    description: '',
    estimatedHours: 8,
    tags: 'Standard, Best Practice',
    sections: [
      {
        id: 'sec-1',
        name: 'Phase 1: Verification',
        items: [
          { id: 'itm-1', text: 'Baseline validation', priority: 'High', defaultAssigneeRole: 'Lead', description: '' }
        ]
      }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tplRes, projRes] = await Promise.all([
        templateApi.getAll(),
        projectApi.getAll(),
      ]);
      const list = tplRes.data.data || [];
      setTemplates(list);
      setProjects(projRes.data.data || []);
      if (list.length > 0) setPreviewTemplate(list[0]);
    } catch (err) {
      addToast('Failed to load templates: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptDelete = (tpl) => {
    setTemplateToDelete(tpl);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    const id = templateToDelete._id || templateToDelete.id;
    const name = templateToDelete.name || 'Template';

    try {
      setIsDeleting(true);
      await templateApi.delete(id);
      addToast(`Template "${name}" deleted successfully!`);
      setTemplateToDelete(null);

      setTemplates(prev => {
        const remaining = prev.filter(t => (t._id !== id && t.id !== id));
        if (previewTemplate && (previewTemplate._id === id || previewTemplate.id === id)) {
          setPreviewTemplate(remaining.length > 0 ? remaining[0] : null);
        }
        return remaining;
      });
    } catch (err) {
      addToast('Failed to delete template: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenInstantiate = (tpl) => {
    setInstantiatingTpl(tpl);
    setInstantiateTitle(`${tpl.name} - Run`);
    if (projects.length > 0) {
      setTargetProjectId(projects[0]._id || projects[0].id);
    }
    setIsInstantiateOpen(true);
  };

  const handleExecuteInstantiate = async (e) => {
    e.preventDefault();
    if (!targetProjectId) {
      addToast('Please select a project to attach the checklist to', 'error');
      return;
    }

    try {
      setIsInstantiating(true);
      const tplId = instantiatingTpl._id || instantiatingTpl.id;
      await templateApi.instantiate(tplId, targetProjectId, instantiateTitle.trim());
      addToast(`Checklist instantiated to selected project!`);
      setIsInstantiateOpen(false);
    } catch (err) {
      addToast('Instantiation failed: ' + err.message, 'error');
    } finally {
      setIsInstantiating(false);
    }
  };

  // Add Section to New Template Form
  const handleAddSection = () => {
    setNewTpl(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `sec-${Date.now()}`,
          name: `Phase ${prev.sections.length + 1}: Execution`,
          items: []
        }
      ]
    }));
  };

  // Add Item to Section in New Template Form
  const handleAddItem = (secIdx) => {
    setNewTpl(prev => {
      const updated = { ...prev };
      updated.sections[secIdx].items.push({
        id: `itm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        text: '',
        priority: 'Medium',
        defaultAssigneeRole: '',
        description: '',
      });
      return updated;
    });
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTpl.name.trim()) {
      addToast('Template name is required', 'error');
      return;
    }

    try {
      await templateApi.create({
        ...newTpl,
        tags: newTpl.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      addToast(`Custom template "${newTpl.name}" created!`);
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      addToast('Failed to create template: ' + err.message, 'error');
    }
  };

  const categories = ['All', 'Engineering', 'Cloud Ops', 'Security & Audit', 'Client Onboarding', 'Quality Assurance'];

  const filtered = templates.filter(t => {
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-radora-500/15 border border-radora-500/30 text-radora-700 dark:text-radora-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-radora-500 dark:text-radora-400" />
            Standardized Operational Procedures
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Radora Checklist Template Library
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Standardize and replicate operational excellence. Instantiate pre-engineered audit, launch, and QA checklists into any project with one click.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-radora-600 hover:bg-radora-500 text-white text-xs font-bold shadow-lg shadow-radora-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Template</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === c
                  ? 'bg-radora-600 text-white border-radora-600 shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:border-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500 shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Templates & Preview Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Templates List */}
        <div className="lg:col-span-6 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading templates...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
              No checklist templates match your filter.
            </div>
          ) : (
            filtered.map(tpl => {
              const isSelected = previewTemplate?._id === tpl._id || previewTemplate?.id === tpl.id;
              const totalItems = (tpl.sections || []).reduce((acc, s) => acc + (s.items?.length || 0), 0);

              return (
                <div
                  key={tpl._id || tpl.id}
                  onClick={() => setPreviewTemplate(tpl)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-radora-50/70 border-radora-400 dark:bg-slate-850 dark:border-radora-500/60 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-radora-700 dark:text-radora-300 border border-slate-200 dark:border-slate-700">
                      {tpl.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {tpl.isBuiltin && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          Radora Official
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromptDelete(tpl);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all"
                        title={`Delete Template "${tpl.name}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {tpl.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{tpl.sections?.length || 0} phases ({totalItems} items)</span>
                      </span>
                      {tpl.estimatedHours > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>~{tpl.estimatedHours}h</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromptDelete(tpl);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 text-xs font-semibold transition-all"
                        title={`Delete Template "${tpl.name}"`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInstantiate(tpl);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-radora-50 hover:bg-radora-100 text-radora-700 border border-radora-200 dark:bg-radora-600/20 dark:hover:bg-radora-600/40 dark:text-radora-300 dark:border-radora-500/30 text-xs font-semibold transition-all"
                      >
                        <Send className="w-3 h-3" />
                        <span>Use in Project</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Template Detail Preview Column */}
        <div className="lg:col-span-6">
          {previewTemplate ? (
            <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {previewTemplate.category}
                    </span>
                    {previewTemplate.isBuiltin && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Radora Official
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {previewTemplate.name}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {previewTemplate.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePromptDelete(previewTemplate)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 dark:text-rose-300 text-xs font-bold transition-all shadow-sm"
                    title="Delete this template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Template</span>
                  </button>
                  <button
                    onClick={() => handleOpenInstantiate(previewTemplate)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-radora-600 hover:bg-radora-500 text-white text-xs font-bold shadow-md shadow-radora-600/30 transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Instantiate</span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {previewTemplate.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Phases and tasks */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Blueprint Structure ({previewTemplate.sections?.length || 0} Sections)
                </span>

                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {(previewTemplate.sections || []).map((sec, sIdx) => (
                    <div key={sec.id || sIdx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span>{sec.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {sec.items?.length || 0} tasks
                        </span>
                      </div>
                      <div className="divide-y divide-slate-200 dark:divide-slate-900">
                        {(sec.items || []).map((itm, iIdx) => (
                          <div key={itm.id || iIdx} className="py-2 first:pt-1 last:pb-0">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-800 dark:text-slate-200 font-medium">{itm.text}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded uppercase border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                {itm.priority}
                              </span>
                            </div>
                            {itm.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{itm.description}</p>
                            )}
                            {itm.guidelines && (
                              <p className="text-[10px] text-radora-600 dark:text-radora-400/80 italic mt-0.5">Tip: {itm.guidelines}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
              Select a template to view blueprint details.
            </div>
          )}
        </div>

      </div>

      {/* Instantiate to Project Modal */}
      {isInstantiateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Instantiate Template to Project
              </h3>
              <button onClick={() => setIsInstantiateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteInstantiate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Project
                </label>
                <select
                  required
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                >
                  {projects.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Checklist Instance Name
                </label>
                <input
                  type="text"
                  required
                  value={instantiateTitle}
                  onChange={(e) => setInstantiateTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInstantiateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInstantiating}
                  className="px-5 py-2 rounded-xl bg-radora-600 hover:bg-radora-500 text-white text-xs font-bold transition-all"
                >
                  {isInstantiating ? 'Instantiating...' : 'Instantiate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Custom Template Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Radora Checklist Template</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radora SOC2 Audit Checklist"
                    value={newTpl.name}
                    onChange={(e) => setNewTpl({ ...newTpl, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select
                    value={newTpl.category}
                    onChange={(e) => setNewTpl({ ...newTpl, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Cloud Ops">Cloud Ops</option>
                    <option value="Security & Audit">Security & Audit</option>
                    <option value="Client Onboarding">Client Onboarding</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={newTpl.description}
                  onChange={(e) => setNewTpl({ ...newTpl, description: e.target.value })}
                  placeholder="Template objective and scope..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                />
              </div>

              {/* Sections */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Sections & Default Tasks</h4>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3 py-1 rounded bg-radora-50 text-radora-700 border border-radora-200 dark:bg-radora-600/20 dark:text-radora-300 dark:border-radora-500/30 text-xs font-semibold"
                  >
                    + Add Section
                  </button>
                </div>

                {newTpl.sections.map((sec, secIdx) => (
                  <div key={sec.id} className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                    <input
                      type="text"
                      required
                      value={sec.name}
                      onChange={(e) => {
                        const updated = [...newTpl.sections];
                        updated[secIdx].name = e.target.value;
                        setNewTpl({ ...newTpl, sections: updated });
                      }}
                      className="w-full font-bold text-xs text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 outline-none focus:border-radora-500"
                      placeholder="Section Title"
                    />

                    <div className="space-y-2">
                      {sec.items.map((itm, itmIdx) => (
                        <div key={itm.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Task item..."
                            value={itm.text}
                            onChange={(e) => {
                              const updated = [...newTpl.sections];
                              updated[secIdx].items[itmIdx].text = e.target.value;
                              setNewTpl({ ...newTpl, sections: updated });
                            }}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                          <select
                            value={itm.priority}
                            onChange={(e) => {
                              const updated = [...newTpl.sections];
                              updated[secIdx].items[itmIdx].priority = e.target.value;
                              setNewTpl({ ...newTpl, sections: updated });
                            }}
                            className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddItem(secIdx)}
                        className="text-[11px] text-radora-600 dark:text-radora-400 hover:underline pt-1"
                      >
                        + Add Task to {sec.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-radora-600 hover:bg-radora-500 text-white text-xs font-bold"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Template
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] mb-0.5 font-semibold uppercase">Template Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{templateToDelete.name}</span>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Category: <strong className="text-slate-700 dark:text-slate-300">{templateToDelete.category}</strong></span>
                <span>•</span>
                <span>Phases: <strong className="text-slate-700 dark:text-slate-300">{templateToDelete.sections?.length || 0}</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete this template from the Radora library? Projects with existing checklists instantiated from this template will remain intact.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Template'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
