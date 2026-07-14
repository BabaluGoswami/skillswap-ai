import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import EmptyState from '@components/EmptyState.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import Chat from './Chat.jsx';
import { 
  BookOpen, Clock, Calendar, Star, Plus, 
  CheckCircle, Sparkles, BookOpen as BookIcon, Award, AlertCircle, User,
  Trophy, TrendingUp, UserCheck, Inbox, ShieldAlert, X
} from 'lucide-react';

/**
 * Production-ready Dashboard page.
 * Displays only authentic user profile stats, using reusable EmptyState components
 * for unconfigured fields, and integrates full dark mode theme styling.
 */
const Dashboard = () => {
  const { 
    currentUser, token, addUserSkillToTeach, addUserSkillToLearn, getMatchedUsers, 
    sendSwapRequest, getSentRequests, getReceivedRequests, acceptSwapRequest, rejectSwapRequest,
    setReportTargetUser, setIsReportModalOpen,
    requestSwapCompletion, acceptSwapCompletion, rejectSwapCompletion, getUserProfile, setRatingTarget 
  } = useApp();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState('teach'); // 'teach' | 'learn'
  const [modalError, setModalError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technology');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
  const [matches, setMatches] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [requestsMap, setRequestsMap] = useState({});
  const [requestsObjMap, setRequestsObjMap] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [activeChatPeer, setActiveChatPeer] = useState(null);

  // Guard routing for unauthenticated sessions
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch matches and requests on load and when currentUser updates
  useEffect(() => {
    if (token) {
      fetchMatches();
      fetchRequests();
    }
  }, [token, currentUser]);

  // Sync fresh profile details once on mount
  useEffect(() => {
    if (token) {
      getUserProfile();
    }
  }, [token]);

  const fetchMatches = async () => {
    const res = await getMatchedUsers();
    if (res.success && res.matches) {
      setMatches(res.matches);
    }
  };

  const fetchRequests = async () => {
    const sentRes = await getSentRequests();
    const receivedRes = await getReceivedRequests();
    if (sentRes.success && receivedRes.success) {
      const combined = [...(sentRes.requests || []), ...(receivedRes.requests || [])];
      setAllRequests(combined);

      const map = {};
      const objMap = {};
      // Since requests are sorted newest first, the first one we find is the newest status.
      combined.forEach(req => {
        const peerId = (req.sender?._id || req.sender || '').toString() === (currentUser?.id || currentUser?._id || '').toString()
          ? (req.receiver?._id || req.receiver)
          : (req.sender?._id || req.sender);
        
        if (peerId && !map[peerId.toString()]) {
          map[peerId.toString()] = req.status;
          objMap[peerId.toString()] = req;
        }
      });
      setRequestsMap(map);
      setRequestsObjMap(objMap);
    }
  };

  if (!token) {
    return null; 
  }

  const openModal = (mode = 'teach') => {
    setModalError('');
    setNewSkillName('');
    setModalMode(mode);
    setShowAddModal(true);
  };

  // Real user data model
  const user = currentUser || {
    name: '',
    email: '',
    role: 'Student',
    skillsToTeach: [],
    skillsToLearn: [],
    totalSessions: 0,
    totalTeachingHours: 0,
    ratingAverage: 0.0,
    xp: 0,
    level: 1
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setModalError('');
    const result = modalMode === 'teach'
      ? await addUserSkillToTeach(newSkillName.trim())
      : await addUserSkillToLearn(newSkillName.trim());

    if (result.success) {
      setNewSkillName('');
      setShowAddModal(false);
      fetchMatches();
    } else {
      setModalError(result.error);
    }
  };

  const handleRequestSwap = async (receiverId) => {
    setActionError('');
    setActionSuccess('');
    setProcessingId(receiverId);

    const res = await sendSwapRequest(receiverId, 'Hey, let us swap skills!');
    if (res.success) {
      setActionSuccess('Swap request sent successfully.');
      fetchRequests();
    } else {
      setActionError(res.error || 'Failed to send swap request.');
    }
    setProcessingId(null);
  };

  const completedCount = user.totalSessions || 0;
  const pendingCount = allRequests.filter(r => r.status === 'Pending').length;
  const activeCount = allRequests.filter(r => r.status === 'Accepted' || r.status === 'CompletionRequested').length;
  const offeredCount = user.skillsToTeach?.length || 0;
  const learningCount = user.skillsToLearn?.length || 0;
  const ratingVal = user.ratingAverage || 0.0;
  const currentXp = user.xp;
  const currentLevel = user.level;
  console.log("Dashboard rendering - currentUser:", currentUser);
  console.log("Dashboard rendering - currentXp:", currentXp, "currentLevel:", currentLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 theme-transition min-h-[85vh]">
      
      {/* 1. Dashboard Header Banner */}
      <div className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-indigo-100 dark:shadow-none theme-transition">
        <div className="space-y-2">
          <span className="bg-indigo-500/30 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400/20">
            Authenticated Profile
          </span>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">
            {user.name}
          </h1>
          <p className="text-indigo-100 text-sm">{user.email}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={() => openModal('teach')}
            className="flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Skill to Teach
          </button>
          <button 
            onClick={() => openModal('learn')}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400/20 px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Skill to Learn
          </button>
        </div>
      </div>

      {/* 2. Overview Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Completed Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Completed Sessions</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {completedCount}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl theme-transition">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Pending Requests</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {pendingCount}
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl theme-transition">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Active Sessions</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {activeCount}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl theme-transition">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Average Rating</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-1.5">
              {ratingVal && ratingVal > 0 ? (
                <>
                  {ratingVal.toFixed(1)}
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </>
              ) : (
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">No Ratings Yet</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl theme-transition">
            <Star className="h-5 w-5" />
          </div>
        </div>

        {/* Skills Offered */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Skills Offered</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {offeredCount}
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl theme-transition">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        {/* Skills Learning */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Skills Learning</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {learningCount}
            </div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl theme-transition">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Current XP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Current XP</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-1.5">
              {currentXp} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">XP</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl theme-transition">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Level */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Student Level</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-1.5">
              Lvl {currentLevel}
            </div>
          </div>
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl theme-transition">
            <Trophy className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Skills Lists & Dynamic Matches grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Skills Managed column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6 theme-transition">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800/80 pb-4 flex items-center gap-2 transition-colors duration-300">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              Skill Directory
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teaching skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-md w-fit transition-colors duration-300">
                  Skills I Can Teach
                </h4>
                
                {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                  <div className="space-y-2">
                    {user.skillsToTeach.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-transparent dark:border-slate-800/50 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 transition-all duration-300">
                        <span>{skill}</span>
                        <span className="text-xs text-indigo-500 font-semibold bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800/80 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={Award}
                    title="No skills added yet."
                    description="List your skills so peers can find you as a mentor."
                    actionText="Add Your First Skill"
                    onActionClick={openModal}
                  />
                )}
              </div>

              {/* Learning skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-md w-fit transition-colors duration-300">
                  Skills I Want to Learn
                </h4>
                
                {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                  <div className="space-y-2">
                    {user.skillsToLearn.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-transparent dark:border-slate-800/50 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 transition-all duration-300">
                        <span>{skill}</span>
                        <span className="text-xs text-blue-500 font-semibold bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800/80 px-2 py-0.5 rounded-full">Searching</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={BookIcon}
                    title="No skills added yet."
                    description="List subject areas you want to study to find mentors."
                    actionText="Add Skill to Learn"
                    onActionClick={openModal}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Matching Peers panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6 theme-transition">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-4 transition-colors duration-300">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Matched Peers
              </h3>
            </div>

            {/* Inline Notifications */}
            {(actionError || actionSuccess) && (
              <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs font-medium transition-all duration-300 ${
                actionError 
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-455' 
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-455'
              }`}>
                {actionError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
                <div>{actionError || actionSuccess}</div>
              </div>
            )}

            {matches && matches.length > 0 ? (
              <div className="flex flex-col gap-4">
                {matches.map((peer) => {
                  let reqStatus = requestsMap[peer.id.toString()];
                  const isProcessing = processingId === peer.id;

                  // Re-swap eligibility: allow learning again if previous session is Completed AND a new matching skill exists
                  const hasActiveSwap = allRequests.some(r => 
                    ['Pending', 'Accepted', 'CompletionRequested'].includes(r.status) &&
                    ((r.sender?._id || r.sender || '').toString() === peer.id.toString() || 
                     (r.receiver?._id || r.receiver || '').toString() === peer.id.toString())
                  );

                  const currentMatchingSkills = [];
                  const peerTeach = peer.skillsToTeach || [];
                  const peerLearn = peer.skillsToLearn || [];
                  const myTeach = currentUser.skillsToTeach || [];
                  const myLearn = currentUser.skillsToLearn || [];
                  
                  const teachOverlap = peerTeach.filter(s => 
                    myLearn.some(ms => ms.trim().toLowerCase() === s.trim().toLowerCase())
                  );
                  const learnOverlap = peerLearn.filter(s => 
                    myTeach.some(ms => ms.trim().toLowerCase() === s.trim().toLowerCase())
                  );
                  
                  teachOverlap.forEach(s => currentMatchingSkills.push(s.trim().toLowerCase()));
                  learnOverlap.forEach(s => currentMatchingSkills.push(s.trim().toLowerCase()));

                  const completedRequests = allRequests.filter(r => 
                    r.status === 'Completed' && 
                    ((r.sender?._id || r.sender || '').toString() === peer.id.toString() || 
                     (r.receiver?._id || r.receiver || '').toString() === peer.id.toString())
                  );

                  if (completedRequests.length > 0) {
                    const allCompletedSkills = new Set();
                    completedRequests.forEach(req => {
                      if (req.completedSkills && req.completedSkills.length > 0) {
                        req.completedSkills.forEach(s => allCompletedSkills.add(s.trim().toLowerCase()));
                      } else {
                        // Fallback dynamic overlap calculation
                        const reqSenderTeach = req.sender?.skillsToTeach || [];
                        const reqReceiverTeach = req.receiver?.skillsToTeach || [];
                        const reqSenderLearn = req.sender?.skillsToLearn || [];
                        const reqReceiverLearn = req.receiver?.skillsToLearn || [];

                        const reqTeachOverlap = reqSenderTeach.filter(s => 
                          reqReceiverLearn.some(ms => ms.trim().toLowerCase() === s.trim().toLowerCase())
                        );
                        const reqLearnOverlap = reqReceiverTeach.filter(s => 
                          reqSenderLearn.some(ms => ms.trim().toLowerCase() === s.trim().toLowerCase())
                        );
                        reqTeachOverlap.forEach(s => allCompletedSkills.add(s.trim().toLowerCase()));
                        reqLearnOverlap.forEach(s => allCompletedSkills.add(s.trim().toLowerCase()));
                      }
                    });

                    const eligibleSkills = currentMatchingSkills.filter(s => !allCompletedSkills.has(s));

                    if (eligibleSkills.length > 0 && !hasActiveSwap) {
                      reqStatus = null; // Enable Request Swap
                    } else if (hasActiveSwap) {
                      // If there is an active swap, use that request status
                      const activeReq = allRequests.find(r => 
                        ['Pending', 'Accepted', 'CompletionRequested'].includes(r.status) &&
                        ((r.sender?._id || r.sender || '').toString() === peer.id.toString() || 
                         (r.receiver?._id || r.receiver || '').toString() === peer.id.toString())
                      );
                      reqStatus = activeReq ? activeReq.status : null;
                    } else {
                      reqStatus = 'Completed'; // Lock as Completed
                    }
                  }
                  
                  return (
                    <div 
                      key={peer.id} 
                      className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 p-4 rounded-xl flex flex-col justify-between h-full hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:scale-[1.01] hover:border-indigo-400/50 dark:hover:border-indigo-500/30 transition-all duration-300 shadow-md"
                    >
                      {/* Premium Border Glow */}
                      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-indigo-500/10 dark:group-hover:border-indigo-400/20 pointer-events-none transition-all duration-300" />
                      
                      <div className="space-y-3 w-full">
                        {/* Header Row: Avatar, Name, Match % */}
                        <div className="flex items-center gap-3 w-full">
                          {/* Avatar */}
                          <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 shrink-0 shadow-inner">
                            {peer.profileImage ? (
                              <img 
                                src={getProfileImageUrl(peer.profileImage, peer.updatedAt)} 
                                alt={peer.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-indigo-500" />
                            )}
                          </div>
                          
                          {/* Name + Match % */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                                {peer.name}
                              </h4>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-755 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                                {peer.matchScore}% Match
                              </span>
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1 text-[11px] text-slate-550 dark:text-slate-400 pt-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                              <span className="font-bold text-slate-705 dark:text-slate-300">
                                {peer.ratingAverage && peer.ratingAverage > 0 ? peer.ratingAverage.toFixed(1) : 'No Ratings Yet'}
                              </span>
                              <span className="text-[9px]">({peer.totalSessions || 0} sessions)</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* College | Branch Row */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/40 pt-2 flex flex-wrap gap-x-1.5 items-center">
                          <span className="font-semibold text-slate-750 dark:text-slate-200 truncate max-w-[140px]">{peer.university || 'No College'}</span>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <span className="truncate max-w-[120px]">{peer.branch || 'No Branch'}</span>
                        </div>
                        
                        {/* Skills breakdown */}
                        <div className="space-y-1 text-[11px] border-t border-slate-50 dark:border-slate-800/40 pt-2 w-full">
                          {peer.commonLearnSkills && peer.commonLearnSkills.length > 0 && (
                            <div className="flex gap-1 items-baseline">
                              <span className="font-bold text-indigo-655 dark:text-indigo-400 shrink-0">Teaches:</span>
                              <span className="text-slate-600 dark:text-slate-350 break-words line-clamp-1">{peer.commonLearnSkills.join(', ')}</span>
                            </div>
                          )}
                          {peer.commonTeachSkills && peer.commonTeachSkills.length > 0 && (
                            <div className="flex gap-1 items-baseline">
                              <span className="font-bold text-blue-650 dark:text-blue-400 shrink-0">Wants:</span>
                              <span className="text-slate-600 dark:text-slate-350 break-words line-clamp-1">{peer.commonTeachSkills.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* CTAs */}
                      <div className="flex items-center gap-1.5 pt-2 mt-3 border-t border-slate-50 dark:border-slate-800/10 w-full shrink-0">
                        {(() => {
                          if (reqStatus === 'Pending') {
                            const matchingRequest = requestsObjMap[peer.id];
                            const isSentByMe = matchingRequest && 
                              (matchingRequest.sender?._id || matchingRequest.sender || '').toString() === (currentUser?.id || currentUser?._id || '').toString();
                            const isReceivedByMe = matchingRequest && 
                              (matchingRequest.receiver?._id || matchingRequest.receiver || '').toString() === (currentUser?.id || currentUser?._id || '').toString();

                            if (isSentByMe) {
                              const hasCompleted = allRequests.some(r => 
                                r.status === 'Completed' && 
                                ((r.sender?._id || r.sender || '').toString() === peer.id.toString() || 
                                 (r.receiver?._id || r.receiver || '').toString() === peer.id.toString())
                              );
                              return (
                                <div className="flex flex-col gap-1.5 w-full">
                                  <span className="w-full px-3 py-2 bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-105 dark:border-amber-900/50 text-center select-none">
                                    🟡 Request Sent
                                  </span>
                                  {hasCompleted && (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/chat?peerId=${peer.id}`)}
                                      className="w-full px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                                    >
                                      Open Chat (Read-Only)
                                    </button>
                                  )}
                                </div>
                              );
                            }

                            if (isReceivedByMe) {
                              const hasCompleted = allRequests.some(r => 
                                r.status === 'Completed' && 
                                ((r.sender?._id || r.sender || '').toString() === peer.id.toString() || 
                                 (r.receiver?._id || r.receiver || '').toString() === peer.id.toString())
                              );
                              return (
                                <div className="flex flex-col gap-1.5 w-full">
                                  <div className="flex gap-1.5 w-full">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const res = await acceptSwapRequest(matchingRequest._id);
                                        if (res.success) {
                                          fetchRequests();
                                          fetchMatches();
                                        } else {
                                          setActionError(res.error || 'Failed to accept request.');
                                        }
                                      }}
                                      className="flex-grow px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer text-center"
                                    >
                                      ✅ Accept
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const res = await rejectSwapRequest(matchingRequest._id);
                                        if (res.success) {
                                          fetchRequests();
                                          fetchMatches();
                                        } else {
                                          setActionError(res.error || 'Failed to reject request.');
                                        }
                                      }}
                                      className="flex-grow px-3 py-2 border border-rose-205 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold cursor-pointer text-center"
                                    >
                                      ❌ Reject
                                    </button>
                                  </div>
                                  {hasCompleted && (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/chat?peerId=${peer.id}`)}
                                      className="w-full px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                                    >
                                      Open Chat (Read-Only)
                                    </button>
                                  )}
                                </div>
                              );
                            }
                          }
                          
                          if (reqStatus === 'Accepted' || reqStatus === 'CompletionRequested') {
                            const matchingRequest = requestsObjMap[peer.id];
                            const isTeacher = matchingRequest && 
                              (matchingRequest.receiver?._id || matchingRequest.receiver || '').toString() === (currentUser?.id || currentUser?._id || '').toString();
                            const isLearner = matchingRequest && 
                              (matchingRequest.sender?._id || matchingRequest.sender || '').toString() === (currentUser?.id || currentUser?._id || '').toString();

                            if (reqStatus === 'Accepted') {
                              return (
                                <div className="flex flex-col gap-1.5 w-full">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/chat?peerId=${peer.id}`)}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-indigo-655 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                                  >
                                    Open Learning Session
                                  </button>
                                  {isTeacher && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to mark this learning session as completed?')) {
                                          const res = await requestSwapCompletion(matchingRequest._id);
                                          if (res.success) {
                                            fetchRequests();
                                            fetchMatches();
                                          } else {
                                            setActionError(res.error || 'Failed to complete session.');
                                          }
                                        }
                                      }}
                                      className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer text-center"
                                    >
                                      Mark Session Completed
                                    </button>
                                  )}
                                </div>
                              );
                            }

                            if (reqStatus === 'CompletionRequested') {
                              if (isTeacher) {
                                return (
                                  <div className="flex flex-col gap-1.5 w-full">
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/chat?peerId=${peer.id}`)}
                                      className="w-full px-3 py-2 bg-gradient-to-r from-indigo-655 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                                    >
                                      Open Learning Session
                                    </button>
                                    <span className="w-full px-3 py-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-100 dark:border-amber-900/50 text-center select-none animate-pulse">
                                      ⏳ Waiting for Student Confirmation
                                    </span>
                                  </div>
                                );
                              }
                              
                              if (isLearner) {
                                return (
                                  <div className="flex flex-col gap-1.5 w-full">
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/chat?peerId=${peer.id}`)}
                                      className="w-full px-3 py-2 bg-gradient-to-r from-indigo-655 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                                    >
                                      Open Learning Session
                                    </button>
                                    <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/20 pt-1.5 w-full">
                                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold text-center">Mentor requested to complete session:</span>
                                      <div className="flex gap-1.5 w-full">
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (window.confirm('Accept session completion?')) {
                                              const res = await acceptSwapCompletion(matchingRequest._id);
                                              if (res.success) {
                                                fetchRequests();
                                                fetchMatches();
                                                setRatingTarget({
                                                  swapRequestId: matchingRequest._id,
                                                  teacherId: peer.id || peer._id,
                                                  teacherName: peer.name
                                                });
                                              } else {
                                                setActionError(res.error || 'Failed to accept completion.');
                                              }
                                            }
                                          }}
                                          className="flex-grow px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer text-center"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (window.confirm('Reject session completion?')) {
                                              const res = await rejectSwapCompletion(matchingRequest._id);
                                              if (res.success) {
                                                fetchRequests();
                                                fetchMatches();
                                              } else {
                                                setActionError(res.error || 'Failed to reject completion.');
                                              }
                                            }
                                          }}
                                          className="flex-grow px-2 py-1.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold cursor-pointer text-center"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            }
                          }
                          
                          if (reqStatus === 'Completed') {
                            return (
                              <div className="flex flex-col gap-1.5 w-full">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/chat?peerId=${peer.id}`)}
                                  className="w-full px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                  Open Chat (Read-Only)
                                </button>
                                <span className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/50 text-center select-none">
                                  Completed Session
                                </span>
                              </div>
                            );
                          }

                           const hasCompleted = allRequests.some(r => 
                             r.status === 'Completed' && 
                             ((r.sender?._id || r.sender || '').toString() === peer.id.toString() || 
                              (r.receiver?._id || r.receiver || '').toString() === peer.id.toString())
                           );

                           return (
                             <div className="flex flex-col gap-1.5 w-full">
                               <button 
                                 type="button" 
                                 disabled={isProcessing}
                                 onClick={() => handleRequestSwap(peer.id)}
                                 className="w-full px-3 py-2 bg-gradient-to-r from-indigo-655 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                               >
                                 {isProcessing ? 'Processing...' : 'Request Swap'}
                               </button>
                               {hasCompleted && (
                                 <button
                                   type="button"
                                   onClick={() => navigate(`/chat?peerId=${peer.id}`)}
                                   className="w-full px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                                 >
                                   Open Chat (Read-Only)
                                 </button>
                               )}
                             </div>
                           );
                        })()}

                        {/* Report User */}
                        {peer.id !== currentUser?.id && peer.role !== 'Admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setReportTargetUser({ id: peer.id, name: peer.name });
                              setIsReportModalOpen(true);
                            }}
                            className="px-2.5 py-2 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-600 dark:text-rose-455 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0"
                            title="Report User"
                          >
                            ⚠
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                icon={Sparkles}
                title="No matching users found yet."
                description="Peer suggestions will appear here once matches are found in the database."
              />
            )}
          </div>
        </div>

      </div>

      {/* 4. Add Skill Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6 theme-transition">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white transition-colors duration-300">
              {modalMode === 'teach' ? 'Add Skill to Teach' : 'Add Skill to Learn'}
            </h3>
            
            {modalError && (
              <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-xl transition-all duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Skill Name</label>
                <input 
                  type="text" 
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Node.js development, French" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors duration-300"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</label>
                <select 
                  value={newSkillCategory} 
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors duration-300"
                >
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Languages">Languages</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Your Level</label>
                <select 
                  value={newSkillLevel} 
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors duration-300"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors duration-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-indigo-650 text-white rounded-xl font-semibold hover:bg-indigo-700 text-sm transition-colors duration-300"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
