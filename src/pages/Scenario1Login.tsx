import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskGauge } from '../components/common/RiskGauge';
import { DecisionBadge } from '../components/common/DecisionBadge';
import { CodeBlock } from '../components/common/CodeBlock';
import { RequestResponsePanel } from '../components/scenarios/RequestResponsePanel';
import { useScenario1 } from '../hooks/useScenarios';
import { Eye, EyeOff, Copy, CheckCircle, ArrowRight, Shield } from 'lucide-react';

export const Scenario1Login = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending, data: requestResponse } = useScenario1();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('test@zerotrust.com');
  const [password, setPassword] = useState('password123');
  const [savedToken, setSavedToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const handleSaveToken = () => {
    if (requestResponse?.response?.body) {
      const body = requestResponse.response.body as { access_token: string };
      setSavedToken(body.access_token);
      navigator.clipboard.writeText(body.access_token);
    }
  };

  const decodeJwt = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return { header, payload };
    } catch {
      return null;
    }
  };

  const decoded = savedToken ? decodeJwt(savedToken) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scenario 1: Normal Login</h1>
        <p className="text-gray-600 mt-1">Legitimate user authentication with risk scoring</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Login Form</CardTitle>
          <CardDescription>Pre-filled with test credentials. Execute to see risk scoring in action.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" loading={isPending} size="lg">
              <Shield className="w-5 h-5" />
              Execute Login
            </Button>
          </form>
        </CardContent>
      </Card>

      {requestResponse && (
        <>
          <RequestResponsePanel requestResponse={requestResponse} />

          {requestResponse.response?.status === 200 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Score</CardTitle>
                  <CardDescription>Calculated by the Zero Trust engine</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 py-4">
<RiskGauge
                      score={(requestResponse.response?.body as { risk_score?: number })?.risk_score || 0}
                      size={160}
                      showLabel
                      showValue
                    />
                    <DecisionBadge
                      decision={(requestResponse.response?.body as { decision?: string })?.decision as 'allow' | 'restrict' | 'mfa' | 'block' | 'logged_out' || 'allow'}
                      size="lg"
                    />
                    <div className="text-center text-sm text-gray-500">
                      MFA Required:{' '}
                      <span className="font-medium">
                        {(requestResponse.response?.body as { mfa_required?: boolean })?.mfa_required ? 'Yes' : 'No'}
                      </span>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Created</CardTitle>
                  <CardDescription>JWT token with risk context</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Token Preview</span>
                    <Button variant="ghost" size="sm" onClick={handleSaveToken}>
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                  <CodeBlock
                    json={requestResponse.response.body}
                    language="json"
                    maxHeight="200px"
                  />
                </CardContent>
              </Card>

              {decoded && (
                <Card>
                  <CardHeader>
                    <CardTitle>Decoded JWT</CardTitle>
                    <CardDescription>Header and payload (signature omitted)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Header</p>
                      <CodeBlock json={decoded.header} language="json" maxHeight="120px" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payload</p>
                      <CodeBlock json={decoded.payload} language="json" maxHeight="120px" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {requestResponse.response && requestResponse.response.status !== 200 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Login Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  json={requestResponse.response.body}
                  language="json"
                  maxHeight="200px"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {savedToken && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Token Saved for Scenarios 3 & 4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-3">The JWT token has been copied to clipboard and stored. Navigate to Scenario 3 or 4 to use it.</p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/scenario/3')} variant="primary">
                <ArrowRight className="w-4 h-4" />
                Go to Scenario 3
              </Button>
              <Button onClick={() => navigate('/scenario/4')} variant="secondary">
                <ArrowRight className="w-4 h-4" />
                Go to Scenario 4
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};