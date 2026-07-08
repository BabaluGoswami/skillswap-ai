import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useApp } from '@context/AppContext.jsx';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

/**
 * High-fidelity Login Page.
 * Uses react-hook-form and connects directly to backend authentication API.
 */
const Login = () => {
  const { loginUser, loading } = useApp();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    const result = await loginUser(data.email, data.password);
    if (result.success) {
      if (result.user?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-grid-pattern px-4 py-12 theme-transition">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-none shadow-slate-100 max-w-md w-full space-y-8 theme-transition">
        
        {/* Brand/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-2 transition-colors duration-300">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white transition-colors duration-300">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Log in to coordinate your learning sessions</p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm rounded-xl transition-colors duration-300">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@university.edu"
                className={`w-full bg-slate-50/50 dark:bg-slate-950/40 border focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-colors duration-300 dark:text-white theme-transition ${
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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors duration-300">Forgot password?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`w-full bg-slate-50/50 dark:bg-slate-950/40 border focus:bg-white dark:focus:bg-slate-900 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-colors duration-300 dark:text-white theme-transition ${
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
          New to the platform?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
