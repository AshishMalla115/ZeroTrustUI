import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';
import { RequestResponsePanel } from '../components/scenarios/RequestResponsePanel';
import { useAuthStore } from '../stores/authStore';
import { useScenario4 } from '../hooks/useScenarios';
import { Shield, Lock, Unlock, Trash2, Copy, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const Scenario4Blacklist = () => {
  const { token } = useAuthStore();
  const { doLogout, reuseToken } = useScenario4();
  const [manualToken, setManualToken] = useState('');
  const [tokenState, setTokenState] = useState<'valid' | 'revoked' | 'unknown'>('unknown');
  const [logoutResponse, setLogoutResponse] = useState<{ request: unknown; response: unknown } | null>(null);
  const [reuseResponse, setReuseResponse] = useState<{ request: unknown; response: unknown } | null>(null);

  const currentToken = manualToken || token || '';

  const handleLogout = async () => {
    const result = await doLogout.mutateAsync();
    setLogoutResponse({ request: result.request, response: result.response });
    if (result.response?.status === 200) {
      setTokenState('revoked');
    }
  };

  const handleReuse = async () => {
    const result = await reuseToken.mutateAsync();
    setReuseResponse({ request: result.request, response: result.response });
  };

  const handleUseScenario1Token = () => {
    if (token) {
      setManualToken(token);
      setTokenState('valid');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scenario 4: Token Blacklist (Session Revocation)</h1>
        <p className="text-gray-600 mt-1">JWT tokens are normally valid until expiry, but blacklist enables immediate revocation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Input</CardTitle>
          <CardDescription>Use token from Scenario 1 or enter manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">JWT Token</label>
            <div className="relative">
              <input
                type="password"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder={token ? 'Using token from Scenario 1...' : 'Paste JWT token here'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 font-mono text-sm"
                disabled={!manualToken && !!token}
              />
              {token && !manualToken && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {token && !manualToken && (
              <Button variant="secondary" onClick={handleUseScenario1Token}>
                <ArrowRight className="w-4 h-4" />
                Use Token from Scenario 1
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(currentToken)} disabled={!currentToken}>
              <Copy className="w-4 h-4" />
              Copy Token
            </Button>
            <Button variant="ghost" onClick={() => { setManualToken(''); setTokenState('unknown'); }}>
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-600" />
              Step 1: Logout (Revoke Token)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Token State</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      tokenState === 'valid' ? 'success' :
                      tokenState === 'revoked' ? 'danger' : 'gray'
                    }
                    dot
                  >
                    {tokenState.charAt(0).toUpperCase() + tokenState.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              loading={doLogout.isPending}
              disabled={!currentToken || doLogout.isPending}
              className="w-full"
              size="lg"
              variant="danger"
            >
              <Lock className="w-5 h-5" />
              Logout & Blacklist Token
            </Button>

            {logoutResponse && (
              <RequestResponsePanel
                requestResponse={{
                  request: logoutResponse.request as { method: string; url: string; headers: Record<string, string>; body: unknown },
                  response: logoutResponse.response as { status: number; headers: Record<string, string>; body: unknown; duration: number },
                  isLoading: false,
                  error: null,
                }}
                title="Logout Response"
              />
            )}

            {tokenState === 'revoked' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Token successfully blacklisted in Redis. It can no longer be used.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Step 2: Try Reusing Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleReuse}
              loading={reuseToken.isPending}
              disabled={!currentToken || reuseToken.isPending || tokenState !== 'revoked'}
              className="w-full"
              size="lg"
            >
              <Shield className="w-5 h-5" />
              Try Accessing /protected
            </Button>

            {reuseResponse && (
              <RequestResponsePanel
                requestResponse={{
                  request: reuseResponse.request as { method: string; url: string; headers: Record<string, string>; body: unknown },
                  response: reuseResponse.response as { status: number; headers: Record<string, string>; body: unknown; duration: number },
                  isLoading: false,
                  error: null,
                }}
                title="Reuse Response"
              />
            )}

            {(() => {
              const resp = reuseResponse?.response as { status: number } | undefined;
              if (!resp || resp.status !== 401) return null;
              return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Token correctly rejected (401 Unauthorized) - Blacklist working!
                  </p>
                </div>
              );
            })()}

            {tokenState !== 'revoked' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> You must logout first (Step 1) to blacklist the token before testing reuse.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            How JWT Blacklisting Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Normal JWT Behavior</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>JWTs are stateless - no server-side session storage</li>
                <li>Valid until <code className="font-mono bg-gray-100 px-1 rounded">exp</code> claim expires</li>
                <li>Cannot be invalidated without additional infrastructure</li>
                <li>Security risk if token is stolen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Zero Trust Blacklist Approach</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Redis set: <code className="font-mono bg-gray-100 px-1 rounded">blacklist:{'{'}jti{'}'}</code> with TTL = token remaining time</li>
                <li>Middleware checks blacklist on every request</li>
                <li>Immediate revocation on logout, password change, admin action</li>
                <li>JTI (JWT ID) claim used as unique identifier</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Redis Blacklist Key Structure</h4>
            <CodeBlock
              json={{
                'blacklist:jti_abc123': {
                  user_id: 'user_123',
                  revoked_at: '2024-01-15T10:30:45Z',
                  reason: 'logout',
                  ttl: '1800s',
                }
              }}
              language="json"
              collapsible={false}
              maxHeight="150px"
            />
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Middleware Check Flow</h4>
            <CodeBlock
              json={{
                '1. Extract JWT from Authorization header': null,
                '2. Decode and validate signature': null,
                '3. Extract JTI (JWT ID) claim': null,
                '4. Check Redis: EXISTS blacklist:{jt\'i}': null,
                '5. If exists \u2192 401 Unauthorized (token revoked)': null,
                '6. If not exists \u2192 Continue to risk scoring': null,
              }}
              language="json"
              collapsible={false}
              maxHeight="200px"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};