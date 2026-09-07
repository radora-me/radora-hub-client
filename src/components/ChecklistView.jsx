import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertOctagon,
  Clock,
  FastForward,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
  CheckCheck,
  MessageSquare,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react';
import { checklistApi } from '../api/client';
import { useToast } from './Toast';

const statusStyles = {
  'Completed': {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
  },
  'In Progress': {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
  },
  'Blocked': {
    icon: AlertOctagon,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40 animate-pulse',
  },
  'Skipped': {
    icon: FastForward,
    color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-600/30',
  },
  'Pending': {
    icon: Circle,
    color: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40',
  },
};

const priorityStyles = {
  'Critical': 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
  'High': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  'Medium': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  'Low': 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
};

export const ChecklistView = ({ checklist, onChecklistUpdated, onDeleteChecklist }) => {
  const { addToast } = useToast();
  const [collapsedSections, setCollapsedSections] = useState({});
  const [addingItemToSection, setAddingItemToSection] = useState(null);
  const [addingNewSection, setAddingNewSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [activeNotesItem, setActiveNotesItem] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  // Portal & Search filters
  const [portalFilter, setPortalFilter] = useState('All');
  const [checklistSearch, setChecklistSearch] = useState('');

  const [newItemForm, setNewItemForm] = useState({
    text: '',
    description: '',
    priority: 'Medium',
    assignee: '',
    dueDate: '',
  });

  // Extract unique portals
  const portalOptions = useMemo(() => {
    const portals = new Set(['All']);
    (checklist.sections || []).forEach(sec => {
      if (sec.name.includes('Admin')) portals.add('Admin Portal');
      else if (sec.name.includes('Teacher')) portals.add('Teacher Portal');
      else if (sec.name.includes('Student')) portals.add('Student Portal');
      else if (sec.name.includes('Parent')) portals.add('Parent Portal');
      else if (sec.name.includes('Staff')) portals.add('Staff Portal');
      else if (sec.name.includes('Finance') || sec.name.includes('Accountant')) portals.add('Accountant / Finance');
    });
    portals.add('Workflows');
    return Array.from(portals);
  }, [checklist.sections]);

  // Filter sections
  const filteredSections = useMemo(() => {
    return (checklist.sections || []).filter(sec => {
      // Portal filter
      if (portalFilter === 'Workflows') {
        if (!sec.name.includes('[Workflow]')) return false;
      } else if (portalFilter !== 'All') {
        if (!sec.name.includes(portalFilter.replace(' Portal', ''))) return false;
      }

      // Search filter
      if (checklistSearch.trim()) {
        const q = checklistSearch.toLowerCase();
        const secMatch = sec.name.toLowerCase().includes(q);
        const itemMatch = (sec.items || []).some(
          i => i.text.toLowerCase().includes(q) || (i.notes && i.notes.toLowerCase().includes(q))
        );
        return secMatch || itemMatch;
      }

      return true;
    });
  }, [checklist.sections, portalFilter, checklistSearch]);

  const toggleSection = (secId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const expandAll = () => {
    setCollapsedSections({});
    addToast('Expanded all sections');
  };

  const collapseAll = () => {
    const next = {};
    (checklist.sections || []).forEach(sec => {
      next[sec.id] = true;
    });
    setCollapsedSections(next);
    addToast('Collapsed all sections');
  };

  const handleStatusChange = async (sectionId, itemId, newStatus) => {
    try {
      const res = await checklistApi.updateItem(checklist._id || checklist.id, sectionId, itemId, {
        status: newStatus,
      });
      onChecklistUpdated(res.data.data);
      addToast(`Status updated to ${newStatus}`);
    } catch (err) {
      addToast('Failed to update item: ' + err.message, 'error');
    }
  };

  const handleToggleCheck = async (sectionId, item) => {
    const nextStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
    await handleStatusChange(sectionId, item.id || item._id, nextStatus);
  };

  const handleSaveNotes = async (sectionId, itemId) => {
    try {
      const res = await checklistApi.updateItem(checklist._id || checklist.id, sectionId, itemId, {
        notes: noteInput,
      });
      onChecklistUpdated(res.data.data);
      setActiveNotesItem(null);
      addToast('Notes saved successfully');
    } catch (err) {
      addToast('Failed to save notes: ' + err.message, 'error');
    }
  };

  const handleAddItem = async (sectionId) => {
    if (!newItemForm.text.trim()) {
      addToast('Item title is required', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (newItemForm.dueDate && newItemForm.dueDate < today) {
      addToast('Due date cannot be in the past. Please select today or a future date.', 'error');
      return;
    }

    try {
      const res = await checklistApi.addItem(checklist._id || checklist.id, sectionId, newItemForm);
      onChecklistUpdated(res.data.data);
      setAddingItemToSection(null);
      setNewItemForm({ text: '', description: '', priority: 'Medium', assignee: '', dueDate: '' });
      addToast('Item added to checklist');
    } catch (err) {
      addToast('Failed to add item: ' + err.message, 'error');
    }
  };

  const handleDeleteItem = async (sectionId, itemId) => {
    try {
      const res = await checklistApi.deleteItem(checklist._id || checklist.id, sectionId, itemId);
      onChecklistUpdated(res.data.data);
      addToast('Item removed');
    } catch (err) {
      addToast('Failed to remove item: ' + err.message, 'error');
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      const res = await checklistApi.addSection(checklist._id || checklist.id, newSectionName.trim());
      onChecklistUpdated(res.data.data);
      setNewSectionName('');
      setAddingNewSection(false);
      addToast('Section added to checklist');
    } catch (err) {
      addToast('Failed to add section: ' + err.message, 'error');
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const res = await checklistApi.bulkAction(checklist._id || checklist.id, action);
      onChecklistUpdated(res.data.data);
      addToast(action === 'complete_all' ? 'All items marked as Completed' : 'Checklist reset to Pending');
    } catch (err) {
      addToast('Bulk action failed: ' + err.message, 'error');
    }
  };

  const exportAsMarkdown = () => {
    let md = `# Radora Hub: ${checklist.title}\n`;
    md += `**Category:** ${checklist.category} | **Progress:** ${checklist.progress}% (${checklist.completedItems}/${checklist.totalItems})\n\n`;
    if (checklist.description) md += `*${checklist.description}*\n\n`;

    (checklist.sections || []).forEach(sec => {
      md += `## ${sec.name}\n`;
      (sec.items || []).forEach(itm => {
        const mark = itm.status === 'Completed' ? '[x]' : '[ ]';
        md += `- ${mark} **${itm.text}** (Status: ${itm.status}, Priority: ${itm.priority}${itm.assignee ? `, Assignee: ${itm.assignee}` : ''})\n`;
        if (itm.description) md += `  - *Detail:* ${itm.description}\n`;
        if (itm.notes) md += `  - *Notes:* ${itm.notes}\n`;
      });
      md += '\n';
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${checklist.title.replace(/\s+/g, '_')}_checklist.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Checklist exported to Markdown');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      
      {/* Checklist Header */}
      <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-radora-50 dark:bg-radora-600/20 text-radora-700 dark:text-radora-300 border border-radora-200 dark:border-radora-500/30">
                {checklist.category || 'Architecture'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {checklist.completedItems || 0} / {checklist.totalItems || 0} tasks completed
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {checklist.title}
            </h2>
            {checklist.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {checklist.description}
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('complete_all')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold transition-all"
              title="Mark all items complete"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Complete All</span>
            </button>

            <button
              onClick={() => handleBulkAction('reset_all')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all"
              title="Reset all tasks to pending"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={exportAsMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all"
              title="Export report as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => onDeleteChecklist(checklist._id || checklist.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors"
              title="Delete this checklist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Overall Build & QA Velocity</span>
              <span className="text-[11px] text-slate-500">({checklist.sections?.length || 0} Modules)</span>
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-base">{checklist.progress || 0}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                (checklist.progress || 0) === 100
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-radora-600 via-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(checklist.progress || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Portal Tabs + Search + Expand/Collapse */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
        {/* Portal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {portalOptions.map(p => (
            <button
              key={p}
              onClick={() => setPortalFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                portalFilter === p
                  ? 'bg-radora-600 text-white border-radora-600 shadow-md shadow-radora-600/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search & Collapse Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={checklistSearch}
              onChange={(e) => setChecklistSearch(e.target.value)}
              placeholder="Search across modules & features (e.g. Attendance, Invoice, SAML)..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredSections.length} of {checklist.sections?.length || 0} modules
            </span>

            <button
              onClick={expandAll}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium shadow-sm"
            >
              Expand All
            </button>

            <button
              onClick={collapseAll}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium shadow-sm"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {filteredSections.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-transparent">
            No sections match the current portal filter or search query.
          </div>
        ) : (
          filteredSections.map((section, sIdx) => {
            const isCollapsed = collapsedSections[section.id];
            const secTotal = section.items?.length || 0;
            const secCompleted = section.items?.filter(i => i.status === 'Completed' || i.status === 'Skipped').length || 0;
            const secProg = secTotal > 0 ? Math.round((secCompleted / secTotal) * 100) : 0;
            const isWorkflow = section.name.includes('[Workflow]');

            return (
              <div
                key={section.id || sIdx}
                className={`border rounded-2xl transition-all shadow-sm ${
                  isWorkflow
                    ? 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40'
                }`}
              >
                {/* Section Header */}
                <div
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between px-4 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-850/60 dark:hover:bg-slate-800/60 cursor-pointer rounded-t-2xl border-b border-slate-200 dark:border-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-wide flex items-center gap-2">
                      <span>{section.name}</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {secCompleted}/{secTotal}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Mini Progress */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            secProg === 100 ? 'bg-emerald-500' : 'bg-radora-500'
                          }`}
                          style={{ width: `${secProg}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{secProg}%</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingItemToSection(addingItemToSection === section.id ? null : section.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-radora-50 dark:bg-radora-600/20 hover:bg-radora-100 dark:hover:bg-radora-600/30 text-radora-700 dark:text-radora-300 border border-radora-200 dark:border-radora-500/30 text-xs font-medium transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Section Items */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-850/80">
                    {/* Inline Add Item Form */}
                    {addingItemToSection === section.id && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-b border-radora-200 dark:border-radora-500/30 animate-fade-in">
                        <h4 className="text-xs font-semibold text-radora-700 dark:text-radora-300 mb-2">
                          Add New Feature to "{section.name}"
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Feature title..."
                            value={newItemForm.text}
                            onChange={(e) => setNewItemForm({ ...newItemForm, text: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                              <select
                                value={newItemForm.priority}
                                onChange={(e) => setNewItemForm({ ...newItemForm, priority: e.target.value })}
                                className="w-full px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Assignee</label>
                              <input
                                type="text"
                                placeholder="e.g. Radora Dev"
                                value={newItemForm.assignee}
                                onChange={(e) => setNewItemForm({ ...newItemForm, assignee: e.target.value })}
                                className="w-full px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] text-slate-500 dark:text-slate-400">Due Date</label>
                                <span className="text-[9px] text-radora-600 dark:text-radora-400 font-medium">Future only</span>
                              </div>
                              <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={newItemForm.dueDate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const todayStr = new Date().toISOString().split('T')[0];
                                  if (val && val < todayStr) {
                                    addToast('Due date cannot be in the past. Please select a future date.', 'warning');
                                    return;
                                  }
                                  setNewItemForm({ ...newItemForm, dueDate: val });
                                }}
                                className="w-full px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setAddingItemToSection(null)}
                              className="px-3 py-1 rounded text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddItem(section.id)}
                              className="px-4 py-1 rounded bg-radora-600 hover:bg-radora-500 text-white text-xs font-semibold"
                            >
                              Add Feature
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Task Rows */}
                    {(section.items || []).map((item) => {
                      const statusInfo = statusStyles[item.status] || statusStyles['Pending'];
                      const priorityClass = priorityStyles[item.priority] || priorityStyles['Medium'];
                      const isCompleted = item.status === 'Completed';
                      const isBlocked = item.status === 'Blocked';

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 transition-all duration-200 ${
                            isCompleted ? 'bg-slate-50/60 dark:bg-slate-950/20' : isBlocked ? 'bg-rose-50/50 dark:bg-rose-950/10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-850/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            
                            {/* Checkbox + Title */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleCheck(section.id, item)}
                                className="mt-0.5 shrink-0 transition-transform active:scale-90"
                                title={`Mark as ${isCompleted ? 'Pending' : 'Completed'}`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                                ) : isBlocked ? (
                                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-radora-500" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm font-medium ${
                                  isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                                }`}>
                                  {item.text}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase tracking-wider ${priorityClass}`}>
                                    {item.priority}
                                  </span>

                                  {item.assignee && (
                                    <span className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                      <User className="w-2.5 h-2.5 text-slate-400" />
                                      <span>{item.assignee}</span>
                                    </span>
                                  )}

                                  {item.dueDate && (
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
                                      item.dueDate < new Date().toISOString().split('T')[0]
                                        ? 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800'
                                        : 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800'
                                    }`}>
                                      <Calendar className="w-2.5 h-2.5" />
                                      <span>Due: {item.dueDate}</span>
                                    </span>
                                  )}

                                  {/* Notes Button */}
                                  <button
                                    onClick={() => {
                                      if (activeNotesItem === item.id) {
                                        setActiveNotesItem(null);
                                      } else {
                                        setActiveNotesItem(item.id);
                                        setNoteInput(item.notes || '');
                                      }
                                    }}
                                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                      item.notes
                                        ? 'text-radora-700 bg-radora-50 border-radora-200 dark:text-radora-300 dark:bg-radora-950/40 dark:border-radora-700/50'
                                        : 'text-slate-500 bg-slate-100 border-slate-200 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:hover:text-slate-300'
                                    }`}
                                  >
                                    <MessageSquare className="w-2.5 h-2.5" />
                                    <span>{item.notes ? 'View Notes' : '+ Note'}</span>
                                  </button>
                                </div>

                                {/* Notes Drawer */}
                                {activeNotesItem === item.id && (
                                  <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 animate-fade-in">
                                    <textarea
                                      rows={2}
                                      value={noteInput}
                                      onChange={(e) => setNoteInput(e.target.value)}
                                      placeholder="Add build or QA verification notes..."
                                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setActiveNotesItem(null)}
                                        className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                      >
                                        Close
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveNotes(section.id, item.id)}
                                        className="px-3 py-0.5 rounded bg-radora-600 hover:bg-radora-500 text-white text-xs font-semibold"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status Dropdown */}
                            <div className="flex items-center gap-2 shrink-0">
                              <select
                                value={item.status}
                                onChange={(e) => handleStatusChange(section.id, item.id, e.target.value)}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border focus:outline-none cursor-pointer bg-white dark:bg-slate-900 ${statusInfo.color}`}
                              >
                                <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">Pending</option>
                                <option value="In Progress" className="bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300">In Progress</option>
                                <option value="Completed" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-300">Completed</option>
                                <option value="Blocked" className="bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-300">Blocked</option>
                                <option value="Skipped" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">Skipped</option>
                              </select>

                              <button
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Section Button */}
        <div className="pt-2">
          {addingNewSection ? (
            <form onSubmit={handleAddSection} className="p-4 bg-white dark:bg-slate-900 border border-radora-300 dark:border-radora-500/40 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add New Module Section</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. 7. Integrations & Third-Party APIs"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="flex-1 px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-radora-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-radora-600 hover:bg-radora-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setAddingNewSection(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingNewSection(true)}
              className="w-full py-3 border border-dashed border-slate-300 dark:border-slate-700/80 hover:border-radora-400 dark:hover:border-radora-500/50 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-radora-600 dark:hover:text-radora-300 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Module Section</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
