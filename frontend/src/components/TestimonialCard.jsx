import React from 'react';
import { Star } from 'lucide-react';

/**
 * Reusable Card component for Testimonials.
 * Supports dark mode theme settings.
 */
const TestimonialCard = ({ quote, author, role, rating = 5 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Render rating stars */}
        <div className="flex gap-1 mb-5">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6 transition-colors duration-300">
          "{quote}"
        </p>
      </div>
      
      <div className="flex items-center gap-4 border-t border-slate-50 dark:border-slate-800 pt-5 mt-auto transition-colors duration-300">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold font-display flex items-center justify-center text-sm">
          {author.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white transition-colors duration-300">{author}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
