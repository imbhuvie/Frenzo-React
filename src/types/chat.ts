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
