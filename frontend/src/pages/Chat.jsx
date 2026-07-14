import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import { getProfileImageUrl, getChatAttachmentUrl } from '@utils/imageHelper.js';
import { normalizeMessage } from '@utils/chatHelper.js';
import EmptyState from '@components/EmptyState.jsx';
import { 
  Send, User, Smile, ShieldAlert, AlertCircle, 
  Check, CheckCheck, Loader2, MessageSquare,
  Paperclip, FileText, Download, Eye, X, Award,
  ArrowLeft
} from 'lucide-react';

/**
 * Real-Time Chat platform.
 * Integrates Conversation Sidebar and Message Panels synced via REST & Socket.io.
 */
const Chat = ({ embeddedPeerId = null, onClose = null }) => {
  const [searchParams] = useSearchParams();
  const peerIdParam = searchParams.get('peerId');
  const effectivePeerId = embeddedPeerId || peerIdParam;

  const { 
    token, socket, currentUser, getConversations, 
    getMessages, sendChatMessage, uploadChatAttachment,
    setReportTargetUser, setIsReportModalOpen,
    requestSwapCompletion, acceptSwapCompletion, rejectSwapCompletion,
    getSentRequests, getReceivedRequests
  } = useApp();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingState, setTypingState] = useState({}); // convId -> boolean
  const [onlineStatusMap, setOnlineStatusMap] = useState({}); // userId -> boolean
  const [showEmojis, setShowEmojis] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [swapSession, setSwapSession] = useState(null);

  // Attachment upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Emojis list
  const emojis = ['😊', '👍', '🔥', '💻', '💡', '🚀', '🙌', '✨', '📚', '🤔'];

  // Load active conversations on mount
  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  // Fetch active swap session details
  const fetchSwapSession = async () => {
    if (!activeConv || !activeConv.peer) {
      setSwapSession(null);
      return;
    }
    const sentRes = await getSentRequests();
    const receivedRes = await getReceivedRequests();
    if (sentRes.success && receivedRes.success) {
      const all = [...(sentRes.requests || []), ...(receivedRes.requests || [])];
      const match = all.find(r => 
        (r.sender && r.sender._id === activeConv.peer.id) || 
        (r.receiver && r.receiver._id === activeConv.peer.id)
      );
      setSwapSession(match || null);
    }
  };

  useEffect(() => {
    fetchSwapSession();
  }, [activeConv]);

  // Disable html/body scrollbars on mount to prevent any footer layout shifting (only if not drawer)
  useEffect(() => {
    if (onClose) return;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
    };
  }, [onClose]);

  const loadConversations = async (selectConvId = null) => {
    const res = await getConversations();
    if (res.success) {
      setConversations(res.conversations || []);
      
      // Sync online statuses of peers from initial payload
      const presence = {};
      res.conversations.forEach(c => {
        if (c.peer) {
          presence[c.peer.id] = c.peer.isOnline;
        }
      });
      setOnlineStatusMap(prev => ({ ...prev, ...presence }));

      // Keep active conversation selected if it refreshed
      if (selectConvId) {
        const updatedActive = res.conversations.find(c => c.conversationId === selectConvId);
        if (updatedActive) {
          setActiveConv(updatedActive);
        }
      } else if (effectivePeerId) {
        const target = res.conversations.find(c => c.peer && c.peer.id === effectivePeerId);
        if (target) {
          setActiveConv(target);
        }
      }
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen to new messages
    const handleReceiveMessage = (msg) => {
      if (activeConv && msg.conversationId === activeConv.conversationId) {
        const normalized = normalizeMessage(msg, currentUser?.id || currentUser?._id);
        setMessages(prev => {
          if (prev.some(m => m._id === normalized._id)) return prev;
          return [...prev, normalized];
        });

        socket.emit('message_read', { 
          conversationId: activeConv.conversationId, 
          senderId: normalized.senderId 
        });
      }

      loadConversations(activeConv?.conversationId);
    };

    // Listen to typing status triggers
    const handleTyping = ({ conversationId }) => {
      setTypingState(prev => ({ ...prev, [conversationId]: true }));
    };

    const handleStopTyping = ({ conversationId }) => {
      setTypingState(prev => ({ ...prev, [conversationId]: false }));
    };

    // Listen to presence events
    const handleUserOnline = ({ userId }) => {
      setOnlineStatusMap(prev => ({ ...prev, [userId]: true }));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineStatusMap(prev => ({ ...prev, [userId]: false }));
    };

    // Listen to read receipts from peer
    const handleMessageRead = ({ conversationId }) => {
      if (activeConv && conversationId === activeConv.conversationId) {
        setMessages(prev => 
          prev.map(m => m.isMe ? { ...m, read: true } : m)
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('message_read', handleMessageRead);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('message_read', handleMessageRead);
    };
  }, [socket, activeConv]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.conversationId);
      
      // Let the sender know I opened/read this conversation
      if (socket) {
        socket.emit('message_read', { 
          conversationId: activeConv.conversationId, 
          senderId: activeConv.peer.id 
        });
      }
    }
  }, [activeConv]);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (convId, before = null) => {
    setErrorMsg('');
    if (!before) {
      setLoadingMessages(true);
      setMessages([]);
    }

    const res = await getMessages(convId, 30, before);
    if (res.success) {
      const normalized = (res.messages || []).map(m => normalizeMessage(m, currentUser?.id || currentUser?._id));
      if (before) {
        // Prepend older paginated messages
        setMessages(prev => [...normalized, ...prev]);
        if (normalized.length < 30) {
          setHasMoreMessages(false);
        }
      } else {
        setMessages(normalized);
        setHasMoreMessages(normalized.length === 30);
      }
    } else {
      setErrorMsg(res.error || 'Failed to load messages.');
    }
    setLoadingMessages(false);
  };

  // Prepend older messages on scroll top
  const handleScroll = () => {
    if (!scrollContainerRef.current || loadingMessages || !hasMoreMessages) return;

    if (scrollContainerRef.current.scrollTop === 0 && messages.length > 0) {
      const oldestMessageTimestamp = messages[0].createdAt;
      loadMessages(activeConv.conversationId, oldestMessageTimestamp);
    }
  };

  // Handle typing triggers
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (!socket || !activeConv) return;

    // Send typing event
    socket.emit('typing', { 
      conversationId: activeConv.conversationId, 
      receiverId: activeConv.peer.id 
    });

    // Clear previous timeout and schedule stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { 
        conversationId: activeConv.conversationId, 
        receiverId: activeConv.peer.id 
      });
    }, 2000);
  };

  // Handle file attachment selection and upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConv) return;

    setErrorMsg('');
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', activeConv.conversationId);
    if (inputText.trim()) {
      formData.append('text', inputText.trim());
      setInputText('');
    }

    try {
      const res = await uploadChatAttachment(formData, (progress) => {
        setUploadProgress(progress);
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to upload attachment.');
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred during file upload.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Send message API action
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const messageText = inputText.trim();
    setInputText('');
    setSendingMessage(true);

    // Stop typing indicator
    if (socket) {
      socket.emit('stop_typing', { 
        conversationId: activeConv.conversationId, 
        receiverId: activeConv.peer.id 
      });
    }

    // Call REST endpoint (it automatically broadcasts receive_message via socket)
    const res = await sendChatMessage(activeConv.peer.id, messageText);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to send message.');
    }
    setSendingMessage(false);
  };

  const handleSelectEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojis(false);
  };

  const getLastMessagePreview = (lastMessage) => {
    if (!lastMessage) return 'No messages yet';
    if (!lastMessage.messageType || lastMessage.messageType === 'text') {
      return lastMessage.text;
    }
    const prefix = lastMessage.messageType === 'image' 
      ? '📷 Photo' 
      : lastMessage.messageType === 'video' 
        ? '🎥 Video' 
        : '📄 Document';
    return lastMessage.text ? `${prefix}: ${lastMessage.text}` : prefix;
  };

  return (
    <div className="max-w-full w-full py-0 px-0 theme-transition h-[calc(100vh-4rem)] flex gap-0 overflow-hidden min-h-0 border-t border-slate-100 dark:border-slate-800/60">
      
      {/* Sidebar: Conversation listing */}
      <div className={`w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/60 flex flex-col overflow-hidden theme-transition shrink-0 min-h-0 ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            Active Chats
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => {
              const peer = conv.peer;
              const isSelected = activeConv?.conversationId === conv.conversationId;
              const isOnline = onlineStatusMap[peer.id] || false;
              const isTyping = typingState[conv.conversationId] || false;

              return (
                <button
                  key={conv.conversationId}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-4 text-left flex items-center gap-3 transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Peer Photo / Badge */}
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 shrink-0">
                      {peer.profileImage ? (
                        <img 
                          src={getProfileImageUrl(peer.profileImage, conv.updatedAt)} 
                          alt={peer.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-indigo-500" />
                      )}
                    </div>
                    {/* Status Dot */}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`} />
                  </div>

                  {/* Meta Details */}
                  <div className="flex-grow min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{peer.name}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-indigo-650 text-white text-[10px] font-bold h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {isTyping ? (
                        <span className="text-indigo-500 dark:text-indigo-400 font-semibold">typing...</span>
                      ) : (
                        getLastMessagePreview(conv.lastMessage)
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-20 text-center px-4">
              <p className="text-sm text-slate-400">No active swap chats yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className={`flex-grow bg-white dark:bg-slate-900 flex flex-col overflow-hidden theme-transition relative min-h-0 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Header Peer Info */}
            <div className="p-4 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setActiveConv(null)}
                  className="p-1 mr-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Back to Chats"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40">
                    {activeConv.peer.profileImage ? (
                      <img 
                        src={getProfileImageUrl(activeConv.peer.profileImage, activeConv.updatedAt)} 
                        alt={activeConv.peer.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-indigo-500" />
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                    onlineStatusMap[activeConv.peer.id] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{activeConv.peer.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    {typingState[activeConv.conversationId] ? (
                      <span className="text-indigo-500 dark:text-indigo-400 font-semibold">typing...</span>
                    ) : onlineStatusMap[activeConv.peer.id] ? (
                      'Online'
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReportTargetUser({ id: activeConv.peer.id, name: activeConv.peer.name });
                  setIsReportModalOpen(true);
                }}
                className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                ⚠ Report
              </button>
            </div>

            {/* Session Completion Workflow Banner */}
            {swapSession && (() => {
              const isTeacher = (swapSession.receiver?._id || swapSession.receiver || '').toString() === (currentUser?.id || currentUser?._id || '').toString();
              const isLearner = (swapSession.sender?._id || swapSession.sender || '').toString() === (currentUser?.id || currentUser?._id || '').toString();

              return (
                <div className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/20 px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                  {swapSession.status === 'Accepted' && (
                    <span className="text-xs text-slate-550 dark:text-slate-400 font-medium">
                      {isTeacher 
                        ? "Conducting learning session. Teach your student and share your knowledge!" 
                        : "Conducting learning session. Enjoy learning from your mentor!"}
                    </span>
                  )}

                  {swapSession.status === 'CompletionRequested' && (
                    isTeacher ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-bold animate-pulse flex items-center gap-1.5">
                        <Clock className="h-4 w-4 shrink-0" />
                        Waiting for student to accept session completion...
                      </span>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full">
                        <span className="text-xs text-slate-700 dark:text-slate-200 font-bold">
                          🎓 Your mentor has requested to complete this learning session.
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm('Reject completion request and continue this session?')) {
                                const res = await rejectSwapCompletion(swapSession._id);
                                if (res.success) {
                                  fetchSwapSession();
                                } else {
                                  setErrorMsg(res.error || 'Failed to reject completion.');
                                }
                              }
                            }}
                            className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-455 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Reject Completion
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm('Accept session completion? This will mark it as Completed.')) {
                                const res = await acceptSwapCompletion(swapSession._id);
                                if (res.success) {
                                  fetchSwapSession();
                                } else {
                                  setErrorMsg(res.error || 'Failed to accept completion.');
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
                          >
                            Accept Completion
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {swapSession.status === 'Completed' && (
                    <span className="text-xs text-emerald-650 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <Award className="h-4.5 w-4.5 shrink-0" />
                      Learning session completed successfully! Chat is read-only.
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-455 text-xs font-semibold flex items-center gap-2 shrink-0">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Messages Area */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-grow overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20 min-h-0"
            >
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.isMe;
                  const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });

                  return (
                    <div 
                      key={msg._id} 
                      className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 shrink-0">
                          {activeConv.peer.profileImage ? (
                            <img 
                              src={getProfileImageUrl(activeConv.peer.profileImage, activeConv.updatedAt)} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-4.5 w-4.5 text-indigo-500" />
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <div className={`p-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe 
                            ? 'bg-emerald-600 dark:bg-emerald-700 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-805 dark:text-slate-100 border border-slate-100 dark:border-slate-750/80 rounded-tl-none'
                        }`}>
                          {msg.messageType === 'image' && (
                            <div className="space-y-1">
                              <img 
                                src={getChatAttachmentUrl(msg.attachmentUrl)} 
                                alt={msg.fileName} 
                                className="max-w-xs md:max-w-sm rounded-xl max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setPreviewImage(getChatAttachmentUrl(msg.attachmentUrl))}
                                loading="lazy"
                              />
                              {msg.text && <p className="mt-2 text-xs">{msg.text}</p>}
                            </div>
                          )}
                          {msg.messageType === 'video' && (
                            <div className="space-y-1">
                              <video 
                                src={getChatAttachmentUrl(msg.attachmentUrl)} 
                                controls 
                                className="max-w-xs md:max-w-sm rounded-xl max-h-60 object-contain" 
                              />
                              {msg.text && <p className="mt-2 text-xs">{msg.text}</p>}
                            </div>
                          )}
                          {msg.messageType === 'file' && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/20 dark:border-slate-700/20">
                                <FileText className="h-8 w-8 text-indigo-500 shrink-0" />
                                <div className="min-w-0 flex-grow">
                                  <p className={`text-xs font-semibold truncate ${isMe ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {msg.fileName}
                                  </p>
                                  <p className="text-[10px] text-slate-450">
                                    {msg.fileSize ? (msg.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown size'}
                                  </p>
                                </div>
                                <a 
                                  href={getChatAttachmentUrl(msg.attachmentUrl)} 
                                  download={msg.fileName}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-white/10 dark:bg-white/5 hover:bg-white/20 text-indigo-500 rounded-lg hover:scale-105 transition-transform"
                                >
                                  <Download className="h-4 w-4 text-indigo-400" />
                                </a>
                              </div>
                              {msg.text && <p className="mt-1 text-xs">{msg.text}</p>}
                            </div>
                          )}
                          {(!msg.messageType || msg.messageType === 'text') && (
                            <p>{msg.text}</p>
                          )}
                        </div>
                        <span className={`text-[10px] text-slate-400 mt-1 block ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                          {timeStr}
                          {isMe && (
                            <span className="pl-1">
                              {msg.read ? (
                                <CheckCheck className="h-3.5 w-3.5 inline text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <Check className="h-3.5 w-3.5 inline text-slate-350" />
                              )}
                            </span>
                          )}
                        </span>
                      </div>

                      {isMe && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 shrink-0">
                          {currentUser?.profileImage ? (
                            <img 
                              src={getProfileImageUrl(currentUser.profileImage, currentUser.updatedAt)} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-4.5 w-4.5 text-indigo-500" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Panel */}
            {swapSession?.status === 'Completed' ? (
              <div className="px-6 py-5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200/55 dark:border-slate-800/80 text-center text-xs font-bold text-slate-500 dark:text-slate-400 select-none">
                🔒 This learning session has been completed. This conversation is now read-only.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center gap-3 bg-white dark:bg-slate-900 theme-transition relative shrink-0">
                
                {/* Upload Progress Overlay */}
                {uploading && (
                  <div className="absolute top-[-2.5rem] left-0 right-0 bg-slate-100 dark:bg-slate-800/90 text-xs px-4 py-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 font-semibold theme-transition z-10 shrink-0">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                      <span>Uploading attachment...</span>
                    </div>
                    <span className="text-indigo-650 dark:text-indigo-400">{uploadProgress !== null ? `${uploadProgress}%` : '0%'}</span>
                  </div>
                )}

                {/* Attachment Picker */}
                <div className="relative">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading || sendingMessage}
                  />
                  <button
                    type="button"
                    disabled={uploading || sendingMessage}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-400 hover:text-indigo-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Emoji Picker Button */}
                <div className="relative">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="p-2.5 text-slate-400 hover:text-indigo-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors disabled:opacity-50"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  {showEmojis && (
                    <div className="absolute bottom-14 left-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-2xl shadow-xl flex gap-1.5 z-55 theme-transition">
                      {emojis.map(e => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => handleSelectEmoji(e)}
                          className="text-lg hover:scale-125 transition-transform"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text Input Field */}
                <input
                  type="text"
                  placeholder={uploading ? "Uploading file..." : "Type a message..."}
                  value={inputText}
                  onChange={handleInputChange}
                  disabled={uploading}
                  className="flex-grow bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 theme-transition disabled:opacity-50"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={sendingMessage || uploading || !inputText.trim()}
                  className="p-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            )}
          </>
        ) : (
          <EmptyState 
            icon={ShieldAlert}
            title="No chat selected."
            description="Select an active conversation from the sidebar list to start chatting."
          />
        )}
      </div>

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-[-3rem] right-0 p-2 text-white hover:text-indigo-400 bg-white/10 rounded-full hover:scale-105 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Attachment Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
