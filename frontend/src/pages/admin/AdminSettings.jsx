import React from 'react';
import { Settings } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm min-h-[50vh] flex flex-col items-center justify-center">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-550 rounded-full w-fit mx-auto">
        <Settings className="h-10 w-10 animate-spin-slow" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white">
          System Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Platform parameters, SMTP configurations, and security policies will be available in a future phase.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
