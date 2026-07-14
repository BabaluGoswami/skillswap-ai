import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useApp } from '@context/AppContext.jsx';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, Loader2, Shield, User, ArrowLeft } from 'lucide-react';

/**
 * High-fidelity Login Page with Role Selection.
 * Connects directly to backend authentication API.
 */
const Login = () => {
  const { loginUser, loading } = useApp();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null); // 'student', 'admin', or null

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

  if (selectedRole === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-grid-pattern px-4 py-12 theme-transition">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-none shadow-slate-100 max-w-xl w-full space-y-8 theme-transition text-center">
          
          <div className="space-y-2">
            <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-2 transition-colors duration-300">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white transition-colors duration-300">
              Welcome to SkillSwap.AI
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
              Select your role to continue to the platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Student Card */}
            <button
              onClick={() => setSelectedRole('student')}
              className="group text-left p-6 bg-slate-50/50 hover:bg-indigo-50/30 dark:bg-slate-950/40 dark:hover:bg-slate-800/40 border border-slate-150 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-850 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Continue as Student</h3>
                  <p className="text-slate-550 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                    Learn new skills, match with peers, and join sessions.
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-650 dark:text-indigo-400 mt-6 group-hover:translate-x-1.5 transition-transform">
                Sign In or Register <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => setSelectedRole('admin')}
              className="group text-left p-6 bg-slate-50/50 hover:bg-blue-50/30 dark:bg-slate-950/40 dark:hover:bg-slate-800/40 border border-slate-150 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-850 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Continue as Admin</h3>
                  <p className="text-slate-550 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                    Access administrative console, manage users, and review reports.
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-650 dark:text-blue-400 mt-6 group-hover:translate-x-1.5 transition-transform">
                Admin Portal Only <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-grid-pattern px-4 py-12 theme-transition">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-none shadow-slate-100 max-w-md w-full space-y-6 theme-transition">
        
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedRole(null);
            setApiError('');
          }}
          className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Selection
        </button>

        {/* Brand/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-1 transition-colors duration-300">
            {selectedRole === 'admin' ? <Shield className="h-6 w-6 text-blue-550" /> : <GraduationCap className="h-6 w-6" />}
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white transition-colors duration-300">
            {selectedRole === 'admin' ? 'Admin Gateway' : 'Student Log In'}
          </h2>
          <p className="text-slate-550 dark:text-slate-400 text-sm transition-colors duration-300">
            {selectedRole === 'admin' ? 'Administrative authorization console' : 'Log in to coordinate your learning sessions'}
          </p>
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
            className={`w-full mt-4 py-3.5 px-4 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed ${
              selectedRole === 'admin' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'
            }`}
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

        {/* Register link (Only for students) */}
        {selectedRole === 'student' && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
            New to the platform?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create an Account
            </Link>
          </p>
        )}

      </div>
    </div>
  );
};

export default Login;
