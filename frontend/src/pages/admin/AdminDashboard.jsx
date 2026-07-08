import React, { useState, useEffect } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { 
  Users, ArrowLeftRight, MessageSquare, Star, UserPlus, 
  ShieldAlert, ShieldCheck, Loader2, AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const { getAdminDashboard } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      const res = await getAdminDashboard();
      setLoading(false);
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.error || 'Failed to fetch dashboard metrics.');
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 p-6 border border-rose-100 dark:border-rose-900/40 rounded-3xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const metricCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' },
    { title: 'Active Users', value: stats?.activeUsers || 0, icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' },
    { title: 'Disabled Users', value: stats?.disabledUsers || 0, icon: ShieldAlert, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' },
    { title: 'Banned Users', value: stats?.bannedUsers || 0, icon: ShieldAlert, color: 'text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/40' },
    { title: 'Total Swaps', value: stats?.totalSwaps || 0, icon: ArrowLeftRight, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
    { title: 'Total Feedback', value: stats?.totalFeedback || 0, icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
    { title: 'Open Feedback', value: stats?.openFeedback || 0, icon: MessageSquare, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40' },
    { title: 'Resolved Feedback', value: stats?.resolvedFeedback || 0, icon: ShieldCheck, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40' },
    { title: "Today's Signups", value: stats?.todaysNewUsers || 0, icon: UserPlus, color: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/40' },
    { title: 'Pending Reports', value: stats?.pendingReports || 0, icon: ShieldAlert, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/45' },
    { title: 'Under Review Reports', value: stats?.underReviewReports || 0, icon: ShieldAlert, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/45' },
    { title: 'Total Warnings Issued', value: stats?.totalWarnings || 0, icon: ShieldAlert, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/45' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time metrics, user actions, and system-wide counters.
        </p>
      </div>

      {/* Grid Cards layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
                  {card.value}
                </span>
              </div>
              <div className={`p-3.5 rounded-2xl ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
            Platform Rating Average
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            The mathematical average score generated from active students rating completed swapping collaborations.
          </p>
        </div>
        <div className="flex items-center gap-3.5 px-6 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400">
          <Star className="h-6 w-6 fill-amber-450 text-amber-450" />
          <span className="font-display font-extrabold text-2xl">
            {stats?.averageRating || '0.0'} / 5.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
