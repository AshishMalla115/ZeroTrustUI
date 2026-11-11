import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';
import { DecisionBadge } from '../components/common/DecisionBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import { useAuthStore } from '../stores/authStore';
import { useScenario5 } from '../hooks/useScenarios';
import { useWebSocket } from '../hooks/useWebSocket';
import { Shield, Users, Database, FileText, Settings, LogOut, Eye, AlertTriangle, CheckCircle, Lock, Unlock, RefreshCw, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import type { Session, User, AuditLogEntry, ThresholdConfig } from '../types/api';

const tabs = [
  { id: 'sessions', label: 'Sessions', icon: Database },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: FileText },
  { id: 'override', label: 'Override', icon: Settings },
];

export const Scenario5Admin = () => {
  const { adminToken, isAdmin, clearAdminToken } = useAuthStore();
  const { isConnected } = useWebSocket();
  const {
    sessions: fetchSessions,
    users: fetchUsers,
    auditLog: fetchAuditLog,
    overrideSession,
    deactivateUser,
    forceMfa,
    resetMfa,
    getThreshold,
    updateThreshold,
  } = useScenario5();

  const [activeTab, setActiveTab] = useState('sessions');
  const [email, setEmail] = useState('admin@zerotrust.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [sessionsData, setSessionsData] = useState<{ sessions: Session[]; total: number }>({ sessions: [], total: 0 });
  const [usersData, setUsersData] = useState<{ users: User[]; total: number }>({ users: [], total: 0 });
  const [auditData, setAuditData] = useState<{ logs: AuditLogEntry[]; total: number }>({ logs: [], total: 0 });
  const [thresholds, setThresholds] = useState<{ current: ThresholdConfig; pending: ThresholdConfig | null } | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [overrideResult, setOverrideResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');
      if (data.user.role !== 'admin') throw new Error('Admin access required');

      // Store in authStore
      const { login: storeLogin, setAdminToken: storeSetAdminToken } = useAuthStore.getState();
      storeLogin(data.access_token, data.user, true);
      storeSetAdminToken(data.access_token);

      // Load initial data
      await loadAllData();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sessions, users, audit, thresh] = await Promise.all([
        fetchSessions({ limit: 50 }),
        fetchUsers({ limit: 50 }),
        fetchAuditLog({ limit: 50 }),
        getThreshold(),
      ]);
      setSessionsData(sessions);
      setUsersData(users);
      setAuditData(audit);
      setThresholds(thresh);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverride = async (sessionId: string) => {
    try {
      await overrideSession(sessionId);
      setOverrideResult({ success: true, message: `Session ${sessionId} overridden successfully` });
      await loadAllData();
    } catch (error) {
      setOverrideResult({ success: false, message: error instanceof Error ? error.message : 'Override failed' });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await deactivateUser(userId);
      await loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to deactivate user');
    }
  };

  const handleForceMfa = async (userId: string) => {
    try {
      await forceMfa(userId);
      await loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to force MFA');
    }
  };

  const handleResetMfa = async (userId: string) => {
    if (!confirm('Reset MFA for this user?')) return;
    try {
      await resetMfa(userId);
      await loadAllData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reset MFA');
    }
  };

  const handleThresholdUpdate = async (newThresholds: ThresholdConfig) => {
    try {
      await updateThreshold(newThresholds);
      const thresh = await getThreshold();
      setThresholds(thresh);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update thresholds');
    }
  };

  if (!isAdmin || !adminToken) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Login Required</h1>
          <p className="text-gray-600 mt-2">Access the admin dashboard with admin credentials</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>Enter admin credentials to access privileged operations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoggingIn}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    disabled={isLoggingIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {loginError}
                </div>
              )}
              <Button type="submit" loading={isLoggingIn} className="w-full" size="lg">
                <Shield className="w-5 h-5" />
                Admin Login
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Test Admin: admin@zerotrust.com / admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scenario 5: Admin Flow</h1>
          <p className="text-gray-600 mt-1">Privileged visibility & override capabilities</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? 'success' : 'danger'} dot size="sm">
            {isConnected ? 'WebSocket Live' : 'WebSocket Offline'}
          </Badge>
          <Button variant="ghost" onClick={() => { clearAdminToken(); window.location.href = '/'; }}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {overrideResult && (
        <div className={clsx('p-4 rounded-lg flex items-center justify-between', overrideResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800')}>
          <div className="flex items-center gap-2">
            {overrideResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{overrideResult.message}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOverrideResult(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Admin tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'sessions' && (
        <AdminSessionsTab
          sessions={sessionsData.sessions}
          total={sessionsData.total}
          isLoading={isLoading}
          onOverride={handleOverride}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsersTab
          users={usersData.users}
          total={usersData.total}
          isLoading={isLoading}
          onDeactivate={handleDeactivateUser}
          onForceMfa={handleForceMfa}
          onResetMfa={handleResetMfa}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === 'audit' && (
        <AdminAuditTab
          logs={auditData.logs}
          total={auditData.total}
          isLoading={isLoading}
          onRefresh={loadAllData}
        />
      )}

      {activeTab === 'override' && (
        <AdminOverrideTab
          sessions={sessionsData.sessions}
          selectedSessionId={selectedSessionId}
          setSelectedSessionId={setSelectedSessionId}
          thresholds={thresholds}
          onThresholdUpdate={handleThresholdUpdate}
          onOverride={handleOverride}
        />
      )}
    </div>
  );
};

const AdminSessionsTab = ({ sessions, total, isLoading, onOverride, onRefresh }: {
  sessions: Session[];
  total: number;
  isLoading: boolean;
  onOverride: (id: string) => void;
  onRefresh: () => void;
}) => {
  const [filterDecision, setFilterDecision] = useState('');
  const [filterMinScore, setFilterMinScore] = useState('');

  const filtered = sessions.filter(s => {
    if (filterDecision && s.decision !== filterDecision) return false;
    if (filterMinScore && s.risk_score < parseFloat(filterMinScore)) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Active Sessions ({total})</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Decisions</option>
              <option value="allow">Allow</option>
              <option value="restrict">Restrict</option>
              <option value="mfa">MFA Required</option>
              <option value="block">Blocked</option>
              <option value="logged_out">Logged Out</option>
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="Min Risk Score"
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            />
            <Button variant="secondary" onClick={onRefresh} loading={isLoading}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No sessions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Session ID</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Risk Score</th>
                  <th className="pb-3 font-medium">Decision</th>
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((session) => (
                  <tr key={session.session_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">{session.session_id.slice(0, 16)}...</td>
                    <td className="py-3">{session.user_email}</td>
                    <td className="py-3">
                      <RiskGauge score={session.risk_score} size={60} showValue strokeWidth={5} />
                    </td>
                    <td className="py-3">
                      <DecisionBadge decision={session.decision} size="sm" />
                    </td>
                    <td className="py-3 font-mono text-xs text-gray-500">{session.device_hash.slice(0, 12)}...</td>
                    <td className="py-3 text-gray-500">{new Date(session.created_at).toLocaleString()}</td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" onClick={() => onOverride(session.session_id)}>
                        Override
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminUsersTab = ({ users, total, isLoading, onDeactivate, onForceMfa, onResetMfa, onRefresh }: {
  users: User[];
  total: number;
  isLoading: boolean;
  onDeactivate: (id: string) => void;
  onForceMfa: (id: string) => void;
  onResetMfa: (id: string) => void;
  onRefresh: () => void;
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Users ({total})</CardTitle>
          <Button variant="secondary" onClick={onRefresh} loading={isLoading}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">MFA</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">{user.email}</td>
                    <td className="py-3">
                      <Badge variant={user.role === 'admin' ? 'info' : 'gray'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={user.is_active ? 'success' : 'danger'} dot>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={user.mfa_enabled ? 'success' : 'warning'} dot>
                        {user.mfa_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {!user.is_active && (
                          <Button variant="ghost" size="sm" onClick={() => onDeactivate(user.id)} className="text-green-600 hover:bg-green-50">
                            Activate
                          </Button>
                        )}
                        {user.is_active && (
                          <Button variant="ghost" size="sm" onClick={() => onDeactivate(user.id)} className="text-red-600 hover:bg-red-50">
                            Deactivate
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => onForceMfa(user.id)} className="text-blue-600 hover:bg-blue-50">
                          <Lock className="w-4 h-4" />
                        </Button>
                        {user.mfa_enabled && (
                          <Button variant="ghost" size="sm" onClick={() => onResetMfa(user.id)} className="text-orange-600 hover:bg-orange-50">
                            <Unlock className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminAuditTab = ({ logs, total, isLoading, onRefresh }: {
  logs: AuditLogEntry[];
  total: number;
  isLoading: boolean;
  onRefresh: () => void;
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audit Log ({total})</CardTitle>
          <Button variant="secondary" onClick={onRefresh} loading={isLoading}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No audit logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Admin</th>
                  <th className="pb-3 font-medium">Target</th>
                  <th className="pb-3 font-medium">Details</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <Badge variant="info" size="sm">{log.action}</Badge>
                    </td>
                    <td className="py-3 text-gray-600">{log.admin_email}</td>
                    <td className="py-3 font-mono text-xs">{log.target_type}:{log.target_id}</td>
                    <td className="py-3 max-w-xs truncate">
                      <CodeBlock json={log.details} language="json" maxHeight="80px" collapsible={false} />
                    </td>
                    <td className="py-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminOverrideTab = ({ sessions, selectedSessionId, setSelectedSessionId, thresholds, onThresholdUpdate, onOverride }: {
  sessions: Session[];
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  thresholds: { current: ThresholdConfig; pending: ThresholdConfig | null } | null;
  onThresholdUpdate: (t: ThresholdConfig) => void;
  onOverride: (id: string) => void;
}) => {
  const [mfaThreshold, setMfaThreshold] = useState(thresholds?.current.mfa_threshold || 0.4);
  const [blockThreshold, setBlockThreshold] = useState(thresholds?.current.block_threshold || 0.75);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Override</CardTitle>
          <CardDescription>Force allow a session by setting risk score to 0.1 (creates audit trail)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Session</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a session...</option>
              {sessions.filter(s => !s.is_revoked).map((session) => (
                <option key={session.session_id} value={session.session_id}>
                  {session.session_id.slice(0, 16)}... - {session.user_email} (Score: {session.risk_score.toFixed(2)}, {session.decision})
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => selectedSessionId && onOverride(selectedSessionId)}
            disabled={!selectedSessionId}
            className="w-full"
            size="lg"
            variant="danger"
          >
            <AlertTriangle className="w-5 h-5" />
            Override Selected Session
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Thresholds Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MFA Threshold: {mfaThreshold.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={mfaThreshold}
                onChange={(e) => setMfaThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-sm text-gray-500 mt-1">Score ≥ {mfaThreshold.toFixed(2)} → MFA required</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Block Threshold: {blockThreshold.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={blockThreshold}
                onChange={(e) => setBlockThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <p className="text-sm text-gray-500 mt-1">Score ≥ {blockThreshold.toFixed(2)} → Blocked</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onThresholdUpdate({ mfa_threshold: mfaThreshold, block_threshold: blockThreshold })}>
              Update Thresholds
            </Button>
            {thresholds?.pending && (
              <Badge variant="warning" className="text-sm">
                Pending: MFA ≥ {thresholds.pending.mfa_threshold}, Block ≥ {thresholds.pending.block_threshold}
              </Badge>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Current Thresholds</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">MFA Threshold: </span>
                <span className="font-mono font-medium">{thresholds?.current.mfa_threshold.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Block Threshold: </span>
                <span className="font-mono font-medium">{thresholds?.current.block_threshold.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};