import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckSquare, Clock, ArrowRight, Layers } from 'lucide-react';
import { templateApi } from '../api/client';
import { useToast } from './Toast';

export const TemplateSelectorModal = ({ isOpen, onClose, projectId, onTemplateInstantiated }) => {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [instantiating, setInstantiating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customTitle, setCustomTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateApi.getAll();
      setTemplates(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedTemplate(res.data.data[0]);
        setCustomTitle(`${res.data.data[0].name} - Run`);
      }
    } catch (err) {
      addToast('Failed to load templates: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setCustomTitle(`${tpl.name} - Run`);
  };

  const handleInstantiate = async () => {
    if (!selectedTemplate) return;

    try {
      setInstantiating(true);
      const tplId = selectedTemplate._id || selectedTemplate.id;
      const res = await templateApi.instantiate(tplId, projectId, customTitle.trim());
      addToast(`Checklist "${res.data.data.title}" successfully instantiated!`);
      onTemplateInstantiated(res.data.data);
      onClose();
    } catch (err) {
      addToast('Error creating checklist from template: ' + err.message, 'error');
    } finally {
      setInstantiating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-radora-500/15 text-radora-700 dark:text-radora-400 border border-radora-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Checklist from Radora Template
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a pre-engineered Radora blueprint to instantiate into this project
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

        {/* Content Split: List & Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* Left Column: Template List */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-2.5 max-h-[50vh] md:max-h-none bg-slate-50/50 dark:bg-transparent">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading templates...</div>
            ) : templates.map(tpl => {
              const isSelected = selectedTemplate?._id === tpl._id || selectedTemplate?.id === tpl.id;
              const totalItems = (tpl.sections || []).reduce((acc, s) => acc + (s.items?.length || 0), 0);

              return (
                <div
                  key={tpl._id || tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-radora-50/80 border-radora-400 dark:bg-radora-950/40 dark:border-radora-500/50 shadow-md'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 dark:bg-slate-850/40 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-850/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-radora-700 dark:text-radora-300 border border-slate-200 dark:border-slate-700">
                      {tpl.category}
                    </span>
                    {tpl.isBuiltin && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Standard Radora
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {tpl.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {tpl.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{totalItems} items</span>
                    </span>
                    {tpl.estimatedHours > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>~{tpl.estimatedHours}h est.</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Preview & Custom Title */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedTemplate.name}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Checklist Name for this Project
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-radora-500"
                  />
                </div>

                {/* Section Structure Preview */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Sections & Tasks Included:
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(selectedTemplate.sections || []).map((sec, idx) => (
                      <div key={sec.id || idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                          <span>{sec.name}</span>
                          <span className="text-slate-500 font-normal">{sec.items?.length || 0} tasks</span>
                        </div>
                        <ul className="space-y-1">
                          {(sec.items || []).slice(0, 3).map((item, iIdx) => (
                            <li key={item.id || iIdx} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-radora-500 shrink-0" />
                              <span className="truncate">{item.text}</span>
                            </li>
                          ))}
                          {(sec.items || []).length > 3 && (
                            <li className="text-[10px] text-slate-500 italic pl-3.5">
                              + {(sec.items || []).length - 3} more items...
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select a template from the list to preview details.
              </div>
            )}

            {/* Footer buttons */}
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInstantiate}
                disabled={!selectedTemplate || instantiating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-radora-600 to-indigo-600 hover:from-radora-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-radora-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{instantiating ? 'Instantiating...' : 'Instantiate Checklist'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
