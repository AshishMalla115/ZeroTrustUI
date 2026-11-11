import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Scenario1Login } from './pages/Scenario1Login';
import { Scenario2FailedAuth } from './pages/Scenario2FailedAuth';
import { Scenario3Middleware } from './pages/Scenario3Middleware';
import { Scenario4Blacklist } from './pages/Scenario4Blacklist';
import { Scenario5Admin } from './pages/Scenario5Admin';
import { Scenario6Validation } from './pages/Scenario6Validation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="scenario/1" element={<Scenario1Login />} />
            <Route path="scenario/2" element={<Scenario2FailedAuth />} />
            <Route path="scenario/3" element={<Scenario3Middleware />} />
            <Route path="scenario/4" element={<Scenario4Blacklist />} />
            <Route path="scenario/5" element={<Scenario5Admin />} />
            <Route path="scenario/6" element={<Scenario6Validation />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;