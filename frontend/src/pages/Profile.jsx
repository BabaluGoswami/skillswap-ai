import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@context/AppContext.jsx';
import { getProfileImageUrl } from '@utils/imageHelper.js';
import { 
  User, Mail, School, BookOpen, Calendar, 
  Github, Linkedin, Globe, Edit2, Save, X, 
  Upload, AlertCircle, CheckCircle2, ShieldCheck 
} from 'lucide-react';

/**
 * Premium, fully responsive, Dark/Light Mode compatible Profile Management Page.
 */
const Profile = () => {
  const { token, currentUser, getUserProfile, updateUserProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Initialize Form
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: '',
      university: '',
      branch: '',
      year: '',
      bio: '',
      github: '',
      linkedin: '',
      portfolio: ''
    }
  });

  // Load profile values on page mount
  useEffect(() => {
    if (token) {
      fetchLatestData();
    }
  }, [token]);

  const fetchLatestData = async () => {
    setApiError('');
    const res = await getUserProfile();
    if (res.success && res.user) {
      reset({
        name: res.user.name || '',
        university: res.user.university || '',
        branch: res.user.branch || '',
        year: res.user.year || '',
        bio: res.user.bio || '',
        github: res.user.github || '',
        linkedin: res.user.linkedin || '',
        portfolio: res.user.portfolio || ''
      });
      if (res.user.profileImage) {
        setImagePreview(res.user.profileImage);
      }
    } else {
      setApiError(res.error || 'Failed to fetch the latest profile data from server.');
    }
  };

  const handleEditClick = () => {
    setApiError('');
    setApiSuccess('');
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setImageFile(null);
    setApiError('');
    setApiSuccess('');
    // Revert form values
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        university: currentUser.university || '',
        branch: currentUser.branch || '',
        year: currentUser.year || '',
        bio: currentUser.bio || '',
        github: currentUser.github || '',
        linkedin: currentUser.linkedin || '',
        portfolio: currentUser.portfolio || ''
      });
      setImagePreview(currentUser.profileImage || null);
    }
  };

  // Image Selection Handler (Client-side validation)
  const handleImageChange = (e) => {
    setApiError('');
    setApiSuccess('');
    const file = e.target.files[0];
    if (!file) return;

    // 1. Size Validation (2MB Max)
    if (file.size > 2 * 1024 * 1024) {
      setApiError('The selected photo exceeds the 2MB size limit.');
      return;
    }

    // 2. Type Validation (PNG/JPEG)
    const allowedExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedExtensions.includes(file.type)) {
      setApiError('Only JPEG, JPG, and PNG images are supported.');
      return;
    }

    // Preview
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file dialog
  const triggerFileSelect = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Save changes handler
  const onSubmit = async (data) => {
    setApiError('');
    setApiSuccess('');

    // Prepare Multipart form-data payload
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('university', data.university);
    formData.append('branch', data.branch);
    formData.append('year', data.year);
    formData.append('bio', data.bio);
    formData.append('github', data.github);
    formData.append('linkedin', data.linkedin);
    formData.append('portfolio', data.portfolio);

    if (imageFile) {
      formData.append('profileImage', imageFile);
    }

    const res = await updateUserProfile(formData);

    if (res.success) {
      setApiSuccess('Profile changes saved successfully.');
      setIsEditing(false);
      setImageFile(null);
      if (res.user.profileImage) {
        setImagePreview(res.user.profileImage);
      }
    } else {
      setApiError(res.error || 'Failed to save changes. Verify URL parameters and try again.');
    }
  };

  const user = currentUser || {};
  const completionPercentage = user.profileCompletionPercentage ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 theme-transition min-h-[85vh]">
      
      {/* Toast Alert Box */}
      {(apiError || apiSuccess) && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border transition-all duration-300 ${
          apiError 
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 text-rose-800 dark:text-rose-400' 
            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400'
        }`}>
          {apiError ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
          <div className="text-sm font-medium">{apiError || apiSuccess}</div>
        </div>
      )}

      {/* Main Profile Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar & Completion Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl text-center shadow-sm relative group theme-transition">
            <div className="relative w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden border-4 border-indigo-50 dark:border-indigo-950/60 shadow-sm flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40">
              {imagePreview ? (
                <img 
                  src={getProfileImageUrl(imagePreview, currentUser?.updatedAt)} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-indigo-400" />
              )}

              {/* Photo Upload Overlay */}
              {isEditing && (
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="absolute inset-0 bg-slate-900/60 hover:bg-slate-900/75 text-white flex flex-col items-center justify-center gap-1 transition-colors duration-300"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                </button>
              )}
            </div>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />

            <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white leading-snug">{user.name || 'Set Name'}</h2>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{user.role || 'Student'}</p>
            
            {/* Action buttons */}
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800/60 mt-6 flex justify-center gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="w-full py-3 px-5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 text-sm flex items-center justify-center gap-2 transition-colors duration-300 shadow-md shadow-indigo-100 dark:shadow-none"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-sm flex items-center justify-center gap-1.5 transition-colors duration-300"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 text-sm flex items-center justify-center gap-1.5 transition-colors duration-300"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Completion Score Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm space-y-4 theme-transition">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white uppercase tracking-wider">Profile Completion</h3>
              <span className="font-display font-extrabold text-2xl text-indigo-600 dark:text-indigo-400">{completionPercentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-transparent dark:border-slate-800/50">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <p className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed pt-1">
              Add college records, write a short bio, customize social hooks, and upload a profile photo to reach 100% completion.
            </p>
          </div>

        </div>

        {/* Right Side: Information Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Academic Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm space-y-6 theme-transition">
              <div className="border-l-4 border-indigo-600 dark:border-indigo-500 pl-4 mb-2">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Academic Details</h3>
                <p className="text-xs text-slate-450 dark:text-slate-550">Identify where you currently study and teach.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      {...register('name', { required: 'Name is required' })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300"
                    />
                  </div>
                  {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
                </div>

                {/* Email Address (Read-only) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      disabled
                      value={user.email || ''}
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-850/60 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                {/* College / University */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">College / University</label>
                  <div className="relative">
                    <School className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      placeholder={isEditing ? "e.g. Stanford University" : "Not configured yet"}
                      {...register('university')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300"
                    />
                  </div>
                </div>

                {/* Branch / Department */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Branch / Department</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      placeholder={isEditing ? "e.g. Computer Science" : "Not configured yet"}
                      {...register('branch')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300"
                    />
                  </div>
                </div>

                {/* Current Year */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Current Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <select 
                      disabled={!isEditing}
                      {...register('year')}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300 appearance-none"
                    >
                      <option value="">Choose your current year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>

                {/* Short Bio */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Short Bio (Max 250 characters)</label>
                  <textarea 
                    disabled={!isEditing}
                    rows="3"
                    maxLength="250"
                    placeholder={isEditing ? "Tell us about your strengths, background, or goals..." : "Not configured yet"}
                    {...register('bio')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300 resize-none"
                  />
                  {errors.bio && <span className="text-xs text-rose-500">{errors.bio.message}</span>}
                </div>
              </div>
            </div>

            {/* Social profiles Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm space-y-6 theme-transition">
              <div className="border-l-4 border-blue-600 dark:border-blue-500 pl-4 mb-2">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Social Links</h3>
                <p className="text-xs text-slate-450 dark:text-slate-550">Provide URLs to your professional profiles.</p>
              </div>

              <div className="space-y-4">
                {/* GitHub */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">GitHub Profile URL</label>
                  <div className="relative">
                    <Github className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      placeholder={isEditing ? "https://github.com/username" : "Not configured yet"}
                      {...register('github', {
                        pattern: {
                          value: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
                          message: 'Must be a valid GitHub URL'
                        }
                      })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300"
                    />
                  </div>
                  {errors.github && <span className="text-xs text-rose-500">{errors.github.message}</span>}
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">LinkedIn Profile URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      placeholder={isEditing ? "https://linkedin.com/in/username" : "Not configured yet"}
                      {...register('linkedin', {
                        pattern: {
                          value: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
                          message: 'Must be a valid LinkedIn URL'
                        }
                      })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300"
                    />
                  </div>
                  {errors.linkedin && <span className="text-xs text-rose-500">{errors.linkedin.message}</span>}
                </div>

                {/* Portfolio Website */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Portfolio Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      placeholder={isEditing ? "https://yourwebsite.com" : "Not configured yet"}
                      {...register('portfolio', {
                        pattern: {
                          value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+.*$/,
                          message: 'Must be a valid HTTP or HTTPS website URL'
                        }
                      })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 dark:text-white transition-colors duration-300"
                    />
                  </div>
                  {errors.portfolio && <span className="text-xs text-rose-500">{errors.portfolio.message}</span>}
                </div>
              </div>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
