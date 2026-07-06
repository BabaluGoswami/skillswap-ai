import React from 'react';

/**
 * Reusable card for upcoming & core features.
 * Features a modern gradient borders, premium shadow effects, and optional badges.
 * Supports dark mode out of the box.
 */
const FeatureCard = ({ title, description, icon: Icon, badge }) => {
  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-100 dark:hover:border-indigo-950 rounded-3xl p-8 hover:shadow-xl hover:shadow-indigo-50/40 hover:-translate-y-1 transition-all duration-300">
      {/* Dynamic Background hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-blue-50/20 dark:from-indigo-950/5 dark:to-blue-950/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10" />
      
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-blue-500 group-hover:text-white transition-all duration-300">
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 transition-colors duration-300">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-indigo-950 dark:group-hover:text-indigo-200 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
