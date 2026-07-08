import React, { useState, useEffect } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import { 
  Search, User, Trash2, 
  Loader2, AlertCircle, ChevronLeft, ChevronRight, Eye, RefreshCw, CheckCircle2 
} from 'lucide-react';

const AdminUsers = () => {
  const { 
    currentUser: loggedInAdmin,
    getAdminUsers, 
    updateAdminUserRole, 
    updateAdminUserStatus, 
    deleteAdminUser 
  } = useApp();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message, type }
  
  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Modals / Details states
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const res = await getAdminUsers(page, 10, search, role, status, sortBy);
    setLoading(false);
    if (res.success) {
      setUsers(res.data.items || []);
      setTotalPages(res.data.pages || 1);
      setTotalUsersCount(res.data.total || 0);
    } else {
      setError(res.error || 'Failed to fetch user list.');
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
    fetchUsers();
  }, [page, search, role, status, sortBy]);

  const handleRoleToggle = async (userId, userName, currentRole) => {
    const nextRole = currentRole === 'Admin' ? 'Student' : 'Admin';
    if (!window.confirm(`Are you sure you want to change the role of user "${userName}" to ${nextRole}?`)) return;
    
    setActionLoading(true);
    const res = await updateAdminUserRole(userId, nextRole);
    setActionLoading(false);
    if (res.success) {
      showToast(`Successfully promoted "${userName}" to ${nextRole}!`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, role: nextRole });
      }
    } else {
      showToast(res.error || 'Failed to update user role.', 'error');
    }
  };

  const handleStatusChange = async (userId, userName, nextStatus) => {
    const actionMap = {
      'active': 'Enable/Unban',
      'disabled': 'Disable',
      'banned': 'Ban'
    };
    const actionLabel = actionMap[nextStatus] || 'Update Status';
    if (!window.confirm(`Are you sure you want to ${actionLabel} user "${userName}"?`)) return;

    setActionLoading(true);
    const res = await updateAdminUserStatus(userId, nextStatus);
    setActionLoading(false);
    if (res.success) {
      showToast(`Successfully completed "${actionLabel}" for user "${userName}"!`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, status: nextStatus });
      }
    } else {
      showToast(res.error || 'Failed to update status.', 'error');
    }
  };

  const handleSoftDelete = async (userId, userName) => {
    if (!window.confirm(`Warning: Are you sure you want to soft delete the user "${userName}"? The user's account will be deactivated and marked as deleted.`)) return;

    setActionLoading(true);
    const res = await deleteAdminUser(userId);
    setActionLoading(false);
    if (res.success) {
      showToast(`Successfully soft-deleted user "${userName}".`);
      fetchUsers();
      setSelectedUser(null);
    } else {
      showToast(res.error || 'Failed to delete user.', 'error');
    }
  };

  const getStatusStyle = (val) => {
    const styles = {
      'active': 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/45 dark:text-emerald-400 dark:border-emerald-900/50',
      'disabled': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/45 dark:text-amber-450 dark:border-amber-900/50',
      'banned': 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/45 dark:text-rose-400 dark:border-rose-900/50',
      'deleted': 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    };
    return styles[val] || styles['active'];
  };

  const getRoleStyle = (val) => {
    if (val === 'Admin') {
      return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/45 dark:text-purple-400 dark:border-purple-900/50';
    }
    return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/45 dark:text-blue-450 dark:border-blue-900/50';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit user roles, toggle bans, soft delete profiles, and moderate settings.
          </p>
        </div>
      </div>

      {/* Filters & Search Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/50 dark:border-slate-800/60 shadow-sm">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-650 dark:text-slate-250 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="Student">Student</option>
            <option value="Mentor">Mentor</option>
            <option value="Admin">Admin</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-650 dark:text-slate-250 focus:outline-none"
          >
            <option value="">Active/Banned/Disabled</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
            <option value="banned">Banned Only</option>
            <option value="deleted">Deleted Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-650 dark:text-slate-250 focus:outline-none"
          >
            <option value="">Newest Joined</option>
            <option value="oldest">Oldest Joined</option>
            <option value="name">Sort by Name</option>
          </select>
        </form>
      </div>

      {/* Error / Content States */}
      {error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/45 border border-rose-100 dark:border-rose-900/40 rounded-3xl flex items-center gap-2 text-rose-700 dark:text-rose-450">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : !loading && users.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 text-slate-450 rounded-full w-fit mx-auto">
            <User className="h-10 w-10 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-955 dark:text-white">
              No Users Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              No registered user profiles matched your current search query or active filter settings.
            </p>
          </div>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">University</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Warnings & Reports</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-50 dark:border-slate-800/60">
                      <td className="px-6 py-4.5 flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0" />
                        <div className="space-y-1.5 flex-grow">
                          <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                          <div className="h-3 w-40 bg-slate-150 dark:bg-slate-805 rounded-lg" />
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-5 w-16 bg-slate-150 dark:bg-slate-800 rounded-full" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-5 w-16 bg-slate-150 dark:bg-slate-800 rounded-full" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-5 w-24 bg-slate-150 dark:bg-slate-800 rounded-full animate-pulse" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  users.map((item) => {
                    const isSelf = loggedInAdmin.id === item._id;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors">
                        <td className="px-6 py-4.5 flex items-center gap-3">
                          {item.profileImage ? (
                            <img 
                              src={getProfileImageUrl(item.profileImage, item.updatedAt)} 
                              alt="Avatar" 
                              className="h-9 w-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full shrink-0">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-white font-semibold">{item.name}</span>
                            <span className="text-xs text-slate-450 dark:text-slate-550 font-normal">{item.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-slate-655 dark:text-slate-350">
                          {item.university || 'Not Listed'}
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getRoleStyle(item.role)}`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col gap-1 text-[11px]">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-400">Warns:</span>
                              <span className={`font-bold ${item.warningsCount >= 3 ? 'text-rose-650' : 'text-slate-800 dark:text-slate-200'}`}>
                                {item.warningsCount || 0}
                              </span>
                              {item.warningsCount >= 3 && (
                                <span className="px-1.5 py-0.5 text-[8px] bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 font-bold rounded-md uppercase tracking-wider">
                                  Sus. Rec
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-normal">
                              <span>Recv: {item.reportsReceivedCount || 0}</span>
                              <span>•</span>
                              <span>Subm: {item.reportsSubmittedCount || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 text-xs font-normal">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              title="View Profile Details"
                              disabled={actionLoading}
                              onClick={() => setSelectedUser(item)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            
                            <button
                              title="Toggle Admin/Student Role"
                              disabled={isSelf || actionLoading}
                              onClick={() => handleRoleToggle(item._id, item.name, item.role)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                            >
                              <RefreshCw className="h-4.5 w-4.5" />
                            </button>

                            <button
                              title="Soft Delete User"
                              disabled={isSelf || actionLoading || item.status === 'deleted'}
                              onClick={() => handleSoftDelete(item._id, item.name)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-650 dark:hover:text-rose-400 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <strong className="font-semibold text-slate-900 dark:text-white">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalUsersCount)}</strong> of <strong className="font-semibold text-slate-900 dark:text-white">{totalUsersCount}</strong> users
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

      {/* User Details Modal drawer */}
      {selectedUser && (
        <div 
          onClick={() => setSelectedUser(null)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-6 space-y-6 relative"
          >
            {/* Header info */}
            <div className="flex items-center gap-4.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              {selectedUser.profileImage ? (
                <img 
                  src={getProfileImageUrl(selectedUser.profileImage, selectedUser.updatedAt)} 
                  alt="Avatar" 
                  className="h-16 w-16 rounded-full object-cover shrink-0 border-2 border-indigo-50"
                />
              ) : (
                <div className="p-3 bg-slate-100 dark:bg-slate-850 text-slate-400 rounded-full shrink-0">
                  <User className="h-10 w-10" />
                </div>
              )}
              <div className="space-y-0.5">
                <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white">
                  {selectedUser.name}
                </h3>
                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusStyle(selectedUser.status)}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Email</span>
                <span className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed truncate block">{selectedUser.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Role</span>
                <span className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed block">{selectedUser.role}</span>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">University</span>
                <span className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed block">{selectedUser.university || 'Not Listed'}</span>
              </div>

              {/* Moderation Metrics */}
              <div className="space-y-1">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Warnings Count</span>
                <span className="text-slate-850 dark:text-slate-200 text-sm leading-relaxed block font-bold">{selectedUser.warningsCount || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Reports Received</span>
                <span className="text-rose-650 dark:text-rose-400 text-sm leading-relaxed block font-bold">{selectedUser.reportsReceivedCount || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Reports Submitted</span>
                <span className="text-slate-850 dark:text-slate-200 text-sm leading-relaxed block font-bold">{selectedUser.reportsSubmittedCount || 0}</span>
              </div>

              {selectedUser.bio && (
                <div className="space-y-1 col-span-2">
                  <span className="text-slate-450 dark:text-slate-550 block font-bold uppercase tracking-wider">Bio</span>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-normal leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}
            </div>

            {/* Quick Moderation Controls inside Drawer */}
            {selectedUser._id !== loggedInAdmin.id && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Moderation Controls</span>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.status !== 'active' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(selectedUser._id, selectedUser.name, 'active')}
                      className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      Enable/Unban
                    </button>
                  )}
                  {selectedUser.status === 'active' && (
                    <p className="text-[10px] text-slate-400 font-normal">
                      ⚠️ Account is active. To warn, disable, or ban this user, please process it through their respective review tickets in the <strong>Reports</strong> tab.
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
