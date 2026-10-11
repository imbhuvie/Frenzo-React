import api from './axios';
import type { ApiResponse } from '../types/auth';
import type {
  ChatlistItemResponse,
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
};
