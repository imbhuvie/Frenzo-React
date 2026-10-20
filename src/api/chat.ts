import api from './axios';
import type { ApiResponse } from '../types/auth';
import type {
  ChatlistItemResponse,
  MessageItemResponse,
  StartDirectRequest,
  UserListItemResponse,
} from '../types/chat';

export const chatApi = {
  getChatlist: async (cursor?: string, pageSize = 20): Promise<ApiResponse<ChatlistItemResponse[]>> => {
    const response = await api.get<ApiResponse<ChatlistItemResponse[]>>('/conversations', {
      params: { ...(cursor ? { cursor } : {}), pageSize },
    });
    return response.data;
  },

  getUsers: async (search?: string, pageSize = 20): Promise<ApiResponse<UserListItemResponse[]>> => {
    const response = await api.get<ApiResponse<UserListItemResponse[]>>('/users', {
      params: { ...(search ? { search } : {}), pageSize },
    });
    return response.data;
  },

  startDirect: async (data: StartDirectRequest): Promise<ApiResponse<ChatlistItemResponse>> => {
    const response = await api.post<ApiResponse<ChatlistItemResponse>>('/conversations/direct', data);
    return response.data;
  },

  getHistory: async (
    conversationId: string,
    cursor?: string,
    pageSize = 30,
  ): Promise<ApiResponse<MessageItemResponse[]>> => {
    const response = await api.get<ApiResponse<MessageItemResponse[]>>(
      `/conversations/${conversationId}/messages`,
      { params: { ...(cursor ? { cursor } : {}), pageSize } },
    );
    return response.data;
  },

  markRead: async (conversationId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>(`/conversations/${conversationId}/read`);
    return response.data;
  },
};
