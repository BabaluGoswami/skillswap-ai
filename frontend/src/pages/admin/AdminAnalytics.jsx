import React from 'react';
import { BarChart3 } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm min-h-[50vh] flex flex-col items-center justify-center">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-full w-fit mx-auto">
        <BarChart3 className="h-10 w-10 animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white">
          System Analytics
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Interactive usage charts, match metrics, and login analytics will be available in a future phase.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;
