import { ApiResponse } from '../lib/api';

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// User/Auth API functions
export const userAPI = {
  // Login user
  async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Logout user
  async logout(): Promise<ApiResponse<null>> {
    const response = await fetch('/api/user/logout', {
      method: 'POST',
    });
    return response.json();
  },
};
