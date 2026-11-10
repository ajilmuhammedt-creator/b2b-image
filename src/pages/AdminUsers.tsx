import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { UserProfile, UserStatus, CreditStats } from '../types';
import {
  Shield,
  Search,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
  MoreVertical,
} from 'lucide-react';

export function AdminUsers() {
  const { session, profile: currentAdmin } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [creditStats, setCreditStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Success / error banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    loginUrl?: string;
  } | null>(null);

  const parseResponseSafe = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: text || `Server error (${res.status})` };
    }
  };

  const fetchUsers = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await parseResponseSafe(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
      setCreditStats(data.creditStats || null);
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

      const data = await parseResponseSafe(res);
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve user');
      }

      setNotification({
        type: 'success',
        message: `Account for ${userEmail} has been approved. Notification email dispatched.`,
        loginUrl: data.loginUrl,
      });

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

      const data = await parseResponseSafe(res);
      if (!res.ok) {
        throw new Error(data.error || 'Failed to decline user request');
      }

      setNotification({
        type: 'success',
        message: `Access request for ${userEmail} was declined.`,
      });

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

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const firstPending = pendingUsers[0] || null;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
  };

  // Role permissions matrix specification from Team.reference.html
  const roles = ['Admin', 'Reviewer', 'Designer', 'Marketplace exec', 'Content writer', 'Viewer'];
  const permissionsGrid = [
    { name: 'Generate images in assigned studios', matrix: [true, true, true, true, true, false] },
    { name: 'Approve or send back work', matrix: [true, true, false, false, false, false] },
    { name: 'Deliver to Shopify, Amazon, Noon', matrix: [true, true, false, true, false, false] },
    { name: 'Schedule and publish social posts', matrix: [true, true, false, false, true, false] },
    { name: 'Verify product specs', matrix: [true, true, false, false, false, false] },
    { name: 'Edit templates and brand kit', matrix: [true, false, false, false, false, false] },
    { name: 'Manage connections and AI keys', matrix: [true, false, false, false, false, false] },
    { name: 'See AI costs', matrix: [true, false, false, false, false, false] },
    { name: 'Manage team and roles', matrix: [true, false, false, false, false, false] },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background text-ink">
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col gap-6">
        {/* Page Title & Invite People Primary Button */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-ink m-0">
              Settings
            </h1>
            <p className="text-sm text-muted m-0">
              Only admins see this area. Manage roles, access requests, and team permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleRefresh}
              loading={refreshing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setInviteModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Invite people
            </Button>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <nav
          aria-label="Settings"
          className="flex flex-wrap items-center gap-6 border-b border-border pb-px text-sm"
        >
          <span className="h-10 flex items-center font-extrabold text-ink border-b-2 border-ink cursor-default">
            Team and roles
          </span>
          <Link
            to="/settings/connections"
            className="h-10 flex items-center font-medium text-muted hover:text-ink transition-colors"
          >
            Connections and agent
          </Link>
          <span className="h-10 flex items-center font-medium text-muted/60 cursor-not-allowed">
            AI usage
          </span>
          <span className="h-10 flex items-center font-medium text-muted/60 cursor-not-allowed">
            Audit log
          </span>
        </nav>

        {/* Access Request Alert Banner (Matching Team.reference.html) */}
        {firstPending && (
          <div className="p-4 rounded-card bg-[#FFF4D6] border border-[#F3DF95] flex flex-wrap items-center justify-between gap-3 text-sm text-[#5C3D00]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-extrabold text-[#7A4F00]">
                {pendingUsers.length} access request{pendingUsers.length > 1 ? 's' : ''}:
              </span>
              <span className="truncate">
                <strong>{firstPending.full_name || firstPending.email}</strong> requested to join as {firstPending.role || 'Staff'}.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleReject(firstPending.id, firstPending.email)}
                disabled={actionInProgress === firstPending.id}
              >
                Decline
              </Button>
              <button
                type="button"
                onClick={() => handleApprove(firstPending.id, firstPending.email)}
                disabled={actionInProgress === firstPending.id}
                className="h-8 px-3.5 rounded-[8px] bg-ink hover:bg-ink-hover text-white text-xs font-bold transition cursor-pointer"
              >
                Approve access
              </button>
            </div>
          </div>
        )}

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-card border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
              notification.type === 'success'
                ? 'bg-ok-bg border-ok-border text-ok-fg'
                : 'bg-fail-bg border-fail-border text-fail-fg'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>

            {notification.loginUrl && (
              <button
                type="button"
                onClick={() => copyLoginLink(notification.loginUrl!)}
                className="px-3 py-1.5 bg-ok-fg hover:opacity-90 text-white rounded-field text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied link!' : 'Copy direct link'}</span>
              </button>
            )}
          </div>
        )}

        {/* Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Credits Used Today
              </span>
              <div className="text-2xl font-extrabold text-ink mt-1 font-mono">
                {creditStats?.creditsToday ?? 0}
              </div>
              <span className="text-[11px] text-muted">
                {creditStats?.creditsYesterday ?? 0} yesterday · {creditStats?.creditsTotal ?? 0} all-time
              </span>
            </div>
            <div className="w-9 h-9 rounded-field bg-track text-ink flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Pending Requests
              </span>
              <div className="text-2xl font-extrabold text-ink mt-1 font-mono">
                {pendingUsers.length}
              </div>
              <span className="text-[11px] text-muted">Awaiting administrator approval</span>
            </div>
            <div className="w-9 h-9 rounded-field bg-track text-ink flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Total Team Members
              </span>
              <div className="text-2xl font-extrabold text-ink mt-1 font-mono">
                {users.length}
              </div>
              <span className="text-[11px] text-muted">Active across all studios</span>
            </div>
            <div className="w-9 h-9 rounded-field bg-track text-ink flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Section 1: Members Data Table */}
        <section
          aria-labelledby="members-heading"
          className="bg-surface border border-border rounded-card overflow-hidden shadow-2xs"
        >
          <div className="p-4 sm:px-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <h2 id="members-heading" className="text-base font-extrabold text-ink m-0">
              Members
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs bg-track border border-transparent focus:border-border rounded-field text-ink placeholder-muted focus:outline-none"
                />
              </div>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-8 px-2.5 text-xs bg-track border border-transparent focus:border-border rounded-field text-ink focus:outline-none font-medium cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="approved">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Declined</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div role="table" aria-label="Members" className="min-w-[760px] text-sm">
              <div
                role="row"
                className="grid grid-cols-[2.2fr_1.4fr_1.4fr_1fr_60px] items-center bg-track/60 text-xs font-bold text-muted border-b border-border"
              >
                <span role="columnheader" className="py-2.5 px-4 sm:px-6">
                  Person
                </span>
                <span role="columnheader" className="py-2.5 px-3">
                  Role
                </span>
                <span role="columnheader" className="py-2.5 px-3">
                  Studios
                </span>
                <span role="columnheader" className="py-2.5 px-3">
                  Status
                </span>
                <span role="columnheader" className="py-2.5 px-3 text-right"></span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-muted">Loading team members...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted">No members match your search criteria.</div>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentAdmin?.id;
                  const initials = getInitials(user.full_name, user.email);
                  const studios =
                    user.role === 'admin'
                      ? 'All'
                      : (user.role as string) === 'designer'
                      ? 'Social, Retail flyers'
                      : 'E-commerce, Retail flyers';

                  return (
                    <div
                      key={user.id}
                      role="row"
                      className="grid grid-cols-[2.2fr_1.4fr_1.4fr_1fr_60px] items-center border-b border-border hover:bg-track/30 transition-colors"
                    >
                      {/* Person */}
                      <span role="cell" className="py-3 px-4 sm:px-6 flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-track font-bold text-xs flex items-center justify-center shrink-0 text-ink">
                          {initials}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-ink truncate flex items-center gap-1.5">
                            <span>{user.full_name || user.email.split('@')[0]}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-muted font-normal">(you)</span>
                            )}
                          </span>
                          <span className="text-xs text-muted truncate">{user.email}</span>
                        </div>
                      </span>

                      {/* Role Selector */}
                      <span role="cell" className="py-3 px-3">
                        <select
                          aria-label={`Role for ${user.email}`}
                          defaultValue={user.role || 'staff'}
                          disabled={isCurrent}
                          className="h-8 w-full max-w-[160px] px-2 text-xs bg-surface border border-border rounded-field text-ink focus:outline-none font-medium cursor-pointer disabled:opacity-60"
                        >
                          <option value="admin">Admin</option>
                          <option value="reviewer">Reviewer</option>
                          <option value="designer">Designer</option>
                          <option value="marketplace">Marketplace executive</option>
                          <option value="writer">Content writer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </span>

                      {/* Studios */}
                      <span role="cell" className="py-3 px-3 text-xs text-muted truncate">
                        {studios}
                      </span>

                      {/* Status */}
                      <span role="cell" className="py-3 px-3">
                        {user.status === 'approved' ? (
                          <Badge variant="ok">Active</Badge>
                        ) : user.status === 'pending' ? (
                          <Badge variant="warn">Pending</Badge>
                        ) : (
                          <Badge variant="fail">Declined</Badge>
                        )}
                      </span>

                      {/* Actions */}
                      <span role="cell" className="py-3 px-3 text-right">
                        {user.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleApprove(user.id, user.email)}
                              title="Approve access"
                              className="w-7 h-7 rounded-field bg-ok-bg text-ok-fg hover:opacity-80 flex items-center justify-center cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Actions for ${user.email}`}
                            className="w-7 h-7 rounded-field text-muted hover:text-ink hover:bg-track flex items-center justify-center ml-auto cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Role Permissions Matrix */}
        <section
          aria-labelledby="perms-heading"
          className="bg-surface border border-border rounded-card overflow-hidden shadow-2xs"
        >
          <div className="p-4 sm:px-5 border-b border-border flex flex-col gap-1">
            <h2 id="perms-heading" className="text-base font-extrabold text-ink m-0">
              What each role can do
            </h2>
            <span className="text-xs text-muted">
              Enforced in the database, not just hidden in the app. Nobody can approve their own work.
            </span>
          </div>

          <div className="overflow-x-auto">
            <div role="table" aria-label="Permissions by role" className="min-w-[760px] text-xs">
              <div
                role="row"
                className="grid grid-cols-[2.4fr_repeat(6,1fr)] items-center bg-track/60 font-bold text-muted border-b border-border"
              >
                <span role="columnheader" className="py-2.5 px-4 sm:px-6">
                  Permission
                </span>
                {roles.map((r) => (
                  <span key={r} role="columnheader" className="py-2.5 px-2 text-center truncate">
                    {r}
                  </span>
                ))}
              </div>

              {permissionsGrid.map((p) => (
                <div
                  key={p.name}
                  role="row"
                  className="grid grid-cols-[2.4fr_repeat(6,1fr)] items-center border-b border-border hover:bg-track/30 transition-colors"
                >
                  <span role="rowheader" className="py-3 px-4 sm:px-6 font-semibold text-ink">
                    {p.name}
                  </span>
                  {p.matrix.map((allowed, idx) => (
                    <span key={idx} role="cell" className="py-3 px-2 flex justify-center">
                      {allowed ? (
                        <span
                          role="img"
                          aria-label="Allowed"
                          className="w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center shrink-0"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span
                          role="img"
                          aria-label="Not allowed"
                          className="w-3 h-0.5 bg-border-strong rounded-full inline-block"
                        />
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Invite Member Simple Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-modal p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-extrabold text-ink m-0">Invite team member</h3>
            <p className="text-xs text-muted m-0">
              New team members register at the sign-in page. Their request will appear in your Pending Requests list for immediate approval.
            </p>
            <div className="p-3 bg-track rounded-field flex items-center justify-between text-xs font-mono text-ink">
              <span>{window.location.origin}/auth</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/auth`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-xs font-bold text-ink hover:underline cursor-pointer"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setInviteModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
