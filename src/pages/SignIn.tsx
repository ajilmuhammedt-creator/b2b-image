import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Segmented } from '../components/ui/Segmented';

export function SignIn() {
  const { user, profile, loading, isRecoveryMode, signInWithPassword, signUpWithPassword, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
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
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (isRecoveryMode || hash.includes('type=recovery') || search.includes('type=recovery') || search.includes('code=')) {
      navigate('/reset-password' + search + hash, { replace: true });
      return;
    }

    if (!loading && user) {
      if (profile?.status === 'approved' || profile?.status === 'pending') {
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, isRecoveryMode, navigate]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signInWithPassword(trimmedEmail, password);
      if (error) {
        setErrorMessage(
          error.message || 'Invalid login credentials. Please check your email and password, or use "Forgot password?" to reset it.'
        );
      } else {
        // Trigger notification check for staff login / pending staff
        fetch('/api/notify-admin-staff-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffEmail: trimmedEmail,
            eventType: 'pending_login_attempt',
          }),
        }).catch((err) => console.warn('Admin notification error:', err));

        navigate('/', { replace: true });
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
        // Alert admin about new staff account request
        fetch('/api/notify-admin-staff-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffEmail: trimmedEmail,
            staffName: trimmedName,
            eventType: 'signup_request',
          }),
        }).catch((err) => console.warn('Admin notification error:', err));
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
      <div className="min-h-screen flex items-center justify-center bg-page text-ink font-sans">
        <div className="flex items-center gap-3 bg-surface px-6 py-4 rounded-card border border-border shadow-xs">
          <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" />
          <span className="text-sm font-semibold text-ink">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page text-ink font-sans px-4 py-12 select-none">
      {/* Brand card */}
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-sheet border border-border shadow-lg flex flex-col gap-6">
        {/* Brand header */}
        <div className="text-center flex flex-col items-center gap-1">
          <p className="m-0 text-3xl font-extrabold tracking-tight text-ink">
            sanford<span className="text-brand">Ai</span>
          </p>
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Studio Suite
          </span>
        </div>

        {/* Forgot password mode */}
        {forgotPasswordMode ? (
          resetEmailSent ? (
            <div className="rounded-card bg-ok-bg border border-ok-fg/20 p-6 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white text-ok-fg flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-extrabold text-ink m-0">Reset Link Sent</h2>
                <p className="text-xs text-muted m-0">
                  Password reset instructions have been sent to:
                </p>
                <p className="text-xs font-bold text-ink break-all m-0">{email.trim()}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  setForgotPasswordMode(false);
                  setResetEmailSent(false);
                }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-extrabold text-ink m-0">Reset Password</h2>
                <p className="text-xs text-muted m-0">
                  Enter your registered work email to receive password instructions.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-field bg-brand-tint border border-brand/20 p-3 text-xs text-brand flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              <Field
                label="Your Account Email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sanford.ae"
                prefixIcon={<Mail className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={resetSubmitting}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Send Reset Instructions
              </Button>

              <button
                type="button"
                onClick={() => setForgotPasswordMode(false)}
                className="text-xs text-muted hover:text-ink font-semibold underline text-center"
              >
                Cancel and Return to Sign In
              </button>
            </form>
          )
        ) : requestSubmitted ? (
          /* Account Request Submitted Card */
          <div className="rounded-card bg-ok-bg border border-ok-fg/20 p-6 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white text-ok-fg flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="inline-block px-2.5 py-0.5 bg-white text-ok-fg text-[11px] font-bold rounded-full self-center border border-ok-fg/20">
                Request Registered
              </span>
              <h2 className="text-base font-extrabold text-ink m-0">Account Request Submitted</h2>
              <p className="text-xs text-muted leading-relaxed m-0">
                Thank you, <strong className="text-ink">{fullName || email}</strong>! Your account request has been forwarded to the administrator.
              </p>
            </div>

            <div className="p-3 bg-white rounded-field border border-border text-left flex flex-col gap-1 w-full text-xs">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <Clock className="w-3.5 h-3.5 text-muted" />
                <span>Next steps:</span>
              </div>
              <ul className="text-muted text-[11px] space-y-1 list-disc pl-4 m-0">
                <li>An administrator will review your staff access request.</li>
                <li>You will receive an approval notification at {email}.</li>
                <li>Once approved, sign in with your password to access the studio.</li>
              </ul>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setRequestSubmitted(false);
                setActiveTab('signin');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          /* Sign In vs Request Account Tabbed Form */
          <div className="flex flex-col gap-4">
            {/* Segmented control: Sign In vs Request Staff Account */}
            <Segmented
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val as any);
                setErrorMessage(null);
              }}
              options={[
                { value: 'signin', label: 'Sign In', icon: <LogIn className="w-3.5 h-3.5" /> },
                { value: 'signup', label: 'Request Account', icon: <UserPlus className="w-3.5 h-3.5" /> },
              ]}
            />

            {errorMessage && (
              <div className="rounded-field bg-brand-tint border border-brand/20 p-3 text-xs text-brand flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {activeTab === 'signin' ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <Field
                  label="Work Email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sanford.ae"
                  prefixIcon={<Mail className="w-4 h-4" />}
                />

                <div className="flex flex-col">
                  <Field
                    label="Password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    prefixIcon={<Lock className="w-4 h-4" />}
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setForgotPasswordMode(true);
                        }}
                        className="text-[11px] font-bold text-muted hover:text-ink transition-colors"
                      >
                        Forgot password?
                      </button>
                    }
                    suffixIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted hover:text-ink cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>

                {/* Single Primary Action Button in Brand Red */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={submitting}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="mt-1"
                >
                  Sign In
                </Button>
              </form>
            ) : (
              /* Request Staff Account Form */
              <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
                <Field
                  label="Full Name"
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ajil Muhammed"
                  prefixIcon={<UserIcon className="w-4 h-4" />}
                />

                <Field
                  label="Work Email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sanford.ae"
                  prefixIcon={<Mail className="w-4 h-4" />}
                />

                <Field
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  prefixIcon={<Lock className="w-4 h-4" />}
                  suffixIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted hover:text-ink cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Field
                  label="Confirm Password"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  prefixIcon={<Lock className="w-4 h-4" />}
                  suffixIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted hover:text-ink cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {/* Single Primary Action Button in Brand Red */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={submitting}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="mt-1"
                >
                  Submit Account Request
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-track flex items-center justify-between text-[11px] text-muted font-medium">
          <span>Sanford Authentication Gate</span>
          <span>v2.0</span>
        </div>
      </div>
    </div>
  );
}
