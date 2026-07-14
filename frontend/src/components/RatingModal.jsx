import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { Star, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Accessible Modal for rating the teacher immediately after a successful completion.
 */
const RatingModal = () => {
  const { ratingTarget, setRatingTarget, submitFeedback, getUserProfile } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    if (ratingTarget) {
      setRating(5);
      setComment('');
      setErrorMsg('');
      setSuccess(false);
    }
  }, [ratingTarget]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && ratingTarget) {
        setRatingTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ratingTarget, setRatingTarget]);

  if (!ratingTarget) return null;

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setRatingTarget(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const metadata = JSON.stringify({
        swapRequestId: ratingTarget.swapRequestId,
        teacherId: ratingTarget.teacherId,
        feedbackText: comment.trim()
      });

      const formData = new FormData();
      formData.append('type', 'General Feedback');
      formData.append('title', 'Teacher Rating');
      formData.append('rating', rating);
      formData.append('description', metadata);
      formData.append('pageUrl', window.location.href);
      formData.append('routeName', 'Dashboard');
      formData.append('browser', navigator.userAgent.indexOf('Chrome') !== -1 ? 'Chrome' : 'Browser');
      formData.append('platform', navigator.platform || 'Web');
      formData.append('screenResolution', `${window.innerWidth}x${window.innerHeight}`);

      const res = await submitFeedback(formData);

      if (res.success) {
        setSuccess(true);
        // Instantly reload profile to update XP, ratingAverage and count
        await getUserProfile();
        setTimeout(() => {
          setRatingTarget(null);
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to submit rating.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-modal-title"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 id="rating-modal-title" className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Rate your Teacher
          </h2>
          <button 
            onClick={() => setRatingTarget(null)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Thank you!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your rating and feedback have been submitted successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Teacher Info */}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Session Completed with
                </p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {ratingTarget.teacherName}
                </h4>
              </div>

              {/* Star Selection */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform active:scale-95 duration-100"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 stroke-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Fair' : 'Poor'} ({rating}/5)
                </span>
              </div>

              {/* Feedback Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="rating-feedback" 
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Optional Feedback
                </label>
                <textarea
                  id="rating-feedback"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about your learning experience..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all duration-200 hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
