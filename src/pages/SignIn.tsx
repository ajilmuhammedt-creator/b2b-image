import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserPlus,
  LogIn,
} from 'lucide-react';

export function SignIn() {
  const { user, profile, loading, signInWithPassword, signUpWithPassword, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup' | 'forgot'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Statuses
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Signup request submitted flag
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Forgot password status
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (profile?.status === 'approved') {
        navigate('/studio', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signInWithPassword(trimmedEmail, password);
      if (error) {
        setErrorMessage(
          error.message || 'Invalid login credentials. Please verify your email and password.'
        );
      } else {
        navigate('/studio', { replace: true });
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Please enter your work email.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signUpWithPassword(trimmedEmail, password, trimmedName);
      if (error) {
        setErrorMessage(error.message || 'Failed to submit account request. Please try again.');
      } else {
        setRequestSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your work email to receive password reset instructions.');
      return;
    }

    setResetSubmitting(true);
    try {
      const { error } = await resetPasswordForEmail(trimmedEmail);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setResetEmailSent(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setResetSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090B10] text-slate-800 dark:text-slate-200">
        <div className="flex items-center space-x-3 bg-white dark:bg-white/[0.03] px-5 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090B10] px-4 py-12 relative overflow-hidden transition-colors">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-indigo-500/10 dark:bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#0E1118]/85 p-8 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl dark:shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center mb-1">
            <img
              src="/sanford-ai-logo.png"
              alt="Sanford AI"
              className="h-10 w-auto object-contain dark:mix-blend-screen"
            />
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 font-sans">
            Image Studio
          </p>
        </div>

        {/* Forgot password mode */}
        {forgotPasswordMode ? (
          resetEmailSent ? (
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Reset Link Sent</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  We sent password reset instructions to:
                </p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 break-all">{email.trim()}</p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                Click the link in the email to set a new password.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setResetEmailSent(false);
                }}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/[0.08] transition"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {errorMessage && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-md shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
              >
                {resetSubmitting ? (
                  <>
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
                >
                  Cancel and Return to Sign In
                </button>
              </div>
            </form>
          )
        ) : requestSubmitted ? (
          /* Account Request Submitted Card */
          <div className="rounded-xl bg-slate-50 dark:bg-[#121622] border border-emerald-500/30 p-6 text-center space-y-4">
            <div className="w-13 h-13 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold uppercase tracking-wider rounded-full">
                Request Registered
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Request Submitted</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Thank you, <span className="font-semibold text-slate-900 dark:text-white">{fullName || email}</span>! Your account request has been forwarded to the administrator for review.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-lg text-left space-y-1.5">
              <div className="flex items-center space-x-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-300">
                <Clock className="w-3.5 h-3.5" />
                <span>What happens next:</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>An administrator will review your staff access request.</li>
                <li>You will receive an approval email at <span className="font-mono text-slate-800 dark:text-slate-200">{email}</span>.</li>
                <li>Once approved, you can sign in to access the studio.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setRequestSubmitted(false);
                setActiveTab('signin');
                setPassword('');
                setConfirmPassword('');
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-md shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Sign In vs Request Account Tabbed Form */
          <div>
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/[0.06] mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  activeTab === 'signin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  activeTab === 'signup'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Request Staff Account</span>
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 p-3 mb-4 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'signin' ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="signin-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="signin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="signin-password" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setForgotPasswordMode(true);
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg shadow-md shadow-indigo-600/30 transition duration-150 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Request Staff Account Form */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label htmlFor="signup-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-confirm-password" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start space-x-2">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    New accounts require administrator approval. An email notification will be sent upon approval.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg shadow-md shadow-indigo-600/30 transition duration-150 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Submitting request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Account Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Sanford Authentication Gate</span>
          <span>Sanford AI Studio</span>
        </div>
      </div>
    </div>
  );
}
