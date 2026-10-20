import { useCallback, useEffect, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { createChatConnection } from '../api/signalr';
import type { HubConnectionStatus, MessageBroadcast, SendMessageRequest } from '../types/chat';

// Persistent hub connection (not a fetch — exempt from the one-effect FETCH_RULES shape,
// but keeps its cleanup discipline). Connects on mount, drops on unmount.
export function useChatHub(
  enabled: boolean,
  getToken: () => string | null,
  onReceive: (message: MessageBroadcast) => void,
) {
  const [status, setStatus] = useState<HubConnectionStatus>('disconnected');
  const connectionRef = useRef<HubConnection | null>(null);
  const handlerRef = useRef(onReceive);
  handlerRef.current = onReceive;

  useEffect(() => {
    if (!enabled) return;
    const token = getToken();
    if (!token) {
      setStatus('disconnected');
      return;
    }

    const connection = createChatConnection(getToken);
    connectionRef.current = connection;
    let cancelled = false;

    connection.on('ReceiveMessage', (message: MessageBroadcast) => {
      handlerRef.current(message);
    });
    connection.onreconnecting(() => {
      if (!cancelled) setStatus('reconnecting');
    });
    connection.onreconnected(() => {
      if (!cancelled) setStatus('connected');
    });
    connection.onclose(() => {
      if (!cancelled) setStatus('disconnected');
    });

    setStatus('connecting');
    connection
      .start()
      .then(() => {
        if (!cancelled) setStatus('connected');
      })
      .catch(() => {
        if (!cancelled) setStatus('disconnected');
      });

    return () => {
      cancelled = true;
      connectionRef.current = null;
      void connection.stop();
    };
    // getToken/onReceive intentionally excluded: refs carry the latest (stable lifecycle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const sendMessage = useCallback(
    async (data: SendMessageRequest): Promise<MessageBroadcast> => {
      const connection = connectionRef.current;
      if (!connection) {
        throw new Error('Not connected. Please wait and try again.');
      }
      return connection.invoke<MessageBroadcast>('SendMessage', data);
    },
    [],
  );

  return { status, sendMessage };
}
