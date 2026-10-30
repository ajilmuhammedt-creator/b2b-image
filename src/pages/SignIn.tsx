import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export function SignIn() {
  const { user, loading, signInWithOtp, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/studio', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signInWithOtp(trimmedEmail);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSubmittedEmail(trimmedEmail);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = () => {
    continueAsGuest('supplier@b2b-image.studio');
    navigate('/studio');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin h-7 w-7 border-2 border-indigo-500 border-t-transparent rounded-full" />
          <span className="text-base font-medium">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 bg-slate-900/90 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center mb-1">
            <img
              src="/sanford-ai-logo.png"
              alt="Sanford AI"
              className="h-12 w-auto object-contain mix-blend-screen"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            B2B Product Image Studio
          </h1>
          <p className="text-sm text-slate-400">
            Generate grounded BuySanford e-commerce product images from catalogue documents
          </p>
        </div>

        {submittedEmail ? (
          <div className="rounded-xl bg-indigo-950/50 border border-indigo-800/60 p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Check your email</h2>
              <p className="text-sm text-slate-300">We sent a magic sign-in link to:</p>
              <p className="text-sm font-medium text-indigo-400 break-all">{submittedEmail}</p>
            </div>
            <p className="text-xs text-slate-400 pt-2 border-t border-indigo-900/50">
              Click the link in the email to sign in directly to the studio.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedEmail(null);
                  setEmail('');
                }}
                className="text-xs text-slate-400 hover:text-white underline transition"
              >
                Sign in with another email
              </button>
              <button
                type="button"
                onClick={handleGuestLogin}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                Or enter immediately via Studio Access &rarr;
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="rounded-lg bg-red-950/60 border border-red-800/60 p-3 text-sm text-red-300 flex items-start space-x-2">
                <ShieldCheck className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="supplier@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-indigo-600/30 transition duration-150 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Sending magic link...</span>
                </>
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Or Quick Access
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-medium rounded-lg border border-slate-700 transition flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Enter Studio Directly (Instant Access)</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Supabase Auth & Storage</span>
          <span>OpenAI Sunburst / Flare</span>
        </div>
      </div>
    </div>
  );
}
