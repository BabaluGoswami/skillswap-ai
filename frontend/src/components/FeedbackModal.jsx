import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@context/AppContext.jsx';
import { Star, X, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Accessible Modal for Submitting Feedback, Bug Reports, and Feature Suggestions.
 * Captures user-agent info, screen metrics, route details, and optional screenshot attachments.
 */
const FeedbackModal = () => {
  const { 
    isFeedbackModalOpen, 
    setIsFeedbackModalOpen, 
    feedbackInitialType, 
    submitFeedback 
  } = useApp();
  const location = useLocation();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [type, setType] = useState('General Feedback');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null); // stores { feedbackId, status }

  const modalRef = useRef(null);

  // Sync initial type when opened via footer links
  useEffect(() => {
    if (isFeedbackModalOpen) {
      setType(feedbackInitialType || 'General Feedback');
      // Reset forms
      setRating(5);
      setTitle('');
      setDescription('');
      setScreenshot(null);
      setScreenshotPreview(null);
      setErrorMsg('');
      setSuccessData(null);
    }
  }, [isFeedbackModalOpen, feedbackInitialType]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFeedbackModalOpen) {
        setIsFeedbackModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFeedbackModalOpen, setIsFeedbackModalOpen]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsFeedbackModalOpen(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate screenshot specs
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid format: Only PNG, JPG, JPEG, and WebP are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Size limit exceeded: Screenshot must be under 5MB.');
      return;
    }

    setErrorMsg('');
    setScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const getRouteName = (pathname) => {
    const routeMap = {
      '/': 'Landing Page',
      '/dashboard': 'Dashboard',
      '/profile': 'Profile',
      '/chat': 'Chat',
      '/swaps/incoming': 'Incoming Swap Requests',
      '/swaps/sent': 'Sent Swap Requests',
      '/feedback/my': 'My Feedback History',
    };
    return routeMap[pathname] || 'Sub-Panel / Modal';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 10 || title.trim().length > 100) {
      setErrorMsg('Title must be between 10 and 100 characters.');
      return;
    }
    if (description.trim().length < 20 || description.trim().length > 1000) {
      setErrorMsg('Description must be between 20 and 1000 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    // Capture browser parameters dynamically
    const ua = navigator.userAgent;
    let browserName = "Unknown Browser";
    if (ua.indexOf("Chrome") > -1) browserName = "Google Chrome";
    else if (ua.indexOf("Firefox") > -1) browserName = "Mozilla Firefox";
    else if (ua.indexOf("Safari") > -1) browserName = "Apple Safari";
    else if (ua.indexOf("Edge") > -1) browserName = "Microsoft Edge";

    let platform = "Unknown Platform";
    if (navigator.userAgentData?.platform) {
      platform = navigator.userAgentData.platform;
    } else if (ua.indexOf("Windows") > -1) platform = "Windows";
    else if (ua.indexOf("Macintosh") > -1) platform = "macOS";
    else if (ua.indexOf("Linux") > -1) platform = "Linux";
    else if (ua.indexOf("Android") > -1) platform = "Android";
    else if (ua.indexOf("iPhone") > -1) platform = "iOS";

    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const pageUrl = window.location.href;
    const routeName = getRouteName(location.pathname);

    // Build form body
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('type', type);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('pageUrl', pageUrl);
    formData.append('routeName', routeName);
    formData.append('browser', browserName);
    formData.append('platform', platform);
    formData.append('screenResolution', screenResolution);
    
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }

    const result = await submitFeedback(formData);
    setSubmitting(false);

    if (result.success) {
      setSuccessData({
        feedbackId: result.data.feedbackId,
        status: result.data.status || 'Open'
      });
    } else {
      setErrorMsg(result.error || 'Failed to submit feedback report.');
    }
  };

  if (!isFeedbackModalOpen) return null;

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300 relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            {successData ? 'Submission Received' : 'Submit Feedback'}
          </h2>
          <button 
            onClick={() => setIsFeedbackModalOpen(false)}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {successData ? (
            /* Success Screen */
            <div className="text-center py-8 space-y-6 flex flex-col items-center justify-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full animate-bounce-slow">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                  Feedback ID: {successData.feedbackId}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                  Status: {successData.status}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
                Thank you! Your feedback has been submitted successfully. Admin review is ready.
              </p>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-full transition-colors duration-200"
              >
                Close Portal
              </button>
            </div>
          ) : (
            /* Feedback Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Rating Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rate your experience
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`h-7 w-7 transition-colors duration-150 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Feedback Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="General Feedback">General Feedback</option>
                  <option value="Report a Bug">Report a Bug</option>
                  <option value="Suggest a Feature">Suggest a Feature</option>
                </select>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <label>Title</label>
                  <span className={`${title.length >= 10 && title.length <= 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {title.length}/100
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Summarize your report..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <label>Description</label>
                  <span className={`${description.length >= 20 && description.length <= 1000 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {description.length}/1000
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Give detailed information so we can easily understand..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Screenshot picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Attach Screenshot (Optional)
                </label>
                {screenshotPreview ? (
                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group">
                    <img 
                      src={screenshotPreview} 
                      alt="Upload Preview" 
                      className="max-h-40 w-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 rounded-2xl p-6 cursor-pointer group transition-colors">
                    <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-colors mb-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      PNG, JPG, JPEG, or WebP up to 5MB
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Submit panel */}
              <button
                type="submit"
                disabled={submitting || title.length < 10 || title.length > 100 || description.length < 20 || description.length > 1000}
                className="w-full font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-2xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
