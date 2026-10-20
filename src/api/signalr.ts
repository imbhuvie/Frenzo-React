import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Single shared builder: same-origin /hubs/chat (vite proxy), token via accessTokenFactory
// (client sends it as ?access_token= on WebSocket, matching the backend hook).
export function createChatConnection(getToken: () => string | null): HubConnection {
  return new HubConnectionBuilder()
    .withUrl('/hubs/chat', { accessTokenFactory: () => getToken() ?? '' })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}
