import React from 'react';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  ListTodo
} from 'lucide-react';

export const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Managed Projects',
      value: stats.totalProjects || 0,
      subtext: `${stats.activeProjects || 0} currently in progress`,
      icon: FolderKanban,
      accent: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50',
      border: 'border-blue-200 dark:border-blue-900/40',
    },
    {
      label: 'Active Checklists',
      value: stats.checklistsCount || 0,
      subtext: `${stats.templatesCount || 0} reusable templates`,
      icon: ListTodo,
      accent: 'text-radora-600 dark:text-radora-400 bg-radora-50 dark:bg-radora-950/40 border-radora-200 dark:border-radora-800/50',
      border: 'border-radora-200 dark:border-radora-900/40',
    },
    {
      label: 'Task Completion',
      value: `${stats.overallProgress || 0}%`,
      subtext: `${stats.completedItems || 0} of ${stats.totalItems || 0} items finished`,
      icon: CheckCircle2,
      accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
      border: 'border-emerald-200 dark:border-emerald-900/40',
    },
    {
      label: 'Action & Blockers',
      value: stats.blockedItems || 0,
      subtext: stats.blockedItems > 0 ? 'Requires team intervention' : 'Zero blockers recorded',
      icon: AlertTriangle,
      accent: stats.blockedItems > 0
        ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50'
        : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      border: stats.blockedItems > 0 ? 'border-rose-300 dark:border-rose-900/50' : 'border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border bg-white dark:bg-slate-900/90 shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md ${card.border}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${card.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
