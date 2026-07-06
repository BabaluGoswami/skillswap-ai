import React from 'react';

/**
 * Reusable premium Empty State component.
 * Displays a descriptive state with an icon and optional CTA button.
 * Fully supports dark mode styling out of the box.
 */
const EmptyState = ({ icon: Icon, title, description, actionText, onActionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-slate-100 dark:border-slate-800/60 rounded-3xl bg-white dark:bg-slate-900/60 shadow-sm transition-colors duration-300">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4 transition-colors duration-300">
        <Icon className="h-8 w-8" />
      </div>
      
      <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">
        {title}
      </h4>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6 transition-colors duration-300">
        {description}
      </p>

      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all duration-300 shadow-md shadow-indigo-100 dark:shadow-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
