import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';

export function ResetPassword() {
  const { user, updateUserPassword, setIsRecoveryMode } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Check for error description in hash or query params
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const searchParams = new URLSearchParams(search);

    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    if (errorDesc) {
      setErrorMessage(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
      return;
    }

    // 2. Handle Supabase PKCE recovery code from URL if present
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setErrorMessage('Invalid or expired reset link. Please request a new one from the sign-in page.');
        }
      });
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await updateUserPassword(password);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccess(true);
        setIsRecoveryMode(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while updating your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page text-ink font-sans px-4 py-12 select-none">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-sheet border border-border shadow-lg flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-1">
          <p className="m-0 text-3xl font-extrabold tracking-tight text-ink">
            sanford<span className="text-brand">Ai</span>
          </p>
          <h1 className="text-base font-extrabold text-ink m-0">Reset Password</h1>
          <p className="text-xs text-muted m-0">
            {user?.email ? (
              <>Set a new password for <strong className="text-ink">{user.email}</strong></>
            ) : (
              'Enter a new secure password for your account'
            )}
          </p>
        </div>

        {success ? (
          <div className="rounded-card bg-ok-bg border border-ok-fg/20 p-6 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white text-ok-fg flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-extrabold text-ink m-0">Password Updated!</h2>
              <p className="text-xs text-muted m-0">
                Your password has been successfully reset. You can now access the studio.
              </p>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/studio')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Go to Studio
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && (
              <div className="rounded-field bg-brand-tint border border-brand/20 p-3 text-xs text-brand flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <Field
              label="New Password"
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
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              prefixIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="mt-1"
            >
              Update Password
            </Button>

            <div className="text-center pt-1">
              <Link to="/signin" className="text-xs text-muted hover:text-ink font-semibold underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
