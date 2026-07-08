import React, { useState, useEffect } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { 
  MessageSquare, Star, Calendar, 
  ExternalLink, ChevronLeft, ChevronRight, MessageSquareWarning 
} from 'lucide-react';

/**
 * Page displaying paginated feedback history for the authenticated user.
 */
const MyFeedback = () => {
  const { getMyFeedback } = useApp();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError('');
      const res = await getMyFeedback(page, 5); // 5 items per page
      setLoading(false);
      if (res.success) {
        setFeedbackList(res.data.items || []);
        setTotalPages(res.data.pages || 1);
        setTotalItems(res.data.total || 0);
      } else {
        setError(res.error || 'Failed to retrieve feedback list.');
      }
    };
    fetchFeedback();
  }, [page]);

  const getStatusBadge = (status) => {
    const styles = {
      'Open': 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-150',
      'In Progress': 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450 border-amber-200',
      'Resolved': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-150',
      'Closed': 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    };
    return styles[status] || styles['Open'];
  };

  const getCategoryBadge = (type) => {
    const styles = {
      'Report a Bug': 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450',
      'Suggest a Feature': 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400',
      'General Feedback': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    };
    return styles[type] || styles['General Feedback'];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 theme-transition min-h-[75vh]">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white tracking-tight">
          My Submissions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track and view all bug reports, feature suggestions, and general feedback submitted to SkillSwap AI.
        </p>
      </div>

      {/* Main Content */}
      {loading ? (
        /* Skeleton Loaders */
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-6 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-3xl p-6 text-center text-rose-700 dark:text-rose-450 space-y-2">
          <MessageSquareWarning className="h-8 w-8 mx-auto" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      ) : feedbackList.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-slate-400 rounded-full w-fit mx-auto">
            <MessageSquare className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white">
              No Submissions Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              You haven't reported any bugs or sent suggestions yet. Use the feedback button in the corner to share your thoughts.
            </p>
          </div>
        </div>
      ) : (
        /* Feedback Card List */
        <div className="space-y-6">
          <div className="space-y-4">
            {feedbackList.map((item) => (
              <div 
                key={item._id} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* ID & Badges Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400 font-medium">
                      #{item._id.substring(item._id.length - 8).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold ${getCategoryBadge(item.type)}`}>
                      {item.type}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-4 w-4 ${
                          star <= item.rating 
                            ? 'fill-amber-450 text-amber-450' 
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words whitespace-pre-line">
                    {item.description}
                  </p>
                </div>

                {/* Screenshot & Admin Notes Area */}
                {(item.screenshot || item.adminNote) && (
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Screenshot Preview */}
                    {item.screenshot && (
                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Screenshot
                        </span>
                        <a 
                          href={item.screenshot} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group/link"
                        >
                          View Attachment
                          <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    )}

                    {/* Admin Note Box */}
                    {item.adminNote && (
                      <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Response from Support
                        </span>
                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                          {item.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{item.routeName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing page <strong className="font-semibold text-slate-900 dark:text-white">{page}</strong> of <strong className="font-semibold text-slate-900 dark:text-white">{totalPages}</strong> ({totalItems} submissions)
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/65 rounded-xl disabled:opacity-50 transition-all text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/65 rounded-xl disabled:opacity-50 transition-all text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyFeedback;
