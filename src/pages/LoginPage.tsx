import React, { useState } from 'react';
import { Mail, Lock, Camera, Key, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { WebcamScanner } from '../components/WebcamScanner';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  setActivePage: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, setActivePage }) => {
  const [loginMethod, setLoginMethod] = useState<'normal' | 'face'>('normal');

  // Normal login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Handle Normal Login Submission
  const handleNormalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      setSuccessMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Face Login Submission
  const handleFaceAuthenticate = async (embedding: number[], livenessPassed: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/face-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faceEmbedding: embedding, livenessPassed }),
      });

      const data = await res.json();

      if (!res.ok || !data.matched || !data.user) {
        throw new Error(data.message || 'Face recognition match failed. Please try again or register.');
      }

      setSuccessMessage(`Face Matched! (${data.confidence}% Confidence) Welcome back, ${data.user.name}`);
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Face authentication failed');
      throw err;
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-10">
        
        {/* Page Title & Method Tabs */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Access System Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose your preferred authentication method to continue
          </p>

          {/* Toggle Buttons */}
          <div className="mt-6 inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setLoginMethod('normal');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                loginMethod === 'normal'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key className="w-4 h-4" />
              Normal Login
            </button>

            <button
              onClick={() => {
                setLoginMethod('face');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                loginMethod === 'face'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              Face Login
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* METHOD 1: NORMAL LOGIN FORM */}
        {loginMethod === 'normal' && (
          <form onSubmit={handleNormalLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Demo Hint */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Demo user: <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">john@example.com</code></span>
              <span>Pass: <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">Password123!</code></span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Login to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* METHOD 2: FACE LOGIN WEBCAM VIEWPORT */}
        {loginMethod === 'face' && (
          <div className="space-y-4">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-2">
              Start camera, center face in frame, and verify liveness to log in via facial vector matching.
            </p>

            <WebcamScanner
              mode="login"
              livenessType="blink"
              onAuthenticateFace={handleFaceAuthenticate}
            />
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account registered yet?{' '}
          <button
            onClick={() => setActivePage('register')}
            className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            Register Here
          </button>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Reset Your Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your registered email address to receive password reset instructions.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                ✓ Reset instructions sent! Please check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Enter email..."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
