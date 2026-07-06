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

  // Manage socket.io-client lifecycle
  useEffect(() => {
    let activeSocket = null;
    if (token) {
      activeSocket = io(API_BASE_URL, {
        auth: { token }
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
    getUserProfile,
    updateUserProfile,
    getMatchedUsers,
    sendSwapRequest,
    getSentRequests,
    getReceivedRequests,
    acceptSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest,
    getConversations,
    getMessages,
    sendChatMessage,
    uploadChatAttachment,
    getPlatformStatistics,
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
