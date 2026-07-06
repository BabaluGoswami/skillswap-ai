import React from 'react';

/**
 * Reusable card for Statistics Section.
 * Supports dark mode theme settings.
 */
const StatisticCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-center gap-6 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl transition-colors duration-300">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
          {value}
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;
