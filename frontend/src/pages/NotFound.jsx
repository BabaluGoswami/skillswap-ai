import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

/**
 * Creative 404 Page.
 * Supports dark mode theme settings.
 */
const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 space-y-6 bg-grid-pattern theme-transition">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-3xl animate-bounce transition-colors duration-300">
        <Compass className="h-16 w-16" />
      </div>
      
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-6xl text-indigo-950 dark:text-indigo-400 transition-colors duration-300">404</h1>
        <h2 className="font-display font-bold text-xl text-slate-800 dark:text-white transition-colors duration-300">Oops! Lost in the Swap</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed transition-colors duration-300">
          The page you are looking for does not exist or has been relocated. Let us get you back to learning!
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
      >
        <Home className="h-4 w-4" />
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
