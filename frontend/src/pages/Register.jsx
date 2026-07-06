import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useApp } from '@context/AppContext.jsx';
import { GraduationCap, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, BookOpen } from 'lucide-react';

/**
 * High-fidelity Register Page.
 * Connects to registration API, using react-hook-form for clean validations.
 */
const Register = () => {
  const { registerUser, loading } = useApp();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      skillsToTeachRaw: '',
      skillsToLearnRaw: '',
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    
    // Parse comma-separated skill inputs
    const skillsToTeach = data.skillsToTeachRaw
      ? data.skillsToTeachRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const skillsToLearn = data.skillsToLearnRaw
      ? data.skillsToLearnRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const result = await registerUser(
      data.name,
      data.email,
      data.password,
      skillsToTeach,
      skillsToLearn
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-grid-pattern px-4 py-12 theme-transition">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-none shadow-slate-100 max-w-md w-full space-y-8 theme-transition">
        
        {/* Brand/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-2 transition-colors duration-300">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white transition-colors duration-300">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Join the student network and start swapping skills</p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm rounded-xl transition-colors duration-300">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name"
                type="text"
                placeholder="Alex Johnson"
                className={`w-full bg-slate-50/50 dark:bg-slate-950/40 border focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors duration-300 dark:text-white theme-transition ${
                  errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400'
                }`}
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <span className="text-xs font-medium text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300" htmlFor="email">
              University Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="alex@university.edu"
                className={`w-full bg-slate-50/50 dark:bg-slate-950/40 border focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors duration-300 dark:text-white theme-transition ${
                  errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs font-medium text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`w-full bg-slate-50/50 dark:bg-slate-950/40 border focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors duration-300 dark:text-white theme-transition ${
                  errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
            </div>
            {errors.password && (
              <span className="text-xs font-medium text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300" htmlFor="skillsToTeachRaw">
              Skills you can teach (comma separated)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <BookOpen className="h-4 w-4" />
              </span>
              <input
                id="skillsToTeachRaw"
                type="text"
                placeholder="React, UI Design, Public Speaking"
                className="w-full bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors duration-300 dark:text-white theme-transition"
                {...register('skillsToTeachRaw')}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300" htmlFor="skillsToLearnRaw">
              Skills you want to learn (comma separated)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <BookOpen className="h-4 w-4" />
              </span>
              <input
                id="skillsToLearnRaw"
                type="text"
                placeholder="Python, Linear Algebra, French"
                className="w-full bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors duration-300 dark:text-white theme-transition"
                {...register('skillsToLearnRaw')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
