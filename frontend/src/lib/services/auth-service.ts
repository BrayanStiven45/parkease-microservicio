// Auth Service - Maneja autenticación y autorización
import { apiService } from './api-service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  parkingLotName: string;
  maxCapacity: number;
  hourlyCost: number;
  address: string;
  city: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    uid: string;
    email: string;
    username: string;
    parkingLotName?: string;
    maxCapacity?: number;
    hourlyCost?: number;
    address?: string;
    city?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
  };
}

class AuthService {
  
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/signup', userData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/refresh');
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout(); // Limpiar tokens si no se puede refrescar
      throw error;
    }
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  async validateToken(): Promise<boolean> {
    try {
      await apiService.get('/auth/validate');
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();