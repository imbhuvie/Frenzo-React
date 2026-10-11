import api from './axios';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  UserResponse,
} from '../types/auth';

export const authApi = {
  signup: async (data: SignupRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post<ApiResponse<UserResponse>>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },
};
