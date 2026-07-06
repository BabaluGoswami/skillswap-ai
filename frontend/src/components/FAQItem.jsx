import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable FAQ accordion item component.
 * Supports dark mode theme settings.
 */
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left font-display font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
      >
        <span>{question}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100 border-t border-slate-50 dark:border-slate-800/80' : 'max-h-0 opacity-0'
      }`}>
        <p className="p-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 transition-colors duration-300">
          {answer}
        </p>
      </div>
    </div>
  );
};

export default FAQItem;
