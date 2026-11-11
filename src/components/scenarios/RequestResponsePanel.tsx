import { useState } from 'react';
import { CodeBlock } from '../common/CodeBlock';
import { Badge } from '../common/Badge';
import { clsx } from 'clsx';
import type { RequestResponse } from '../../types/scenarios';

interface RequestResponsePanelProps {
  requestResponse: RequestResponse;
  title?: string;
}

type TabValue = 'request' | 'response';

export const RequestResponsePanel = ({ requestResponse, title = 'Request / Response' }: RequestResponsePanelProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>('request');

  const { request, response, isLoading, error } = requestResponse;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Executing request...</p>
        </div>
      </div>
    );
  }

  const statusColor = response
    ? response.status >= 200 && response.status < 300
      ? 'success'
      : response.status >= 400 && response.status < 500
      ? 'danger'
      : 'warning'
    : 'gray';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="flex items-center gap-3">
          {response && (
            <Badge variant={statusColor} size="sm">
              Status: {response.status}
            </Badge>
          )}
          {error && <Badge variant="danger" size="sm">Error</Badge>}
        </div>
      </div>
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex gap-1 px-4">
          <button
            className={clsx(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'request'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveTab('request')}
          >
            Request
          </button>
          <button
            className={clsx(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'response'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveTab('response')}
          >
            Response
          </button>
        </div>
      </div>
      {activeTab === 'request' && (
        <div className="p-0">
          <CodeBlock
            json={{
              method: request.method,
              url: request.url,
              headers: request.headers,
              body: request.body,
            }}
            language="http"
            collapsible={false}
            maxHeight="300px"
          />
        </div>
      )}
      {activeTab === 'response' && (
        <div className="p-0">
          {response ? (
            <CodeBlock
              json={{
                status: response.status,
                headers: response.headers,
                body: response.body,
                duration_ms: response.duration,
              }}
              language="json"
              collapsible={false}
              maxHeight="300px"
            />
          ) : (
            <div className="p-8 text-center text-gray-500">No response yet</div>
          )}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
};