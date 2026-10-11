import api from './axios';
import type { ApiResponse } from '../types/auth';
import type { ChatlistItemResponse } from '../types/chat';

export const chatApi = {
  getChatlist: async (cursor?: string, pageSize = 20): Promise<ApiResponse<ChatlistItemResponse[]>> => {
    const response = await api.get<ApiResponse<ChatlistItemResponse[]>>('/conversations', {
      params: { ...(cursor ? { cursor } : {}), pageSize },
    });
    return response.data;
  },
};
