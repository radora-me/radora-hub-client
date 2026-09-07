import React from 'react';
import {
  Calendar,
  Users,
  Trash2,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  'Planning': { bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  'In Progress': { bg: 'bg-radora-50 dark:bg-radora-500/15 text-radora-600 dark:text-radora-300 border-radora-200 dark:border-radora-500/30' },
  'Under Review': { bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  'Completed': { bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  'On Hold': { bg: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20' },
};

const priorityConfig = {
  'Low': 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40',
  'Medium': 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700/40 bg-blue-50 dark:bg-blue-900/20',
  'High': 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/20',
  'Urgent': 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-700/40 bg-rose-50 dark:bg-rose-900/30 font-bold',
};

export const ProjectCard = ({ project, onSelect, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();
  const status = statusConfig[project.status] || statusConfig['Planning'];
  const priorityClass = priorityConfig[project.priority] || priorityConfig['Medium'];

  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-50/80 dark:hover:bg-slate-850/90 border border-slate-200 dark:border-slate-800 hover:border-radora-400 dark:hover:border-radora-500/40 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
    >
      <div>
        {/* Header row: Code, Category, Priority & Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-radora-700 border-slate-200 dark:bg-slate-800 dark:text-radora-300 dark:border-slate-700 border">
              {project.code || 'RAD'}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-800 border">
              {project.category || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${priorityClass}`}>
              {project.priority}
            </span>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {isAdmin && (
                <button
                  onClick={() => onEdit(project)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Project"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => onDelete(project._id || project.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-radora-600 dark:group-hover:text-radora-300 transition-colors line-clamp-1 mb-1.5">
          {project.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {project.description || 'No detailed description provided for this project.'}
        </p>
      </div>

      {/* Progress & Metadata */}
      <div>
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Checklist Progress</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{project.progress || 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (project.progress || 0) === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-radora-600 to-indigo-500'
              }`}
              style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer info: Status, Due Date, Team */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${status.bg}`}>
            {project.status}
          </span>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            {project.targetDate && (
              <div className="flex items-center gap-1 text-[11px]" title={`Target Date: ${project.targetDate}`}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.targetDate}</span>
              </div>
            )}
            {project.team && project.team.length > 0 && (
              <div className="flex items-center gap-1 text-[11px]" title={`Team Members: ${project.team.join(', ')}`}>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.team.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
