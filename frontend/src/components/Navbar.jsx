import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import { GraduationCap, Menu, X, ArrowRight, LogOut, User, ChevronDown, Bell, ShieldAlert, CheckCircle, XCircle, Award, Check, AlertTriangle } from 'lucide-react';

/**
 * Sticky responsive header navigation bar.
 * Designed with a polished glassmorphism effect on scroll.
 */
const Navbar = () => {
  const { 
    isAuthenticated, currentUser, logoutUser, 
    getUserNotifications, markNotificationRead, markAllNotificationsRead,
    socket
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (isAuthenticated) {
      const res = await getUserNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 8000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket && isAuthenticated) {
      const handleNotifUpdate = () => {
        fetchNotifications();
      };
      socket.on('notification_update', handleNotifUpdate);
      return () => {
        socket.off('notification_update', handleNotifUpdate);
      };
    }
  }, [socket, isAuthenticated]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    const res = await markNotificationRead(id);
    if (res.success) {
      setNotifications(res.notifications || []);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    const res = await markAllNotificationsRead();
    if (res.success) {
      setNotifications(res.notifications || []);
    }
  };

  const getNotifDetails = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('warning')) {
      return { title: 'Account Warning', icon: ShieldAlert, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
    }
    if (lower.includes('disabled') || lower.includes('banned')) {
      return { title: 'Account Action', icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' };
    }
    if (lower.includes('accepted')) {
      return { title: 'Swap Accepted', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' };
    }
    if (lower.includes('rejected')) {
      return { title: 'Swap Rejected', icon: XCircle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' };
    }
    if (lower.includes('completed')) {
      return { title: 'Session Completed', icon: Award, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' };
    }
    return { title: 'New Alert', icon: Bell, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' };
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Navigation Links configuration (full list for mobile drawer)
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
  ];

  if (isAuthenticated) {
    if (!navLinks.some(link => link.path === '/dashboard')) {
      navLinks.push({ name: 'Dashboard', path: '/dashboard' });
    }
    if (!navLinks.some(link => link.path === '/profile')) {
      navLinks.push({ name: 'Profile', path: '/profile' });
    }
    if (!navLinks.some(link => link.path === '/swaps/incoming')) {
      navLinks.push({ name: 'Received Swaps', path: '/swaps/incoming' });
    }
    if (!navLinks.some(link => link.path === '/swaps/sent')) {
      navLinks.push({ name: 'Sent Swaps', path: '/swaps/sent' });
    }
    if (!navLinks.some(link => link.path === '/chat')) {
      navLinks.push({ name: 'Chat', path: '/chat' });
    }
    if (!navLinks.some(link => link.path === '/feedback/my')) {
      navLinks.push({ name: 'My Feedback', path: '/feedback/my' });
    }
  }

  // Primary navigation links for desktop header
  const primaryLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
  ];
  if (isAuthenticated) {
    primaryLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  // Monitor scrolling to toggle background opacity/blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-indigo-50/50 dark:border-slate-800/40 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand area */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl text-white shadow-md shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:to-slate-200 bg-clip-text text-transparent transition-colors duration-300">
              SkillSwap<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">.</span>AI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-3 lg:gap-6">
              {primaryLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-medium text-sm transition-colors duration-300 relative py-1 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                    isActive(link.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA / Action Buttons */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {isAuthenticated ? (
                <>
                  {/* Notification Dropdown */}
                  <div ref={notifRef} className="relative">
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      className="relative p-2 text-slate-600 dark:text-slate-355 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50"
                      aria-label="View notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>

                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl z-50 animate-fade-in text-sm flex flex-col max-h-96 overflow-hidden">
                        {/* Header */}
                        <div className="px-4.5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            Notifications
                            {unreadCount > 0 && (
                              <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72">
                          {sortedNotifications.length > 0 ? (
                            sortedNotifications.map((notif) => {
                              const details = getNotifDetails(notif.message);
                              const IconComponent = details.icon;
                              return (
                                <div
                                  key={notif._id}
                                  onClick={(e) => {
                                    if (!notif.read) handleMarkRead(e, notif._id);
                                  }}
                                  className={`p-4 flex items-start gap-3 transition-colors ${
                                    notif.read 
                                      ? 'hover:bg-slate-50 dark:hover:bg-slate-850/40' 
                                      : 'bg-indigo-50/15 dark:bg-indigo-950/10 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
                                  }`}
                                >
                                  {/* Icon */}
                                  <div className={`p-2 rounded-xl shrink-0 ${details.color}`}>
                                    <IconComponent className="h-4 w-4" />
                                  </div>

                                  {/* Body */}
                                  <div className="space-y-1 flex-grow">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="font-bold text-xs text-slate-900 dark:text-white leading-none">
                                        {details.title}
                                      </span>
                                      {!notif.read && (
                                        <button
                                          onClick={(e) => handleMarkRead(e, notif._id)}
                                          className="p-0.5 bg-slate-105 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-455 rounded-md cursor-pointer transition-colors"
                                          title="Mark as read"
                                        >
                                          <Check className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                                      {notif.message}
                                    </p>
                                    <span className="text-[9px] text-slate-400 block pt-0.5">
                                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-1.5">
                              <Bell className="h-6 w-6 stroke-[1.5]" />
                              <span className="text-xs font-semibold">No notifications yet.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 text-slate-700 dark:text-slate-200 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200/40 dark:hover:bg-slate-800/80 rounded-xl px-3 py-1.5 border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300 cursor-pointer"
                    >
                      {currentUser?.profileImage ? (
                        <img 
                          src={getProfileImageUrl(currentUser.profileImage, currentUser.updatedAt)} 
                          alt="Avatar" 
                          className="h-5 w-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <User className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold">{currentUser?.name}</span>
                      <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-sm">
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/swaps/incoming" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      >
                        Received Swaps
                      </Link>
                      <Link 
                        to="/swaps/sent" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      >
                        Sent Swaps
                      </Link>
                      <Link 
                        to="/chat" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      >
                        Chat
                      </Link>
                      <Link 
                        to="/feedback/my" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      >
                        My Feedback
                      </Link>
                      <Link 
                        to="/reports/my" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      >
                        My Reports
                      </Link>
                      {currentUser?.role === 'Admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 font-bold text-indigo-650 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logoutUser();
                        }}
                        className="w-full text-left px-4 py-2 text-rose-650 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
                <>
                  <Link 
                    to="/login" 
                    className="font-medium text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 px-4 py-2"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center gap-1.5 font-medium text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all px-5 py-2.5 rounded-full"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle & Theme Toggle Area */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-300"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'
      }`}>
        <div className="px-4 pt-2 pb-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-xl font-medium text-base transition-colors duration-300 ${
                isActive(link.path) 
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
          <div className="flex flex-col gap-3 px-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  logoutUser();
                }}
                className="w-full text-center font-medium py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors duration-300 flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center font-medium py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center font-medium py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
