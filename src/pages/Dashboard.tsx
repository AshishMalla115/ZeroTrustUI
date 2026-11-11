import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { ScenarioCard } from '../components/scenarios/ScenarioCard';
import { Shield, AlertCircle, Clock, Wifi, Terminal } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useHealthCheck } from '../hooks/useAuth';

const scenarios = [
  {
    id: 1,
    title: 'Normal Login',
    description: 'Legitimate user authentication with risk scoring',
    shortDescription: 'Login with test credentials, view risk score, decision, and JWT token',
    path: '/scenario/1',
    icon: 'ShieldCheck',
    status: 'pending' as const,
  },
  {
    id: 2,
    title: 'Failed Auth (Brute Force)',
    description: '3 consecutive wrong password attempts with lockout tracking',
    shortDescription: 'Run automated failed attempts, see Redis counter, 429 lockout threshold',
    path: '/scenario/2',
    icon: 'ShieldAlert',
    status: 'pending' as const,
  },
  {
    id: 3,
    title: 'Middleware Scoring',
    description: 'Continuous verification - every request scored by middleware',
    shortDescription: 'Call 3 endpoints, see live risk scores, RBAC + risk on /admin/sessions',
    path: '/scenario/3',
    icon: 'Database',
    status: 'pending' as const,
  },
  {
    id: 4,
    title: 'Token Blacklist',
    description: 'Session revocation - JWT blacklisted immediately on logout',
    shortDescription: 'Logout then reuse token, see 401 rejection, Redis blacklist concept',
    path: '/scenario/4',
    icon: 'ShieldOff',
    status: 'pending' as const,
  },
  {
    id: 5,
    title: 'Admin Flow',
    description: 'Privileged visibility - sessions, users, audit log, override',
    shortDescription: 'Admin login, 4-tab dashboard, session override with audit trail',
    path: '/scenario/5',
    icon: 'UserCheck',
    status: 'pending' as const,
  },
  {
    id: 6,
    title: 'Input Validation',
    description: 'Schema-level rejection - Pydantic validates before auth/risk',
    shortDescription: '3 test cases: short password, invalid email, empty password → all 422',
    path: '/scenario/6',
    icon: 'Terminal',
    status: 'pending' as const,
  },
];

export const Dashboard = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { isConnected } = useWebSocket();
  const { data: health, isLoading: healthLoading } = useHealthCheck();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Zero Trust Engine - Attack Demo Scenarios</h1>
        <p className="text-gray-600 mt-1">Interactive visualization of 6 Zero Trust attack scenarios</p>
      </div>

      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">Backend Status</p>
                <p className="font-semibold">
                  {healthLoading ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                      Checking...
                    </span>
                  ) : health?.status === 'healthy' ? (
                    <span className="flex items-center gap-1 text-green-100">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Healthy
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-100">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      Unavailable
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">WebSocket (Admin)</p>
                <p className="font-semibold">
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-green-100">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-100">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                      Disconnected
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">User Session</p>
                <p className="font-semibold">
                  {isAuthenticated ? (
                    <span className="flex items-center gap-1 text-green-100">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Authenticated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-100">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                      Not Logged In
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">Admin Access</p>
                <p className="font-semibold">
                  {isAdmin ? (
                    <span className="flex items-center gap-1 text-green-100">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-200">
                      <span className="w-2 h-2 bg-gray-400 rounded-full" />
                      Inactive
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between flex-wrap gap-4 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Start with Scenario 1</p>
                <p className="text-sm text-yellow-700">Login to get a token for Scenarios 3 & 4</p>
              </div>
            </div>
            <Link to="/scenario/1">
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                Go to Scenario 1
              </button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Attack Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} onClick={() => {}} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Prerequisites</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Backend running at <code className="font-mono bg-gray-100 px-1 rounded">http://127.0.0.1:8000</code></li>
                <li>CORS configured for <code className="font-mono bg-gray-100 px-1 rounded">http://localhost:5173</code></li>
                <li>Test users seeded: <code className="font-mono bg-gray-100 px-1 rounded">test@zerotrust.com</code> / <code className="font-mono bg-gray-100 px-1 rounded">password123</code></li>
                <li>Admin user: <code className="font-mono bg-gray-100 px-1 rounded">admin@zerotrust.com</code> / <code className="font-mono bg-gray-100 px-1 rounded">admin123</code></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommended Flow</h4>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li><strong>Scenario 1:</strong> Login → get JWT token → save for later scenarios</li>
                <li><strong>Scenario 2:</strong> Run 3 failed attempts → see brute force tracking</li>
                <li><strong>Scenario 3:</strong> Use token from Scenario 1 → call 3 endpoints → watch risk scores</li>
                <li><strong>Scenario 4:</strong> Use token → logout → try reuse → see 401 rejection</li>
                <li><strong>Scenario 5:</strong> Admin login → explore 4 tabs → override a session</li>
                <li><strong>Scenario 6:</strong> Run validation tests → all return 422</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Key Concepts Demonstrated</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Continuous Verification</p>
                  <p className="text-gray-600">Every request scored</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Dynamic Risk</p>
                  <p className="text-gray-600">Scores change per request</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Adaptive Decisions</p>
                  <p className="text-gray-600">allow → mfa → block</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Immediate Revocation</p>
                  <p className="text-gray-600">JWT blacklist in Redis</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Admin Visibility</p>
                  <p className="text-gray-600">Sessions, users, audit</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Schema Validation</p>
                  <p className="text-gray-600">Pydantic at edge</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Zero Trust Principles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Never Trust, Always Verify</h4>
              <p className="text-sm text-gray-600">Every request is authenticated, authorized, and risk-scored regardless of network location.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Least Privilege Access</h4>
              <p className="text-sm text-gray-600">RBAC combined with dynamic risk scoring - even admins get scored on every request.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Assume Breach</h4>
              <p className="text-sm text-gray-600">Token blacklisting, continuous monitoring, and audit trails assume compromise will happen.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Micro-segmentation</h4>
              <p className="text-sm text-gray-600">Different endpoints have different risk thresholds and access requirements.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Continuous Monitoring</h4>
              <p className="text-sm text-gray-600">WebSocket real-time risk updates, alerting on anomalies, behavioral profiling.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Backend API Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Endpoints</th>
                  <th className="pb-3 font-medium">Auth Required</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium">Auth</td>
                  <td className="py-3"><code className="font-mono bg-gray-100 px-1 rounded">POST /auth/login</code>, <code className="font-mono bg-gray-100 px-1 rounded">POST /auth/logout</code>, <code className="font-mono bg-gray-100 px-1 rounded">GET /auth/me</code>, MFA setup/verify</td>
                  <td className="py-3">No (login), Yes (others)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium">Protected</td>
                  <td className="py-3"><code className="font-mono bg-gray-100 px-1 rounded">GET /protected</code>, <code className="font-mono bg-gray-100 px-1 rounded">GET /health</code></td>
                  <td className="py-3">Yes (except /health)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium">Admin</td>
                  <td className="py-3">Sessions, Users, Audit Log, Override, Thresholds, Alerts, Devices, Models, Stats</td>
                  <td className="py-3">Yes + Admin Role</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">WebSocket</td>
                  <td className="py-3"><code className="font-mono bg-gray-100 px-1 rounded">ws://127.0.0.1:8000/ws/admin?token=</code></td>
                  <td className="py-3">Admin JWT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};