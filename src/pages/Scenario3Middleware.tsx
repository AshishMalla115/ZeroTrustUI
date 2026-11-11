import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { RiskGauge } from '../components/common/RiskGauge';
import { DecisionBadge } from '../components/common/DecisionBadge';
import { RequestResponsePanel } from '../components/scenarios/RequestResponsePanel';
import { RiskTimeline } from '../components/scenarios/RiskTimeline';
import { useAuthStore } from '../stores/authStore';
import { useScenario3 } from '../hooks/useScenarios';
import { useWebSocket } from '../hooks/useWebSocket';
import { Shield, Database, HeartPulse, ArrowRight, Copy, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import type { RiskTimelineEvent } from '../types/scenarios';
import type { Decision } from '../types/api';

const endpoints = [
  { path: '/protected', label: 'Protected Resource', icon: Shield, description: 'Basic authenticated endpoint', expectedDecision: 'allow' },
  { path: '/admin/sessions', label: 'Admin Sessions', icon: Database, description: 'Admin-only endpoint (RBAC + risk)', expectedDecision: 'block' },
  { path: '/health', label: 'Health Check', icon: HeartPulse, description: 'Public endpoint (no auth required)', expectedDecision: 'allow' },
];

export const Scenario3Middleware = () => {
  const { token } = useAuthStore();
  const { callEndpoint } = useScenario3();
  const { isConnected, riskUpdates } = useWebSocket();
  const [manualToken, setManualToken] = useState('');
  const [results, setResults] = useState<Record<string, { request: unknown; response: unknown }>>({});
  const [timelineEvents, setTimelineEvents] = useState<RiskTimelineEvent[]>([]);

  const currentToken = manualToken || token || '';

  const handleCallEndpoint = async (path: string) => {
    if (!currentToken && path !== '/health') return;

    const result = await callEndpoint(path);
    setResults(prev => ({ ...prev, [path]: { request: result.request, response: result.response } }));

    if (result.response && result.response.status === 200) {
      const body = result.response.body as { risk_score?: number; decision?: string };
      if (body.risk_score !== undefined && body.decision) {
        const newEvent: RiskTimelineEvent = {
          timestamp: new Date().toISOString(),
          endpoint: path,
          score: body.risk_score,
          decision: body.decision as RiskTimelineEvent['decision'],
          riskLevel: body.risk_score >= 0.75 ? 'critical' : body.risk_score >= 0.5 ? 'high' : body.risk_score >= 0.25 ? 'medium' : 'low',
        };
        setTimelineEvents(prev => [...prev.slice(-9), newEvent]);
      }
    }
  };

  const handleUseScenario1Token = () => {
    if (token) {
      setManualToken(token);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scenario 3: Middleware Scoring (Continuous Verification)</h1>
          <p className="text-gray-600 mt-1">Every authenticated request is scored by the Zero Trust middleware</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'success' : 'danger'} dot size="sm">
            {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          </Badge>
          {isConnected && <Wifi className="w-5 h-5 text-green-600" />}
          {!isConnected && <WifiOff className="w-5 h-5 text-red-600" />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Token</CardTitle>
          <CardDescription>Use token from Scenario 1 login (required for /protected and /admin/sessions)</CardDescription>
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
            <Button variant="ghost" onClick={() => { setManualToken(''); }}>
              Clear
            </Button>
          </div>
          {!currentToken && (
            <Badge variant="warning" className="text-sm">
              No token provided. /health works without auth, but /protected and /admin/sessions require a valid token.
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {endpoints.map((endpoint) => {
          const result = results[endpoint.path];
          const Icon = endpoint.icon;
          const isHealth = endpoint.path === '/health';

          return (
            <Card key={endpoint.path} variant="outlined">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{endpoint.label}</h4>
                    <p className="text-sm text-gray-500">{endpoint.path}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{endpoint.description}</p>
                <Button
                  onClick={() => handleCallEndpoint(endpoint.path)}
                  disabled={!currentToken && !isHealth}
                  className="w-full"
                  variant={isHealth ? 'secondary' : 'primary'}
                >
                  Call {endpoint.path}
                </Button>

                {result && (
                  <RequestResponsePanel
                    requestResponse={{
                      request: result.request as { method: string; url: string; headers: Record<string, string>; body: unknown },
                      response: result.response as { status: number; headers: Record<string, string>; body: unknown; duration: number },
                      isLoading: false,
                      error: null,
                    }}
                    title={endpoint.path}
                  />
                )}

                {(() => {
                  const resp = result?.response as { status: number; body?: { risk_score?: number; decision?: string } } | undefined;
                  if (!resp) return null;
                  if (resp.status === 200) {
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Risk Score:</span>
                          <RiskGauge
                            score={resp.body?.risk_score || 0}
                            size={80}
                            showLabel
                            showValue
                            strokeWidth={6}
                          />
                        </div>
                        <DecisionBadge
                          decision={(resp.body?.decision as Decision) || 'allow'}
                          size="md"
                        />
                      </div>
                    );
                  }
                  if (resp.status === 403) {
                    return (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        <strong>403 Forbidden</strong> - RBAC denial (non-admin) + risk scoring
                      </div>
                    );
                  }
                  if (resp.status === 401) {
                    return (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        <strong>401 Unauthorized</strong> - Invalid or missing token
                      </div>
                    );
                  }
                  return null;
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Score Timeline (Live)</CardTitle>
          <CardDescription>Real-time risk scores from WebSocket (admin) and API responses</CardDescription>
        </CardHeader>
        <CardContent>
          <RiskTimeline events={timelineEvents} height={300} />
        </CardContent>
      </Card>

      {riskUpdates.length > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle>Live WebSocket Risk Updates (Admin)</CardTitle>
            <CardDescription>Real-time risk scoring events from the middleware (requires admin WebSocket connection)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {riskUpdates.slice(-10).reverse().map((update, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-600">{new Date(update.timestamp).toLocaleTimeString()}</span>
                      <Badge variant="info" size="sm">{update.path}</Badge>
                      <RiskGauge score={update.score} size={50} showValue strokeWidth={4} />
                      <DecisionBadge decision={update.decision} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500">User: {update.user_id.slice(0, 8)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Key Zero Trust Principle: Continuous Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li><strong>Every request is scored</strong> - Not just login, but every API call</li>
            <li><strong>Risk is dynamic</strong> - Same user can have different scores based on context (device, location, behavior)</li>
            <li><strong>Decisions adapt</strong> - allow → mfa → restrict → block based on real-time risk</li>
            <li><strong>Middleware enforces</strong> - Transparent to application code, centralized policy</li>
            <li><strong>Health endpoint excluded</strong> - Public endpoints skip auth/risk (configurable)</li>
            <li><strong>RBAC + Risk</strong> - /admin/sessions shows both: 403 for non-admin, plus risk scoring</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};