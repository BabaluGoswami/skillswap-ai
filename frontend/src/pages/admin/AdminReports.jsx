import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { 
  ShieldAlert, Search, Filter, Loader2, AlertCircle, 
  ExternalLink, Calendar, User, Check, X, Info, FileText 
} from 'lucide-react';

const AdminReports = () => {
  const { getAdminReports, updateAdminReport } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Data & loading states
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected report detail modal drawer
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(null); // { action, label }

  // Debouncing search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Load reports list
  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getAdminReports(page, limit, debouncedSearch, reason, status, sortBy);
    setLoading(false);
    if (res.success) {
      setReports(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } else {
      setError(res.error || 'Failed to load report tickets.');
    }
  }, [page, limit, debouncedSearch, reason, status, sortBy]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Handle toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Perform moderation operations
  const handleModerateAction = async (action, newStatus = '') => {
    if (!selectedReport) return;
    
    setActionLoading(true);
    setError('');
    
    const res = await updateAdminReport(selectedReport._id, action, newStatus, adminNote);
    setActionLoading(false);
    setShowConfirm(null);

    if (res.success) {
      triggerToast(`Action successfully applied: ${action === 'status' ? newStatus : action}`);
      setAdminNote('');
      
      // Reload active detail
      setSelectedReport(res.data);
      // Reload list
      loadReports();
    } else {
      setError(res.error || 'Failed to apply moderation action.');
    }
  };

  const getReasonColor = (r) => {
    const map = {
      'Spam': 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300',
      'Fake Profile': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
      'Harassment': 'bg-red-100 text-red-750 dark:bg-red-950/30 dark:text-red-400',
      'Abusive Behaviour': 'bg-red-100 text-red-755 dark:bg-red-950/30 dark:text-red-400',
      'Scam': 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455',
      'Inappropriate Content': 'bg-yellow-105 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400',
      'Other': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
    };
    return map[r] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (s) => {
    const map = {
      'Pending': 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/35 dark:text-sky-400 dark:border-sky-900/50',
      'Under Review': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/35 dark:text-amber-450 dark:border-amber-900/50',
      'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-400 dark:border-emerald-900/50',
      'Rejected': 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/35 dark:text-rose-455 dark:border-rose-900/50'
    };
    return map[s] || 'bg-slate-105 text-slate-700';
  };

  return (
    <div className="space-y-6 relative pb-16">
      
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-55 px-5 py-3.5 bg-slate-900 dark:bg-indigo-950 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in border border-indigo-900/20">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            User Moderation Panel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review abuse reports, warnings counter, issue official warnings, and deactivate profile violations.
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 dark:text-white"
          />
        </div>

        {/* Reason Select */}
        <select
          value={reason}
          onChange={(e) => { setReason(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 dark:text-white"
        >
          <option value="">All Categories</option>
          <option value="Spam">Spam</option>
          <option value="Fake Profile">Fake Profile</option>
          <option value="Harassment">Harassment</option>
          <option value="Abusive Behaviour">Abusive Behaviour</option>
          <option value="Inappropriate Content">Inappropriate Content</option>
          <option value="Scam">Scam</option>
          <option value="Other">Other</option>
        </select>

        {/* Status Select */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 dark:text-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <button 
          onClick={() => { setSearch(''); setReason(''); setStatus(''); setSortBy('newest'); setPage(1); }}
          className="w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-455 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-slate-400 rounded-full w-fit mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">
              No report tickets found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Everything looks clean! No pending reports match your active filter categories.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Reporter</th>
                    <th className="py-4 px-6">Reported User</th>
                    <th className="py-4 px-6">Reason</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-105 dark:divide-slate-800 text-xs font-medium">
                  {reports.map((report) => (
                    <tr 
                      key={report._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-slate-400">
                        #{report._id.substring(report._id.length - 6).toUpperCase()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-900 dark:text-white block font-bold">{report.reporter?.name || 'Deleted'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{report.reporter?.email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-900 dark:text-white block font-bold">{report.reportedUser?.name || 'Deleted'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{report.reportedUser?.email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getReasonColor(report.reason)}`}>
                          {report.reason}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-normal">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => { setSelectedReport(report); setAdminNote(report.adminNote || ''); }}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-650 dark:text-indigo-400 font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Moderate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-850/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                Showing {Math.min(limit * (page - 1) + 1, total)}–{Math.min(limit * page, total)} of {total} cases
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Detail Drawer/Modal */}
      {selectedReport && (
        <div 
          onClick={() => setSelectedReport(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full border-l border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-slide-left"
          >
            {/* Drawer Header */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Case Details
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                    Report ID: #{selectedReport._id.substring(selectedReport._id.length - 8).toUpperCase()}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Profiles details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl space-y-2 border border-transparent dark:border-slate-800/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Reporter</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedReport.reporter?.name || 'Deleted'}</h4>
                    <p className="text-xs text-slate-500 font-normal">{selectedReport.reporter?.email}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-normal">Univ: {selectedReport.reporter?.university || 'N/A'}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl space-y-2 border border-transparent dark:border-slate-800/40">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Reported User</span>
                    {selectedReport.reportedUser?.warningsCount >= 3 && (
                      <span className="text-[8px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
                        Recommended for Suspension
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedReport.reportedUser?.name || 'Deleted'}</h4>
                    <p className="text-xs text-slate-500 font-normal">{selectedReport.reportedUser?.email}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-400">Warnings: {selectedReport.reportedUser?.warningsCount || 0}</span>
                      <span className="text-[9px] font-bold text-slate-400">Status: {selectedReport.reportedUser?.status || 'active'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-xs text-slate-450 font-bold uppercase tracking-wider block">Category</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getReasonColor(selectedReport.reason)}`}>
                    {selectedReport.reason}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Description of Violation</span>
                  <p className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/60 dark:border-slate-800 rounded-2xl text-xs font-normal text-slate-655 dark:text-slate-350 leading-relaxed">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Screenshot evidence */}
                {selectedReport.screenshot && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Attached Evidence</span>
                    <a 
                      href={selectedReport.screenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:opacity-90 block relative group"
                    >
                      <img 
                        src={selectedReport.screenshot} 
                        alt="Evidence Screenshot" 
                        className="max-h-56 object-cover w-full"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                        <ExternalLink className="h-4 w-4" /> Open Original
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* Moderation log history */}
              {selectedReport.moderationHistory && selectedReport.moderationHistory.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-xs text-slate-450 font-bold uppercase tracking-wider block">Moderation History Log</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedReport.moderationHistory.map((h, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-slate-50/40 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px]"
                      >
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                          <span>{h.action}</span>
                          <span className="text-[9px] text-slate-400 font-normal">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-normal">{h.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 bg-white dark:bg-slate-900 mt-6 shrink-0">
              
              {/* Admin note input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">
                  Moderator Action Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail rationale for warn, reject, resolve, disable or ban action. Stored permanently..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 resize-none dark:text-white"
                />
              </div>

              {/* Action Buttons panel */}
              <div className="space-y-2">
                
                {/* Warnings / Ban Controls */}
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleModerateAction('warn')}
                    className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-750 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    Warn User
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowConfirm({ action: 'disable', label: 'Temporarily Disable Account' })}
                    className="flex-1 py-2.5 bg-orange-655 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    Disable User
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowConfirm({ action: 'ban', label: 'Permanently Ban Account' })}
                    className="flex-1 py-2.5 bg-rose-650 hover:bg-rose-750 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    Ban User
                  </button>
                </div>

                {/* Report status transitions */}
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleModerateAction('status', 'Rejected')}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject Report
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleModerateAction('status', 'Under Review')}
                    className="flex-1 py-2.5 border border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Mark Under Review
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleModerateAction('status', 'Resolved')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    Resolve Report
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal overlay */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="h-6 w-6" />
              <h4 className="font-display font-extrabold text-sm text-slate-950 dark:text-white">Confirm Admin Action</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Are you sure you want to trigger <strong className="text-rose-600">{showConfirm.label}</strong> on user profile <strong className="text-slate-900 dark:text-white">"{selectedReport?.reportedUser?.name}"</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 text-xs font-bold rounded-xl cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                onClick={() => handleModerateAction(showConfirm.action)}
                className="flex-1 py-2 bg-rose-650 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReports;
