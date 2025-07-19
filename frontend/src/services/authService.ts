import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OAuthProvider {
  provider: 'google' | 'github';
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  permissions: string[];
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store token and user in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async loginWithOAuth(provider: OAuthProvider): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`/auth/oauth/${provider.provider}`, {
      code: provider.code
    });
    
    // Store token and user in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    localStorage.setItem('token', response.token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async resetPassword(email: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/reset-password', { email });
  }

  // Helper methods
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  hasPermission(permission: string): boolean {
    const user = this.getStoredUser();
    return user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }
}

export const authService = new AuthService();