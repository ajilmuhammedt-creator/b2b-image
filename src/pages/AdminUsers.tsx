import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import type { UserProfile, UserStatus } from '../types';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Search,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

export function AdminUsers() {
  const { session, profile: currentAdmin } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  // Processing state for individual user buttons
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Success / error banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    loginUrl?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch users');
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('fetchUsers error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load user accounts',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const handleApprove = async (userId: string, userEmail: string) => {
    if (!session?.access_token) return;
    setActionInProgress(userId);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve user');
      }

      setNotification({
        type: 'success',
        message: `Account for ${userEmail} has been approved. Notification email dispatched.`,
        loginUrl: data.loginUrl,
      });

      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, status: 'approved', approved_at: new Date().toISOString() }
            : u
        )
      );
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to approve user',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (userId: string, userEmail: string) => {
    if (!session?.access_token) return;
    setActionInProgress(userId);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to decline user request');
      }

      setNotification({
        type: 'success',
        message: `Access request for ${userEmail} was declined.`,
      });

      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'rejected' } : u))
      );
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to reject user',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const copyLoginLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Metrics
  const pendingUsers = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status === 'approved' && u.role === 'staff');
  const adminUsers = users.filter((u) => u.role === 'admin');

  // Filtered list
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Staff Access & Account Approvals
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review new account requests, approve staff access, and control permissions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 rounded-lg border border-white/[0.08] transition flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="flex items-start sm:items-center space-x-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <div className="text-xs font-medium">{notification.message}</div>
            </div>

            {notification.loginUrl && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => copyLoginLink(notification.loginUrl!)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 rounded-lg text-xs font-medium transition flex items-center space-x-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Direct Access Link'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0E1118]/80 border border-amber-500/20 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300/80 font-medium">Pending Requests</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {pendingUsers.length}
            </div>
            <p className="text-[11px] text-slate-400">Awaiting your approval</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1118]/80 border border-emerald-500/20 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300/80 font-medium">Active Staff</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {approvedUsers.length}
            </div>
            <p className="text-[11px] text-slate-400">Full studio access enabled</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1118]/80 border border-indigo-500/20 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-300/80 font-medium">Administrators</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">
              {adminUsers.length}
            </div>
            <p className="text-[11px] text-slate-400">Full system control</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1118]/80 border border-white/[0.08] backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Registered</span>
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">{users.length}</div>
            <p className="text-[11px] text-slate-400">All registered accounts</p>
          </div>
        </div>

        {/* Priority Section: Pending Requests */}
        {pendingUsers.length > 0 && (
          <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pending Approvals ({pendingUsers.length})
                </h2>
              </div>
              <span className="text-[11px] text-amber-300/80 font-medium">
                Action required to grant studio access
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingUsers.map((user) => {
                const isCurrentProcessing = actionInProgress === user.id;
                const requestedDate = user.requested_at
                  ? new Date(user.requested_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recently';

                return (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl bg-[#0E1118]/90 border border-amber-500/30 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {user.full_name || 'Staff Member'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-300 truncate">{user.email}</p>
                      <p className="text-[11px] text-slate-500">Requested: {requestedDate}</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => handleApprove(user.id, user.email)}
                        disabled={isCurrentProcessing}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-1.5"
                      >
                        {isCurrentProcessing ? (
                          <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Notify</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(user.id, user.email)}
                        disabled={isCurrentProcessing}
                        className="py-2 px-3 bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs font-medium rounded-lg border border-white/[0.08] transition flex items-center space-x-1"
                        title="Decline request"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Directory Controls & Table */}
        <div className="p-6 rounded-2xl bg-[#0E1118]/80 border border-white/[0.08] backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Staff Directory</h2>
              <p className="text-xs text-slate-400">
                All registered users with role and status indicators.
              </p>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-60"
                />
              </div>

              <div className="flex items-center space-x-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06] text-xs">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition capitalize ${
                      statusFilter === tab
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 flex items-center justify-center space-x-3 text-slate-400">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
              <span className="text-xs">Loading staff accounts...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No accounts match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">User / Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Requested At</th>
                    <th className="pb-3">Approved At</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredUsers.map((user) => {
                    const isProcessing = actionInProgress === user.id;
                    const isSelf = user.id === currentAdmin?.id;

                    return (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {(user.full_name || user.email)[0].toUpperCase()}
                            </div>
                            <div className="truncate max-w-[240px]">
                              <div className="font-medium text-white truncate">
                                {user.full_name || 'Staff Member'}
                                {isSelf && (
                                  <span className="ml-2 text-[10px] text-indigo-400 font-mono">
                                    (You)
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider">
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium border border-white/[0.06]">
                              Staff
                            </span>
                          )}
                        </td>

                        <td className="py-3.5">
                          {user.status === 'approved' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Approved</span>
                            </span>
                          )}
                          {user.status === 'pending' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Pending Review</span>
                            </span>
                          )}
                          {user.status === 'rejected' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-medium">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>Declined</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-slate-400 text-[11px]">
                          {user.requested_at
                            ? new Date(user.requested_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>

                        <td className="py-3.5 text-slate-400 text-[11px]">
                          {user.approved_at
                            ? new Date(user.approved_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>

                        <td className="py-3.5 pr-2 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-500 italic">Primary Admin</span>
                          ) : (
                            <div className="flex items-center justify-end space-x-2">
                              {user.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(user.id, user.email)}
                                    disabled={isProcessing}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-medium rounded-md transition flex items-center space-x-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReject(user.id, user.email)}
                                    disabled={isProcessing}
                                    className="px-2.5 py-1 bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-[11px] font-medium rounded-md border border-white/[0.06] transition"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                              {user.status === 'approved' && user.role !== 'admin' && (
                                <button
                                  type="button"
                                  onClick={() => handleReject(user.id, user.email)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-[11px] font-medium rounded-md border border-white/[0.06] transition"
                                >
                                  Revoke Access
                                </button>
                              )}

                              {user.status === 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(user.id, user.email)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-medium rounded-md transition flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Re-approve</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
