import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CodeBlock } from '../components/common/CodeBlock';
import { useScenario6 } from '../hooks/useScenarios';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import type { ValidationTestCase } from '../types/scenarios';

const initialTestCases: ValidationTestCase[] = [
  {
    id: 1,
    name: 'Short Password',
    description: 'Password less than minimum length (8 chars)',
    payload: { email: 'x@y.com', password: 'short' },
    expectedStatus: 422,
    isRunning: false,
  },
  {
    id: 2,
    name: 'Invalid Email Format',
    description: 'Email does not match RFC 5322 format',
    payload: { email: 'notanemail', password: 'password123' },
    expectedStatus: 422,
    isRunning: false,
  },
  {
    id: 3,
    name: 'Empty Password',
    description: 'Password field is empty string',
    payload: { email: 'x@y.com', password: '' },
    expectedStatus: 422,
    isRunning: false,
  },
];

export const Scenario6Validation = () => {
  const [testCases, setTestCases] = useState<ValidationTestCase[]>(initialTestCases);
  const { mutateAsync: runTests, isPending } = useScenario6();

  const handleRunAll = async () => {
    setTestCases(prev => prev.map(tc => ({ ...tc, isRunning: true, result: undefined })));
    const results = await runTests(testCases);
    setTestCases(results);
  };

  const handleRunSingle = async (index: number) => {
    setTestCases(prev => prev.map((tc, i) => i === index ? { ...tc, isRunning: true, result: undefined } : tc));
    const results = await runTests([testCases[index]]);
    setTestCases(prev => prev.map((tc, i) => i === index ? results[0] : tc));
  };

  const allPassed = testCases.every(tc => tc.result?.status === 422);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scenario 6: Input Validation (Schema-Level Rejection)</h1>
        <p className="text-gray-600 mt-1">Pydantic validation rejects malformed requests before auth/risk logic runs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Validation Test Cases</CardTitle>
          <CardDescription>Each case tests a specific validation rule. All should return 422 Unprocessable Entity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRunAll}
            loading={isPending}
            size="lg"
            variant="primary"
            className="w-full sm:w-auto mb-4"
          >
            <Shield className="w-5 h-5" />
            Run All Validation Tests
          </Button>

          {allPassed && testCases.some(tc => tc.result) && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">All 3 validation cases correctly returned 422 Unprocessable Entity</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {testCases.map((tc, index) => (
          <Card key={tc.id} variant="outlined" className={clsx(tc.result?.status === 422 && 'border-green-300 bg-green-50')}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                      {tc.id}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">{tc.name}</h4>
                      <p className="text-sm text-gray-500">{tc.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tc.result && (
                    <Badge
                      variant={tc.result.status === 422 ? 'success' : tc.result.status === 200 ? 'warning' : 'danger'}
                      size="md"
                    >
                      Status: {tc.result.status}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRunSingle(index)}
                    loading={tc.isRunning}
                    disabled={isPending}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Request Payload</p>
                  <CodeBlock
                    json={tc.payload}
                    language="json"
                    collapsible={false}
                    maxHeight="150px"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Response</p>
                  {tc.result ? (
                    <CodeBlock
                      json={tc.result.body}
                      language="json"
                      collapsible={false}
                      maxHeight="150px"
                    />
                  ) : (
                    <div className="h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      Click "Test" to run
                    </div>
                  )}
                </div>
              </div>

              {tc.result && tc.result.status === 422 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Validation Error Details
                  </h5>
                  <CodeBlock
                    json={tc.result.body}
                    language="json"
                    collapsible={false}
                    maxHeight="200px"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Why Schema-Level Validation Matters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Defense in Depth</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Validation runs <strong>before</strong> authentication logic</li>
                <li>Rejects malformed requests at the edge</li>
                <li>Prevents injection attacks (SQL, NoSQL, command)</li>
                <li>Reduces attack surface for downstream services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Pydantic Validation</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Automatic from type annotations</li>
                <li>EmailStr validates RFC 5322 format</li>
                <li>constr(min_length=8) enforces password policy</li>
                <li>Returns detailed error locations (field, type, message)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Example Pydantic Model (Backend)</h4>
            <CodeBlock
              json={{
                'class LoginRequest(BaseModel)': {
                  'email: EmailStr': 'Validates email format',
                  'password: constr(min_length=8)': 'Enforces minimum 8 characters',
                },
                'class LoginResponse(BaseModel)': {
                  'access_token: str': null,
                  'risk_score: float': '0.0 - 1.0',
                  'decision: Literal["allow", "mfa", "block"]': null,
                },
              }}
              language="json"
              collapsible={false}
              maxHeight="200px"
            />
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Typical 422 Response Structure</h4>
            <CodeBlock
              json={{
                'detail': [
                  {
                    'loc': ['body', 'password'],
                    'msg': 'ensure this value has at least 8 characters',
                    'type': 'value_error.any_str.min_length',
                    'ctx': { 'limit_value': 8 },
                  },
                ],
              }}
              language="json"
              collapsible={false}
              maxHeight="150px"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};