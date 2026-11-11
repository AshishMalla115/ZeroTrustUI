import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';
import { useScenario2 } from '../hooks/useScenarios';
import { AlertTriangle, Shield } from 'lucide-react';

export const Scenario2FailedAuth = () => {
  const { mutate: runAttempts, isPending, data: attempts } = useScenario2();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scenario 2: Failed Authentication (Brute Force)</h1>
        <p className="text-gray-600 mt-1">3 consecutive wrong password attempts with lockout threshold visualization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brute Force Simulation</CardTitle>
          <CardDescription>Run 3 failed login attempts to see how the system tracks and responds to brute force attacks</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => runAttempts()}
            loading={isPending}
            size="lg"
            className="w-full sm:w-auto"
            variant="danger"
          >
            <AlertTriangle className="w-5 h-5" />
            Run 3 Failed Attempts
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Each attempt uses wrong password. Lockout threshold: 5 attempts = 429 Too Many Requests
          </p>
        </CardContent>
      </Card>

      {attempts && attempts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="success" dot size="md">
              All 3 attempts returned 401 Unauthorized
            </Badge>
            <Badge variant="info" dot size="md">
              Redis counter incremented (conceptual)
            </Badge>
            <Badge variant="warning" dot size="md">
              2 more attempts until lockout (5 total)
            </Badge>
          </div>

          <div className="space-y-3">
            {attempts.map((attempt, index) => (
              <Card key={index} variant="outlined">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                        {attempt.attempt}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Attempt {attempt.attempt}</h4>
                        <p className="text-sm text-gray-500">POST /auth/login with wrong password</p>
                      </div>
                    </div>
                    <Badge variant="danger" size="md">
                      Status: {attempt.response.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 overflow-x-auto">
                    <div className="flex-1 min-w-[300px]">
                      <p className="text-xs text-gray-500 mb-1">Request</p>
                      <CodeBlock
                        json={{
                          method: 'POST',
                          url: '/auth/login',
                          headers: { 'Content-Type': 'application/json' },
                          body: attempt.request,
                        }}
                        language="http"
                        maxHeight="150px"
                        collapsible
                        defaultCollapsed
                      />
                    </div>
                    <div className="flex-1 min-w-[300px]">
                      <p className="text-xs text-gray-500 mb-1">Response</p>
                      <CodeBlock
                        json={attempt.response.body}
                        language="json"
                        maxHeight="150px"
                        collapsible
                        defaultCollapsed
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card variant="outlined" className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Redis Failed-Attempt Counter (Conceptual)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-red-600">3</div>
                <div className="text-sm text-gray-500">Failed Attempts</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-orange-600">2</div>
                <div className="text-sm text-gray-500">Remaining Until Lockout</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-600">5</div>
                <div className="text-sm text-gray-500">Lockout Threshold</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-red-600">429</div>
                <div className="text-sm text-gray-500">HTTP Status on Lockout</div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900 mb-2">Redis Key Structure (Conceptual)</p>
              <CodeBlock
                json={{
                  'failed_attempts:test@zerotrust.com': {
                    count: 3,
                    ttl: '300s',
                    last_attempt: '2024-01-15T10:30:45Z',
                  }
                }}
                language="json"
                collapsible={false}
                maxHeight="150px"
              />
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">How It Works</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Each failed login increments a Redis counter with TTL</li>
                <li>Counter key: <code className="font-mono bg-gray-100 px-1 rounded">failed_attempts:test@zerotrust.com</code></li>
                <li>At 5 attempts: returns 429 Too Many Requests</li>
                <li>Counter resets after TTL expires or successful login</li>
                <li>This prevents credential stuffing and brute force attacks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};