import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import EmptyState from '@components/EmptyState.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import { 
  BookOpen, Clock, Calendar, Star, Plus, 
  CheckCircle, Sparkles, BookOpen as BookIcon, Award, AlertCircle, User
} from 'lucide-react';

/**
 * Production-ready Dashboard page.
 * Displays only authentic user profile stats, using reusable EmptyState components
 * for unconfigured fields, and integrates full dark mode theme styling.
 */
const Dashboard = () => {
  const { 
    currentUser, token, addUserSkillToTeach, getMatchedUsers, 
    sendSwapRequest, getSentRequests, getReceivedRequests,
    setReportTargetUser, setIsReportModalOpen 
  } = useApp();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technology');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
  const [matches, setMatches] = useState([]);
  const [requestsMap, setRequestsMap] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Guard routing for unauthenticated sessions
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch matches and requests on load
  useEffect(() => {
    if (token) {
      fetchMatches();
      fetchRequests();
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
      const map = {};
      (receivedRes.requests || []).forEach(req => {
        if (req.sender) {
          map[req.sender._id] = req.status;
        }
      });
      (sentRes.requests || []).forEach(req => {
        if (req.receiver) {
          map[req.receiver._id] = req.status;
        }
      });
      setRequestsMap(map);
    }
  };

  if (!token) {
    return null; 
  }

  const openModal = () => {
    setModalError('');
    setNewSkillName('');
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
    ratingAverage: 5.0
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setModalError('');
    const result = await addUserSkillToTeach(newSkillName.trim());
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

        <button 
          onClick={openModal}
          className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Skill to Teach
        </button>
      </div>

      {/* 2. Overview Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sessions Held */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sessions Held</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {user.totalSessions || 0}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl theme-transition">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Hours Shared */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hours Shared</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {user.totalTeachingHours || 0} Hrs
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl theme-transition">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Avg Rating */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Rating</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-1.5">
              {(user.ratingAverage ?? 0).toFixed(1)} 
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl theme-transition">
            <Star className="h-5 w-5" />
          </div>
        </div>

        {/* Verification Check */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex items-center justify-between theme-transition">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reputation Status</span>
            <div className="font-display font-bold text-xl text-slate-800 dark:text-white">Active Student</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl theme-transition">
            <CheckCircle className="h-5 w-5" />
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
              <div className="space-y-4">
                {matches.map((peer) => (
                  <div key={peer.id} className="p-6 bg-slate-50 dark:bg-slate-950/40 border border-transparent dark:border-slate-800/50 rounded-2xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      {/* Avatar Photo */}
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
                      
                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{peer.name}</h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                            {peer.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {peer.university || 'No University'} {peer.branch ? `• ${peer.branch}` : ''}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {peer.ratingAverage ? peer.ratingAverage.toFixed(1) : '0.0'} ({peer.totalSessions || 0} sessions)
                          </span>
                          <span>•</span>
                          <span>Profile: {peer.profileCompletionPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill overlaps */}
                    <div className="flex-grow max-w-md w-full space-y-2">
                      {peer.commonLearnSkills && peer.commonLearnSkills.length > 0 && (
                        <div className="text-xs">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">They can teach you:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{peer.commonLearnSkills.join(', ')}</span>
                        </div>
                      )}
                      {peer.commonTeachSkills && peer.commonTeachSkills.length > 0 && (
                        <div className="text-xs">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">They want to learn:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{peer.commonTeachSkills.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Swap CTA & Report User */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full xl:w-auto">
                      {(() => {
                        const reqStatus = requestsMap[peer.id];
                        const isProcessing = processingId === peer.id;
                        
                        if (reqStatus === 'Pending') {
                          return (
                            <button 
                              type="button" 
                              disabled
                              className="w-full xl:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-550 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700/55 select-none cursor-not-allowed transition-all"
                            >
                              Request Pending
                            </button>
                          );
                        }
                        
                        if (reqStatus === 'Accepted') {
                          return (
                            <button 
                              type="button" 
                              disabled
                              className="w-full xl:w-auto px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-105 dark:border-emerald-900/50 select-none cursor-not-allowed transition-all"
                            >
                              Accepted
                            </button>
                          );
                        }

                        return (
                          <button 
                            type="button" 
                            disabled={isProcessing}
                            onClick={() => handleRequestSwap(peer.id)}
                            className="w-full xl:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl text-xs font-bold hover:from-indigo-700 hover:to-blue-600 shadow-md shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-60 cursor-pointer"
                          >
                            {isProcessing ? 'Processing...' : 'Request Swap'}
                          </button>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetUser({ id: peer.id, name: peer.name });
                          setIsReportModalOpen(true);
                        }}
                        className="px-4 py-2.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-600 dark:text-rose-455 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                      >
                        ⚠ Report
                      </button>
                    </div>
                  </div>
                ))}
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
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white transition-colors duration-300">Add Skill to Teach</h3>
            
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
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 text-sm transition-colors duration-300"
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
