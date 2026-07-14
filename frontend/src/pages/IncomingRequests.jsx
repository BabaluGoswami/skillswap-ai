import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import EmptyState from '@components/EmptyState.jsx';
import { 
  CheckCircle2, XCircle, AlertCircle, Clock, 
  User, Check, X, ShieldAlert 
} from 'lucide-react';

/**
 * Incoming Swap Requests Page.
 * Displays all swap requests sent by other peers.
 */
const IncomingRequests = () => {
  const navigate = useNavigate();
  const { 
    token, getReceivedRequests, acceptSwapRequest, rejectSwapRequest,
    setReportTargetUser, setIsReportModalOpen, currentUser,
    requestSwapCompletion, acceptSwapCompletion, rejectSwapCompletion, setRatingTarget
  } = useApp();
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
    const res = await getReceivedRequests();
    if (res.success) {
      setRequests(res.requests || []);
    } else {
      setApiError(res.error || 'Failed to fetch incoming swap requests.');
    }
  };

  const handleAccept = async (requestId) => {
    setApiError('');
    setApiSuccess('');
    setActionLoadingId(requestId);

    const res = await acceptSwapRequest(requestId);
    if (res.success) {
      setApiSuccess('Swap request accepted successfully.');
      // Refresh requests list
      loadRequests();
    } else {
      setApiError(res.error || 'Failed to accept swap request.');
    }
    setActionLoadingId(null);
  };

  const handleReject = async (requestId) => {
    setApiError('');
    setApiSuccess('');
    setActionLoadingId(requestId);

    const res = await rejectSwapRequest(requestId);
    if (res.success) {
      setApiSuccess('Swap request rejected.');
      loadRequests();
    } else {
      setApiError(res.error || 'Failed to reject swap request.');
    }
    setActionLoadingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 theme-transition min-h-[85vh]">
      
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white transition-colors duration-300">
          Incoming Swap Requests
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review and respond to swap requests received from other peer students.
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

      {/* Request Cards Grid */}
      {requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => {
            const peer = req.sender || {};
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
                    
                    {/* Timestamp & message */}
                    <div className="flex flex-col gap-1 pt-1.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase font-semibold tracking-wider">
                        <Clock className="h-3.5 w-3.5" />
                        Received {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      {req.message && (
                        <p className="text-xs italic bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-transparent dark:border-slate-800/40 text-slate-650 dark:text-slate-350 max-w-lg mt-1 leading-relaxed">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Status / CTA actions */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-50 dark:border-slate-800/40 pt-4 md:pt-0">
                  
                  {/* Status indicator badges */}
                  {!isPending && (
                    <div className="flex items-center gap-2">
                      {req.status === 'Completed' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/chat?peerId=${peer._id}`)}
                            className="py-2 px-3.5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                          >
                            Open Chat (Read-Only)
                          </button>
                          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                            Completed
                          </span>
                        </div>
                      ) : (req.status === 'Accepted' || req.status === 'CompletionRequested') ? (
                        (() => {
                          const isTeacher = (req.receiver?._id || req.receiver || '').toString() === (currentUser?.id || currentUser?._id || '').toString();
                          const isLearner = (req.sender?._id || req.sender || '').toString() === (currentUser?.id || currentUser?._id || '').toString();

                          if (req.status === 'Accepted') {
                            return (
                              <div className="flex flex-col gap-1.5 items-end">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/chat?peerId=${peer._id}`)}
                                    className="py-2 px-3.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                                  >
                                    Open Learning Session
                                  </button>
                                  {isTeacher && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to mark this learning session as completed?')) {
                                          const res = await requestSwapCompletion(req._id);
                                          if (res.success) {
                                            loadRequests();
                                          } else {
                                            setApiError(res.error || 'Failed to complete session.');
                                          }
                                        }
                                      }}
                                      className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                                    >
                                      Mark Session Completed
                                    </button>
                                  )}
                                </div>
                                <span className="px-2 py-1 text-[10px] font-extrabold rounded-full border bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200">
                                  Active
                                </span>
                              </div>
                            );
                          }

                          if (req.status === 'CompletionRequested') {
                            return (
                              <div className="flex flex-col gap-1.5 items-end">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/chat?peerId=${peer._id}`)}
                                  className="py-2 px-3.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                                >
                                  Open Learning Session
                                </button>
                                {isTeacher && (
                                  <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-100 dark:border-amber-900/50 text-center select-none animate-pulse">
                                    ⏳ Waiting for Student Confirmation
                                  </span>
                                )}
                                {isLearner && (
                                  <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/20 pt-1.5 items-center">
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Mentor requested completion:</span>
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (window.confirm('Accept session completion?')) {
                                            const res = await acceptSwapCompletion(req._id);
                                            if (res.success) {
                                              loadRequests();
                                              setRatingTarget({
                                                swapRequestId: req._id,
                                                teacherId: peer.id || peer._id,
                                                teacherName: peer.name
                                              });
                                            } else {
                                              setApiError(res.error || 'Failed to accept completion.');
                                            }
                                          }
                                        }}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (window.confirm('Reject session completion?')) {
                                            const res = await rejectSwapCompletion(req._id);
                                            if (res.success) {
                                              loadRequests();
                                            } else {
                                              setApiError(res.error || 'Failed to reject completion.');
                                            }
                                          }
                                        }}
                                        className="px-2 py-1 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })()
                      ) : (
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${
                          req.status === 'Rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-455 border-rose-100'
                            : 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-450 border-slate-100'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Accept / Reject CTAs */}
                  {isPending && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        type="button"
                        disabled={actionLoadingId !== null}
                        onClick={() => handleReject(req._id)}
                        className="flex-1 md:flex-none py-2.5 px-4 rounded-xl font-semibold border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs flex items-center justify-center gap-1.5 disabled:opacity-60 transition-all duration-300 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId !== null}
                        onClick={() => handleAccept(req._id)}
                        className="flex-1 md:flex-none py-2.5 px-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 text-xs flex items-center justify-center gap-1.5 disabled:opacity-60 transition-all duration-300 shadow-sm shadow-emerald-100 dark:shadow-none cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept
                      </button>
                    </div>
                  )}

                  {peer._id !== currentUser?._id && (
                    <button
                      type="button"
                      onClick={() => {
                        setReportTargetUser({ id: peer._id, name: peer.name });
                        setIsReportModalOpen(true);
                      }}
                      className="p-2 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                      title="Report User Profile"
                    >
                      ⚠ Report
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
          title="No incoming requests."
          description="Swap requests sent by other students will show up here."
        />
      )}
    </div>
  );
};

export default IncomingRequests;
