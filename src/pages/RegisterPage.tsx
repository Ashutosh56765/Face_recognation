import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Building, IdCard, Camera, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { WebcamScanner } from '../components/WebcamScanner';
import { User, FaceDetectionFrame } from '../types';

interface RegisterPageProps {
  onRegisterSuccess: (user: User, token: string) => void;
  setActivePage: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, setActivePage }) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Info, Step 2: Face Capture

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [employeeId, setEmployeeId] = useState('');

  // Biometric Face Capture State
  const [capturedEmbedding, setCapturedEmbedding] = useState<number[] | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validate Step 1
  const handleProceedToFaceCapture = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setStep(2);
  };

  // Handle Face Capture Callback
  const handleCaptureFace = (embedding: number[], snapshot: string, frame: FaceDetectionFrame) => {
    setCapturedEmbedding(embedding);
    setCapturedSnapshot(snapshot);
    setErrorMessage(null);
  };

  // Submit Final Registration
  const handleSubmitRegistration = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!capturedEmbedding || !capturedSnapshot) {
      setErrorMessage('Please capture your facial biometrics before completing registration.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          faceEmbedding: capturedEmbedding,
          faceSnapshot: capturedSnapshot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMessage('Registration successful! Biometric profile stored. Redirecting...');
      setTimeout(() => {
        onRegisterSuccess(data.user, data.token);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-10">
        
        {/* Title & Progress Tracker */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Register Account & Biometrics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {step === 1
              ? 'Step 1: Enter personal details and access credentials'
              : 'Step 2: Enroll face encoding for biometric recognition'}
          </p>

          {/* Steps Indicator */}
          <div className="mt-6 flex items-center justify-center gap-3 max-w-xs mx-auto">
            <div
              className={`flex-1 h-2 rounded-full transition-all ${
                step >= 1 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full transition-all ${
                step === 2 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
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
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <form onSubmit={handleProceedToFaceCapture} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Research & AI">Research & AI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Employee ID (Optional)
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. EMP-1008"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Next: Face Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: FACE REGISTRATION WEBCAM STEP */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Center face in frame. The system will detect 68 landmarks and extract a 128-dimensional vector signature.
            </p>

            <WebcamScanner
              mode="register"
              livenessType="blink"
              onCaptureFace={handleCaptureFace}
            />

            {/* Vector Vector Encoding Feature Bar Preview */}
            {capturedEmbedding && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <span>Extracted 128-D Face Vector Descriptor</span>
                  <span className="text-emerald-500 font-mono">100% Normalized</span>
                </div>
                <div className="h-8 flex items-end gap-1 overflow-hidden p-1 bg-slate-900 rounded-lg">
                  {capturedEmbedding.slice(0, 48).map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-cyan-400 rounded-t-sm transition-all"
                      style={{ height: `${Math.max(10, Math.abs(val) * 100)}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Details
              </button>

              <button
                type="button"
                onClick={handleSubmitRegistration}
                disabled={isSubmitting || !capturedEmbedding}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Registering Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Registration
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => setActivePage('login')}
            className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            Login Here
          </button>
        </div>

      </div>
    </div>
  );
};
