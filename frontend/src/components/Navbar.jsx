import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import { GraduationCap, Menu, X, ArrowRight, LogOut, User, ChevronDown } from 'lucide-react';

/**
 * Sticky responsive header navigation bar.
 * Designed with a polished glassmorphism effect on scroll.
 */
const Navbar = () => {
  const { isAuthenticated, currentUser, logoutUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

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

  // Click outside listener to close profile dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
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
