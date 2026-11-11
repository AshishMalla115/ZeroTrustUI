import { useEffect, useState, useCallback } from 'react';
import { websocketManager } from '../api/websocket';
import type { WebSocketMessage, WebSocketRiskUpdate, WebSocketAlert } from '../types/api';
import { useAuthStore } from '../stores/authStore';

export interface UseWebSocketReturn {
  latestRiskUpdate: WebSocketRiskUpdate | null;
  latestAlert: WebSocketAlert | null;
  isConnected: boolean;
  riskUpdates: WebSocketRiskUpdate[];
  alerts: WebSocketAlert[];
  clearHistory: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [latestRiskUpdate, setLatestRiskUpdate] = useState<WebSocketRiskUpdate | null>(null);
  const [latestAlert, setLatestAlert] = useState<WebSocketAlert | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [riskUpdates, setRiskUpdates] = useState<WebSocketRiskUpdate[]>([]);
  const [alerts, setAlerts] = useState<WebSocketAlert[]>([]);
  const { adminToken } = useAuthStore();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'risk_update':
        setLatestRiskUpdate(message);
        setRiskUpdates((prev) => [...prev.slice(-49), message]);
        break;
      case 'alert':
        setLatestAlert(message);
        setAlerts((prev) => [...prev.slice(-19), message]);
        break;
      case 'connected':
        setIsConnected(true);
        break;
    }
  }, []);

  useEffect(() => {
    if (!adminToken) {
      websocketManager.disconnect();
      setIsConnected(false);
      return;
    }

    const unsubscribe = websocketManager.subscribe(handleMessage);
    websocketManager.connect();

    const interval = setInterval(() => {
      setIsConnected(websocketManager.isConnected);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [adminToken, handleMessage]);

  const clearHistory = useCallback(() => {
    setRiskUpdates([]);
    setAlerts([]);
  }, []);

  return {
    latestRiskUpdate,
    latestAlert,
    isConnected,
    riskUpdates,
    alerts,
    clearHistory,
  };
};