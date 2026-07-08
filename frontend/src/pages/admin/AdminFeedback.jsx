import React, { useState, useEffect } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import { 
  Search, Star, Loader2, AlertCircle, 
  ChevronLeft, ChevronRight, Eye, MessageSquare, ExternalLink, CheckCircle2 
} from 'lucide-react';

const AdminFeedback = () => {
  const { getAdminFeedbacks, updateAdminFeedback } = useApp();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message, type }

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacksCount, setTotalFeedbacksCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Detail Modal State
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState('Open');
  const [modalNote, setModalNote] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');
    const res = await getAdminFeedbacks(page, 10, search, type, status, sortBy);
    setLoading(false);
    if (res.success) {
      setFeedbacks(res.data.items || []);
      setTotalPages(res.data.pages || 1);
      setTotalFeedbacksCount(res.data.total || 0);
    } else {
      setError(res.error || 'Failed to fetch feedback history.');
    }
  };

  // Debounce search term changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Reactive reload on query parameter changes
  useEffect(() => {
    fetchFeedbacks();
  }, [page, search, type, status, sortBy]);

  const handleOpenDetails = (item) => {
    setSelectedFeedback(item);
    setModalStatus(item.status);
    setModalNote(item.adminNote || '');
  };

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    setActionLoading(true);
    const res = await updateAdminFeedback(selectedFeedback._id, modalStatus, modalNote);
    setActionLoading(false);
    if (res.success) {
      showToast(`Successfully updated feedback status to "${modalStatus}"!`);
      fetchFeedbacks();
      setSelectedFeedback(null);
    } else {
      showToast(res.error || 'Failed to update feedback record.', 'error');
    }
  };

  const getStatusBadge = (statusVal) => {
    const styles = {
      'Open': 'bg-sky-50 text-sky-700 border-sky-150 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50',
      'In Progress': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-450 dark:border-amber-900/50',
      'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
      'Closed': 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    };
    return styles[statusVal] || styles['Open'];
  };

  const getCategoryBadge = (categoryVal) => {
    const styles = {
      'Report a Bug': 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
      'Suggest a Feature': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
      'General Feedback': 'bg-slate-100 text-slate-750 dark:bg-slate-800 dark:text-slate-350'
    };
    return styles[categoryVal] || styles['General Feedback'];
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
          Feedback Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review bug reports, filter categories, and respond to student inquiries.
        </p>
      </div>

      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/50 dark:border-slate-800/60 shadow-sm">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search User, Email, Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-650 dark:text-slate-250 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Bug Reports">Bug Reports Only</option>
            <option value="Feature Requests">Feature Requests Only</option>
            <option value="General Feedback">General Feedback Only</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-650 dark:text-slate-250 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-650 dark:text-slate-250 focus:outline-none"
          >
            <option value="">Newest Submissions</option>
            <option value="oldest">Oldest Submissions</option>
            <option value="rating">Highest Ratings</option>
          </select>
        </form>
      </div>

      {/* Loading/Error States */}
      {error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/45 border border-rose-100 dark:border-rose-900/40 rounded-3xl flex items-center gap-2 text-rose-700 dark:text-rose-455">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : !loading && feedbacks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-slate-455 rounded-full w-fit mx-auto">
            <MessageSquare className="h-10 w-10 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-955 dark:text-white">
              No Feedback Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              No feedback submissions matched your current search query or active filter settings.
            </p>
          </div>
        </div>
      ) : (
        /* Feedbacks Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Title / Summary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-50 dark:border-slate-800/60">
                      <td className="px-6 py-4.5 flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0" />
                        <div className="space-y-1 flex-grow">
                          <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                          <div className="h-2 w-32 bg-slate-150 dark:bg-slate-805 rounded-lg" />
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-5 w-20 bg-slate-150 dark:bg-slate-800 rounded-full" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-3.5 w-3.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-5 w-16 bg-slate-150 dark:bg-slate-800 rounded-full" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  feedbacks.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors">
                      <td className="px-6 py-4.5 flex items-center gap-2.5">
                        {item.user?.profileImage ? (
                          <img 
                            src={getProfileImageUrl(item.user.profileImage, item.createdAt)} 
                            alt="Avatar" 
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="p-1.5 bg-slate-150 dark:bg-slate-800 text-slate-455 rounded-full shrink-0">
                            <Eye className="h-4.5 w-4.5" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white text-xs font-semibold">{item.user?.name || 'Deleted Account'}</span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-550 font-normal">{item.user?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadge(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= item.rating 
                                  ? 'fill-amber-450 text-amber-455' 
                                  : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-slate-800 dark:text-slate-205 max-w-xs truncate font-medium">
                        {item.title}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 text-xs font-normal">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          title="Moderate and Add Notes"
                          disabled={actionLoading}
                          onClick={() => handleOpenDetails(item)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <strong className="font-semibold text-slate-900 dark:text-white">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalFeedbacksCount)}</strong> of <strong className="font-semibold text-slate-900 dark:text-white">{totalFeedbacksCount}</strong> feedbacks
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl disabled:opacity-50 transition-colors text-slate-500 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl disabled:opacity-50 transition-colors text-slate-500 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Success Toasts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-55 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 animate-fade-in text-xs font-semibold ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900 dark:text-emerald-350'
            : 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/90 dark:border-rose-900 dark:text-rose-350'
        }`}>
          <CheckCircle2 className="h-4.5 w-4.5" />
          <span>{toast.message}</span>
        </div>
      )}


      {/* Moderation details drawer */}
      {selectedFeedback && (
        <div 
          onClick={() => setSelectedFeedback(null)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-6 space-y-5 relative"
          >
            {/* Header info */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-base text-slate-950 dark:text-white">
                  Moderate Feedback #{selectedFeedback._id.substring(selectedFeedback._id.length - 8).toUpperCase()}
                </h3>
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${getCategoryBadge(selectedFeedback.type)}`}>
                  {selectedFeedback.type}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`h-4 w-4 ${star <= selectedFeedback.rating ? 'fill-amber-450 text-amber-450' : 'text-slate-200 dark:text-slate-700'}`}
                  />
                ))}
              </div>
            </div>

            {/* Description details */}
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Title</span>
                <p className="text-sm text-slate-900 dark:text-white font-semibold leading-relaxed">{selectedFeedback.title}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Description</span>
                <p className="text-slate-750 dark:text-slate-300 font-normal leading-relaxed break-words whitespace-pre-line bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                  {selectedFeedback.description}
                </p>
              </div>

              {/* Resolution Environment metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 text-[10px]">
                <div>
                  <span className="text-slate-450 block uppercase">Route Name</span>
                  <span className="text-slate-750 dark:text-slate-300 font-semibold">{selectedFeedback.routeName}</span>
                </div>
                <div>
                  <span className="text-slate-450 block uppercase">Platform</span>
                  <span className="text-slate-750 dark:text-slate-300 font-semibold">{selectedFeedback.platform}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-450 block uppercase">URL</span>
                  <span className="text-slate-750 dark:text-slate-300 font-semibold truncate block">{selectedFeedback.pageUrl}</span>
                </div>
              </div>

              {selectedFeedback.screenshot && (
                <div className="space-y-1.5">
                  <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Screenshot attachment</span>
                  <a 
                    href={selectedFeedback.screenshot} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-indigo-650 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    View Cloudinary Image 
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Editing actions form */}
            <form onSubmit={handleUpdateFeedback} className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
                  Update Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
                  Admin Response Note
                </label>
                <textarea
                  rows={3}
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Type updates or resolutions to share with the student..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
