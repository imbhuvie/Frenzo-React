// --- Request DTOs (match FrenzoAPI backend) ---

export interface SignupRequest {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

// --- Response DTOs ---

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  expiresAt: string;
}

// --- Standard API envelope from backend ---

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
}
