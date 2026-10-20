// --- Chatlist contracts (match FrenzoAPI GET /api/conversations) ---

export interface LastMessageResponse {
  id: string;
  content: string;
  senderId: string;
  messageType: number;
  createdAt: string;
}

export interface ChatlistItemResponse {
  conversationId: string;
  type: number;
  isGroup: boolean;
  displayName: string;
  photoUrl: string | null;
  isMuted: boolean;
  isAdmin: boolean;
  unreadCount: number;
  lastMessage: LastMessageResponse | null;
  updatedAt: string;
}

export interface ChatlistQuery {
  cursor?: string;
  pageSize?: number;
}

// --- Start-chat picker contracts (match FrenzoAPI GET /api/users, POST /api/conversations/direct) ---

export interface UserListItemResponse {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
  hasDirectChat: boolean;
  directConversationId: string | null;
}

export interface StartDirectRequest {
  otherUserId: string;
}

// --- Realtime contracts (match FrenzoAPI ChatHub + MessageBroadcast) ---

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: number;
}

export interface MessageBroadcast {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: number;
  createdAt: string;
}

export type HubConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

// --- History contracts (match FrenzoAPI GET /api/conversations/{id}/messages) ---

export interface MessageItemResponse {
  id: string;
  senderId: string;
  content: string;
  messageType: number;
  createdAt: string;
}

export interface MessageHistoryQuery {
  cursor?: string;
  pageSize?: number;
}
