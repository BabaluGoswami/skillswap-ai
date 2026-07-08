import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@context/AppContext.jsx';
import { AlertCircle, Loader2, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';

const ReportModal = () => {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    reportTargetUser, 
    setReportTargetUser, 
    submitUserReport 
  } = useApp();

  const [reason, setReason] = useState('Spam');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isReportModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReportModalOpen]);

  if (!isReportModalOpen || !reportTargetUser) return null;

  const handleClose = () => {
    setIsReportModalOpen(false);
    setReportTargetUser(null);
    setReason('Spam');
    setDescription('');
    setScreenshot(null);
    setScreenshotPreview(null);
    setIsConfirmed(false);
    setError('');
    setSuccess(false);
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot size cannot exceed 5MB.');
      return;
    }

    // Validate format
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only PNG, JPG, JPEG, and WebP formats are allowed.');
      return;
    }

    setScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmed) return;

    if (description.length < 20 || description.length > 1000) {
      setError('Description must be between 20 and 1000 characters.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await submitUserReport(reportTargetUser.id, reason, description, screenshot);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } else {
      setError(res.error || 'Failed to submit report.');
    }
  };

  return (
    <div 
      onClick={handleClose} 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl max-w-md w-full space-y-6 relative transition-all animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-950 dark:text-white">
              Report Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit a report against <strong className="text-slate-900 dark:text-white">{reportTargetUser.name}</strong>.
            </p>
          </div>
        </div>

        {/* Form */}
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-full w-fit mx-auto animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-slate-950 dark:text-white">Report Filed Successfully</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Moderators will inspect the profile details. You will receive an in-app notice when resolved.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs rounded-xl">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reason Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
              >
                <option value="Spam">Spam</option>
                <option value="Fake Profile">Fake Profile</option>
                <option value="Harassment">Harassment</option>
                <option value="Abusive Behaviour">Abusive Behaviour</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Scam">Scam</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                  Description
                </label>
                <span className={`font-semibold ${description.length < 20 || description.length > 1000 ? 'text-slate-400' : 'text-emerald-650'}`}>
                  {description.length} / 1000
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Detail what rules or terms this user is violating. Minimum 20 characters..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 resize-none dark:text-white"
              />
            </div>

            {/* Optional Screenshot */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">
                Upload Evidence (Optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                {screenshotPreview ? (
                  <img 
                    src={screenshotPreview} 
                    alt="Preview" 
                    className="h-16 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Click to upload screenshot</span>
                    <span className="text-[8px] text-slate-400">{"PNG, JPG, WebP < 5MB"}</span>
                  </>
                )}
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-2.5">
              <input
                id="confirm-genuine"
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-rose-650 focus:ring-rose-500 cursor-pointer"
              />
              <label 
                htmlFor="confirm-genuine"
                className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal font-medium select-none cursor-pointer"
              >
                I confirm that this report is genuine and I am filing it in good faith. I understand that submitting false reports may result in account action.
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isConfirmed || description.length < 20 || description.length > 1000}
                className="flex-1 py-3 bg-rose-650 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
