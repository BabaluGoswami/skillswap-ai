import React, { useEffect, useState } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import EmptyState from '@components/EmptyState.jsx';
import { 
  CheckCircle2, XCircle, AlertCircle, Clock, 
  User, Trash2, ShieldAlert 
} from 'lucide-react';

/**
 * Sent Swap Requests Page.
 * Displays all requests sent by the currently logged-in user.
 */
const SentRequests = () => {
  const { token, getSentRequests, cancelSwapRequest } = useApp();
  const [requests, setRequests] = useState([]);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (token) {
      loadRequests();
    }
  }, [token]);

  const loadRequests = async () => {
    setApiError('');
    const res = await getSentRequests();
    if (res.success) {
      setRequests(res.requests || []);
    } else {
      setApiError(res.error || 'Failed to fetch sent swap requests.');
    }
  };

  const handleCancel = async (requestId) => {
    setApiError('');
    setApiSuccess('');
    setActionLoadingId(requestId);

    const res = await cancelSwapRequest(requestId);
    if (res.success) {
      setApiSuccess('Swap request cancelled successfully.');
      loadRequests();
    } else {
      setApiError(res.error || 'Failed to cancel swap request.');
    }
    setActionLoadingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 theme-transition min-h-[85vh]">
      
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white transition-colors duration-300">
          Sent Swap Requests
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track the status of swap requests you have sent to other peer students.
        </p>
      </div>

      {/* Alert Notifications */}
      {(apiError || apiSuccess) && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border transition-all duration-300 ${
          apiError 
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-455' 
            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-455'
        }`}>
          {apiError ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
          <div className="text-sm font-medium">{apiError || apiSuccess}</div>
        </div>
      )}

      {/* Request Cards List */}
      {requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => {
            const peer = req.receiver || {};
            const isPending = req.status === 'Pending';
            
            return (
              <div 
                key={req._id} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Peer Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 shrink-0">
                    {peer.profileImage ? (
                      <img 
                        src={getProfileImageUrl(peer.profileImage, peer.updatedAt)} 
                        alt={peer.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-indigo-500" />
                    )}
                  </div>

                  {/* Peer metadata */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{peer.name || 'Anonymous Student'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {peer.university || 'No university details'} {peer.branch ? `• ${peer.branch}` : ''}
                    </p>
                    
                    {/* Timestamp & Message */}
                    <div className="flex flex-col gap-1 pt-1.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase font-semibold tracking-wider">
                        <Clock className="h-3.5 w-3.5" />
                        Sent {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      {req.message && (
                        <p className="text-xs italic bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-transparent dark:border-slate-800/40 text-slate-650 dark:text-slate-355 max-w-lg mt-1 leading-relaxed">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Indicator & Cancel Action */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-50 dark:border-slate-800/40 pt-4 md:pt-0">
                  
                  {/* Status indicator badges */}
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                    req.status === 'Accepted'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60'
                      : req.status === 'Rejected'
                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-455 border-rose-100 dark:border-rose-900/60'
                      : req.status === 'Cancelled'
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/60'
                      : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60'
                  }`}>
                    {req.status === 'Accepted' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {req.status === 'Rejected' && <XCircle className="h-3.5 w-3.5" />}
                    {req.status}
                  </span>

                  {/* Cancel Request Button */}
                  {isPending && (
                    <button
                      type="button"
                      disabled={actionLoadingId !== null}
                      onClick={() => handleCancel(req._id)}
                      className="py-2.5 px-4 rounded-xl font-semibold border border-rose-250 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs flex items-center justify-center gap-1.5 disabled:opacity-60 transition-all duration-300 w-full md:w-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={ShieldAlert}
          title="No sent requests."
          description="Swap requests you send to other students will show up here."
        />
      )}

    </div>
  );
};

export default SentRequests;
