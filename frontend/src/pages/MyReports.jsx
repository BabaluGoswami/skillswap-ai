import React, { useState, useEffect } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { AlertCircle, Loader2, MessageSquare, ShieldAlert, Calendar, CheckCircle } from 'lucide-react';

const MyReports = () => {
  const { getMyReports } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    const res = await getMyReports();
    setLoading(false);
    if (res.success) {
      setReports(res.reports || []);
    } else {
      setError(res.error || 'Failed to load reports history.');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusStyle = (statusVal) => {
    const styles = {
      'Pending': 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50',
      'Under Review': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-450 dark:border-amber-900/50',
      'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
      'Rejected': 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-455 dark:border-rose-900/50'
    };
    return styles[statusVal] || styles['Pending'];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
          My Reported Cases
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track and review the status of reports you have submitted against other profiles.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-7 w-7 text-indigo-650 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-slate-400 rounded-full w-fit mx-auto">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white">
              No Reported Cases
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              You haven't filed any reports against user profiles on SkillSwap AI yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report._id}
              className="bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800/60 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Report ID: #{report._id.substring(report._id.length - 8).toUpperCase()}
                  </span>
                  <h3 className="font-display font-extrabold text-slate-950 dark:text-white">
                    Reported: {report.reportedUser?.name || 'Deleted User'}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(report.status)}`}>
                  {report.status}
                </span>
              </div>

              {/* Summary info */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium border-t border-slate-100 dark:border-slate-800/60 pt-3">
                <div className="space-y-0.5">
                  <span className="text-slate-400">Reason</span>
                  <p className="text-slate-850 dark:text-slate-200">{report.reason}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400">Filed Date</span>
                  <p className="text-slate-850 dark:text-slate-200">{new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-2xl border border-transparent dark:border-slate-800/40 text-xs">
                <span className="text-slate-450 font-bold uppercase tracking-wider block">Your Description</span>
                <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-normal">{report.description}</p>
              </div>

              {/* Admin Note response */}
              {report.adminNote && (
                <div className="space-y-1 bg-indigo-50/20 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/30 dark:border-indigo-900/30 text-xs">
                  <span className="text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider block">Admin Action / Response</span>
                  <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-normal">{report.adminNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
