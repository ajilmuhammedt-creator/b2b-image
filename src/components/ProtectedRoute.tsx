import { useState, useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { Clock, ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, isRecoveryMode, refreshProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  // Notify admin when a pending staff user attempts to access the portal
  useEffect(() => {
    if (profile?.status === 'pending' && profile.email) {
      const storageKey = `notified_admin_pending_${profile.email}`;
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true');
        fetch('/api/notify-admin-staff-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffEmail: profile.email,
            staffName: profile.full_name || undefined,
            eventType: 'pending_login_attempt',
          }),
        }).catch((err) => console.warn('Could not notify admin of pending login:', err));
      }
    }
  }, [profile?.status, profile?.email, profile?.full_name]);

  // If user is currently in password recovery, send them to /reset-password
  if (isRecoveryMode) {
    return <Navigate to="/reset-password" replace />;
  }

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090B10] text-slate-800 dark:text-slate-200">
        <div className="flex items-center space-x-3 bg-white dark:bg-white/[0.03] px-5 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
          <span className="text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300">
            Verifying account permissions...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // 1. Pending Approval Gating
  if (profile?.status === 'pending') {
    const handleCheckStatus = async () => {
      setChecking(true);
      try {
        await refreshProfile();
      } finally {
        setTimeout(() => setChecking(false), 600);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090B10] px-4 py-12 relative overflow-hidden text-slate-100">
        {/* Amber glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white dark:bg-[#0E1118]/90 p-8 rounded-[14px] border border-amber-300 dark:border-amber-500/20 shadow-xl dark:shadow-2xl backdrop-blur-xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center">
            <BrandLogo heightClass="h-9" />
          </div>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-2.5 py-1 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-semibold uppercase tracking-wider rounded-full">
              Pending Approval
            </span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Staff Account Awaiting Review
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Hello <span className="font-semibold text-slate-900 dark:text-white">{profile.full_name || user.email}</span>, your staff account request has been submitted to the administrator.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              You will receive a notification email at <span className="text-amber-700 dark:text-amber-300/90 font-mono text-[11px]">{profile.email}</span> as soon as your access is approved.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full py-2.5 px-4 bg-[var(--brand)] hover:bg-[var(--brand-hover)] dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-sm dark:shadow-md transition flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking status...' : 'Check Approval Status'}</span>
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/[0.08] transition flex items-center justify-center space-x-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] text-[11px] text-slate-400">
            Sanford B2B Product Image Studio &bull; Access Gate
          </div>
        </div>
      </div>
    );
  }

  // 2. Rejected Gating
  if (profile?.status === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090B10] px-4 py-12 relative overflow-hidden text-slate-100">
        <div className="w-full max-w-md bg-[#0E1118]/90 p-8 rounded-2xl border border-rose-500/20 shadow-2xl backdrop-blur-xl relative z-10 text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-2.5 py-1 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-[10px] font-semibold uppercase tracking-wider rounded-full">
              Access Declined
            </span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Account Request Declined
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your staff account request was not approved by the administrator. Please contact your manager or administrator if you believe this is an error.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/[0.08] transition flex items-center justify-center space-x-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Admin Route Gating
  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/studio" replace />;
  }

  return <>{children}</>;
}
