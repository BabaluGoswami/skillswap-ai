import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';
import { useApp } from '@context/AppContext.jsx';

/**
 * Floating action button placed in bottom-right corner.
 * Triggers feedback modal; hides on auth routes (login, register, forgot-password).
 */
const FloatingFeedbackButton = () => {
  const { isAuthenticated, setIsFeedbackModalOpen, setFeedbackInitialType } = useApp();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);

  const hideRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/chat'];
  const shouldHide = hideRoutes.includes(location.pathname) || !isAuthenticated || location.pathname.startsWith('/admin');

  if (shouldHide) return null;

  const handleClick = () => {
    setFeedbackInitialType('General Feedback');
    setIsFeedbackModalOpen(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-45">
      {/* Tooltip Overlay */}
      {showTooltip && (
        <div className="absolute right-0 bottom-14 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-slate-800 dark:border-slate-100 whitespace-nowrap animate-fade-in">
          Feedback
        </div>
      )}
      
      {/* Floating Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
        className="p-3.5 rounded-full shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all cursor-pointer group flex items-center justify-center border border-indigo-500/20 hover:scale-105"
      >
        <MessageSquarePlus className="h-6 w-6 group-hover:rotate-6 transition-transform duration-200" />
      </button>
    </div>
  );
};

export default FloatingFeedbackButton;
