import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, CheckSquare } from 'lucide-react';
import { checklistApi } from '../api/client';
import { useToast } from './Toast';

export const ChecklistBuilderModal = ({ isOpen, onClose, projectId, onChecklistCreated }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [description, setDescription] = useState('');

  const [sections, setSections] = useState([
    {
      id: 'sec-1',
      name: 'Phase 1: Initial Assessment',
      items: [
        { id: 'itm-1', text: 'Architecture and security review sign-off', priority: 'High', assignee: '', dueDate: '' },
      ],
    },
  ]);

  if (!isOpen) return null;

  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        name: `Phase ${prev.length + 1}: Implementation`,
        items: [],
      },
    ]);
  };

  const handleRemoveSection = (secIdx) => {
    setSections(prev => prev.filter((_, idx) => idx !== secIdx));
  };

  const handleSectionNameChange = (secIdx, name) => {
    setSections(prev => {
      const updated = [...prev];
      updated[secIdx].name = name;
      return updated;
    });
  };

  const handleAddItem = (secIdx) => {
    setSections(prev => {
      const updated = [...prev];
      updated[secIdx].items.push({
        id: `itm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        text: '',
        priority: 'Medium',
        assignee: '',
        dueDate: '',
      });
      return updated;
    });
  };

  const handleItemChange = (secIdx, itmIdx, field, value) => {
    setSections(prev => {
      const updated = [...prev];
      updated[secIdx].items[itmIdx][field] = value;
      return updated;
    });
  };

  const handleRemoveItem = (secIdx, itmIdx) => {
    setSections(prev => {
      const updated = [...prev];
      updated[secIdx].items = updated[secIdx].items.filter((_, idx) => idx !== itmIdx);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Checklist title is required', 'error');
      return;
    }

    if (sections.length === 0) {
      addToast('Add at least one section', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    for (const sec of sections) {
      for (const item of sec.items) {
        if (item.dueDate && item.dueDate < today) {
          addToast(`Due date for "${item.text || 'item'}" cannot be in the past.`, 'error');
          return;
        }
      }
    }

    try {
      setLoading(true);
      const payload = {
        projectId,
        title: title.trim(),
        category,
        description: description.trim(),
        sections,
      };

      const res = await checklistApi.create(payload);
      addToast(`Checklist "${res.data.data.title}" created successfully!`);
      onChecklistCreated(res.data.data);
      onClose();
    } catch (err) {
      addToast('Failed to create checklist: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-radora-500/15 text-radora-700 dark:text-radora-400 border border-radora-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Custom Checklist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Design custom checklist phases and actionable verification tasks
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Checklist Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Infrastructure Deployment Checklist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-radora-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Cloud Ops">Cloud Ops</option>
                <option value="Security & Audit">Security & Audit</option>
                <option value="Client Onboarding">Client Onboarding</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Product">Product</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Outline checklist goals and acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
            />
          </div>

          {/* Dynamic Sections */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Checklist Sections & Tasks
              </h3>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-radora-50 hover:bg-radora-100 text-radora-700 border border-radora-200 dark:bg-radora-600/20 dark:hover:bg-radora-600/30 dark:text-radora-300 dark:border-radora-500/30 text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            {sections.map((sec, secIdx) => (
              <div key={sec.id} className="p-4 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    required
                    value={sec.name}
                    onChange={(e) => handleSectionNameChange(secIdx, e.target.value)}
                    className="flex-1 font-bold text-xs text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-radora-500 py-1 outline-none"
                    placeholder="Section Name"
                  />
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(secIdx)}
                      className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 p-1 transition-colors"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tasks inside Section */}
                <div className="space-y-2">
                  {sec.items.map((item, itmIdx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Task description (e.g. Verify DNS propagation)"
                        value={item.text}
                        onChange={(e) => handleItemChange(secIdx, itmIdx, 'text', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-radora-500"
                      />
                      <select
                        value={item.priority}
                        onChange={(e) => handleItemChange(secIdx, itmIdx, 'priority', e.target.value)}
                        className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Assignee"
                        value={item.assignee}
                        onChange={(e) => handleItemChange(secIdx, itmIdx, 'assignee', e.target.value)}
                        className="w-28 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                      />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={item.dueDate || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const todayStr = new Date().toISOString().split('T')[0];
                          if (val && val < todayStr) {
                            addToast('Due date cannot be in the past. Please select today or a future date.', 'warning');
                            return;
                          }
                          handleItemChange(secIdx, itmIdx, 'dueDate', val);
                        }}
                        title="Due Date (Today or Future Only)"
                        className="w-32 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-radora-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(secIdx, itmIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddItem(secIdx)}
                    className="text-[11px] text-radora-600 dark:text-radora-400 hover:text-radora-700 dark:hover:text-radora-300 flex items-center gap-1 font-semibold pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task to {sec.name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
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
              {loading ? 'Creating...' : 'Create Checklist'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
