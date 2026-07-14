import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@utils/config.js';
import io from 'socket.io-client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackInitialType, setFeedbackInitialType] = useState('General Feedback');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetUser, setReportTargetUser] = useState(null); // { id, name }
  const [ratingTarget, setRatingTarget] = useState(null); // { swapRequestId, teacherId, teacherName }

  // Manage socket.io-client lifecycle
  useEffect(() => {
    let activeSocket = null;
    if (token) {
      activeSocket = io(API_BASE_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 5000,
        reconnectionDelayMax: 20000,
        timeout: 10000
      });
      setSocket(activeSocket);
    } else {
      setSocket(null);
    }

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [token]);

  // Sync profile details automatically on socket updates
  useEffect(() => {
    if (!socket) return;
    const handleNotificationUpdate = () => {
      getUserProfile();
    };
    socket.on('notification_update', handleNotificationUpdate);
    return () => {
      socket.off('notification_update', handleNotificationUpdate);
    };
  }, [socket]);

  // Sync state changes with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  // Authenticate user via Login API
  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || 'Login failed. Please verify credentials.');
      }
      
      setToken(resData.data.token);
      setCurrentUser(resData.data.user);
      return { success: true };
    } catch (error) {
      console.error('Authentication Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Register user via Register API
  const registerUser = async (name, email, password, skillsToTeach = [], skillsToLearn = []) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, skillsToTeach, skillsToLearn }),
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || 'Registration failed.');
      }
      
      setToken(resData.data.token);
      setCurrentUser(resData.data.user);
      return { success: true };
    } catch (error) {
      console.error('Registration Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  
  // Add user skill to teach
  const addUserSkillToTeach = async (skill) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/skills/teach`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to add skill.');
      }

      // Update local storage and context user details
      setCurrentUser(resData.data.user);
      localStorage.setItem('user', JSON.stringify(resData.data.user));
      return { success: true };
    } catch (error) {
      console.error('Add Skill Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Add user skill to learn
  const addUserSkillToLearn = async (skill) => {
    setLoading(true);
    try {
      const currentSkills = currentUser?.skillsToLearn || [];
      const updatedSkills = [...currentSkills, skill.trim()];
      
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skillsToLearn: updatedSkills }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to add skill.');
      }

      // Sync state and storage
      setCurrentUser(resData.data.user);
      localStorage.setItem('user', JSON.stringify(resData.data.user));
      return { success: true };
    } catch (error) {
      console.error('Add Learn Skill Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get user profile details
  const getUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch profile.');
      }

      // Sync state and storage
      console.log("AppContext getUserProfile response:", { xp: resData.data.user.xp, level: resData.data.user.level });
      setCurrentUser(resData.data.user);
      localStorage.setItem('user', JSON.stringify(resData.data.user));
      return { success: true, user: resData.data.user };
    } catch (error) {
      console.error('Fetch Profile Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile details (multipart/form-data for image support)
  const updateUserProfile = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to update profile.');
      }

      // Sync state and storage
      setCurrentUser(resData.data.user);
      localStorage.setItem('user', JSON.stringify(resData.data.user));
      return { success: true, user: resData.data.user };
    } catch (error) {
      console.error('Update Profile Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get matched peers
  const getMatchedUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/matches`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch matches.');
      }

      return { success: true, matches: resData.data.matches };
    } catch (error) {
      console.error('Fetch Matches Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Send Swap Request
  const sendSwapRequest = async (receiverId, message) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, message })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to send request.');
      }

      return { success: true, request: resData.data.request };
    } catch (error) {
      console.error('Send Swap Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get Sent Requests
  const getSentRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/sent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch sent requests.');
      }

      return { success: true, requests: resData.data.requests };
    } catch (error) {
      console.error('Get Sent Requests Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get Received Requests
  const getReceivedRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/received`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch received requests.');
      }

      return { success: true, requests: resData.data.requests };
    } catch (error) {
      console.error('Get Received Requests Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Accept request
  const acceptSwapRequest = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/${id}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to accept request.');
      }

      return { success: true, request: resData.data.request };
    } catch (error) {
      console.error('Accept Request Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reject request
  const rejectSwapRequest = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to reject request.');
      }

      return { success: true, request: resData.data.request };
    } catch (error) {
      console.error('Reject Request Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cancel request
  const cancelSwapRequest = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/${id}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to cancel request.');
      }

      return { success: true, request: resData.data.request };
    } catch (error) {
      console.error('Cancel Request Error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Request session completion
  const requestSwapCompletion = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/${id}/request-completion`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to request session completion.');
      }
      return { success: true, request: resData.data.request };
    } catch (error) {
      console.error('Request Swap Completion Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Accept session completion
  const acceptSwapCompletion = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/${id}/accept-completion`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to accept session completion.');
      }
      await getUserProfile();
      return { success: true, request: resData.data.request };
    } catch (error) {
      console.error('Accept Swap Completion Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Reject session completion
  const rejectSwapCompletion = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/swaps/${id}/reject-completion`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to reject session completion.');
      }
      return { success: true, request: resData.data.request };
    } catch (error) {
      console.error('Reject Swap Completion Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Get all active conversations
  const getConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch conversations.');
      }

      return { success: true, conversations: resData.data.conversations };
    } catch (error) {
      console.error('Get Conversations Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Get conversation messages (paginated)
  const getMessages = async (conversationId, limit = 30, before = null) => {
    try {
      let url = `${API_BASE_URL}/api/chat/${conversationId}/messages?limit=${limit}`;
      if (before) {
        url += `&before=${encodeURIComponent(before)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch messages.');
      }

      return { success: true, messages: resData.data.messages };
    } catch (error) {
      console.error('Get Messages Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Send message REST fallback
  const sendChatMessage = async (receiverId, text, messageType = 'text', attachmentUrl = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, text, messageType, attachmentUrl })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to send message.');
      }

      return { success: true, message: resData.data.message };
    } catch (error) {
      console.error('Send Chat Message Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Upload chat attachment file with progress tracking
  const uploadChatAttachment = async (formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/api/chat/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      // Track progress
      if (xhr.upload && onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress(percentage);
          }
        });
      }

      xhr.onload = () => {
        let responseData;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {
          responseData = { success: false, message: 'Invalid response from server.' };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(responseData);
        } else {
          reject(new Error(responseData.message || 'Attachment upload failed.'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload.'));
      };

      xhr.send(formData);
    });
  };

  // Fetch landing page statistics
  const getPlatformStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/statistics`, {
        method: 'GET'
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch platform statistics.');
      }
      return { success: true, stats: resData.data };
    } catch (error) {
      console.error('Get Stats Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Submit feedback with screenshot support (multipart/form-data)
  const submitFeedback = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to submit feedback.');
      }
      return { success: true, data: resData.data };
    } catch (error) {
      console.error('Submit Feedback Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Get current user's feedback submissions (paginated)
  const getMyFeedback = async (page = 1, limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/my?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch feedback history.');
      }
      return { success: true, data: resData.data };
    } catch (error) {
      console.error('Get Feedback Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Helper for admin API calls
  const adminFetch = async (endpoint, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/api/admin${endpoint}`, {
      ...options,
      headers,
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.message || 'Admin request failed.');
    }
    return { success: true, data: resData.data };
  };

  const getAdminDashboard = async () => {
    try {
      return await adminFetch('/dashboard');
    } catch (error) {
      console.error('Admin Dashboard Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const getAdminUsers = async (page = 1, limit = 10, search = '', role = '', status = '', sortBy = '') => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        role,
        status,
        sortBy
      }).toString();
      return await adminFetch(`/users?${queryParams}`);
    } catch (error) {
      console.error('Admin Users Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateAdminUserRole = async (id, role) => {
    try {
      return await adminFetch(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      console.error('Admin Role Edit Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateAdminUserStatus = async (id, status) => {
    try {
      return await adminFetch(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Admin Status Edit Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteAdminUser = async (id) => {
    try {
      return await adminFetch(`/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Admin Delete User Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const getAdminFeedbacks = async (page = 1, limit = 10, search = '', type = '', status = '', sortBy = '') => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        type,
        status,
        sortBy
      }).toString();
      return await adminFetch(`/feedback?${queryParams}`);
    } catch (error) {
      console.error('Admin Feedback Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateAdminFeedback = async (id, status, adminNote) => {
    try {
      return await adminFetch(`/feedback/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote }),
      });
    } catch (error) {
      console.error('Admin Feedback Moderation Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Submit User Report
  const submitUserReport = async (reportedUserId, reason, description, file) => {
    try {
      const formData = new FormData();
      formData.append('reportedUser', reportedUserId);
      formData.append('reason', reason);
      formData.append('description', description);
      if (file) {
        formData.append('screenshot', file);
      }

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to submit user report.');
      }
      return { success: true, report: resData.data };
    } catch (error) {
      console.error('Submit User Report Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Fetch My Reports
  const getMyReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/my`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch my reports.');
      }
      return { success: true, reports: resData.data };
    } catch (error) {
      console.error('Get My Reports Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Fetch Admin Reports (Admin Only)
  const getAdminReports = async (page = 1, limit = 10, search = '', reason = '', status = '', sortBy = 'newest') => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        reason,
        status,
        sortBy
      });
      return await adminFetch(`/reports?${queryParams.toString()}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Admin Fetch Reports Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Update Report, Warn, Disable, Ban (Admin Only)
  const updateAdminReport = async (reportId, action, status = '', adminNote = '') => {
    try {
      return await adminFetch(`/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, status, adminNote })
      });
    } catch (error) {
      console.error('Admin Update Report Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Fetch User Notifications
  const getUserNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch notifications.');
      }
      return { success: true, notifications: resData.data };
    } catch (error) {
      console.error('Fetch Notifications Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Clear Notifications
  const clearNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to clear notifications.');
      }
      return { success: true, notifications: [] };
    } catch (error) {
      console.error('Clear Notifications Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Mark One Notification as Read
  const markNotificationRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to mark notification as read.');
      }
      return { success: true, notifications: resData.data };
    } catch (error) {
      console.error('Mark Notification Read Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Mark All Notifications as Read
  const markAllNotificationsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/notifications`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to mark all notifications read.');
      }
      return { success: true, notifications: resData.data };
    } catch (error) {
      console.error('Mark All Notifications Read Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    token,
    socket,
    isAuthenticated: !!token,
    loading,
    loginUser,
    registerUser,
    logoutUser,
    addUserSkillToTeach,
    addUserSkillToLearn,
    getUserProfile,
    updateUserProfile,
    getMatchedUsers,
    sendSwapRequest,
    getSentRequests,
    getReceivedRequests,
    acceptSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest,
    requestSwapCompletion,
    acceptSwapCompletion,
    rejectSwapCompletion,
    getConversations,
    getMessages,
    sendChatMessage,
    uploadChatAttachment,
    getPlatformStatistics,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    feedbackInitialType,
    setFeedbackInitialType,
    submitFeedback,
    getMyFeedback,
    getAdminDashboard,
    getAdminUsers,
    updateAdminUserRole,
    updateAdminUserStatus,
    deleteAdminUser,
    getAdminFeedbacks,
    updateAdminFeedback,
    submitUserReport,
    getMyReports,
    getAdminReports,
    updateAdminReport,
    getUserNotifications,
    clearNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    isReportModalOpen,
    setIsReportModalOpen,
    reportTargetUser,
    setReportTargetUser,
    ratingTarget,
    setRatingTarget,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom Hook to consume AppState easily
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
