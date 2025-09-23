// Auth Service - Maneja autenticación con API Gateway
import type { User, LoginResponse, SignupRequest, SignupResponse, UserProfile } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Cargar datos del localStorage al inicializar
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      this.token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      this.user = userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(token: string, user: User): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    this.token = token;
    this.user = user;
  }

  private clearStorage(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.token = null;
    this.user = null;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Guardar en localStorage
      this.saveToStorage(data.token, data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data: SignupResponse = await response.json();
      
      // Guardar en localStorage
      this.saveToStorage(data.token, data.user);
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Siempre limpiar el storage local
      this.clearStorage();
    }
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async refreshUserData(): Promise<User | null> {
    try {
      if (!this.token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh user data');
      }

      const userData = await response.json();
      this.user = userData;
      localStorage.setItem('userData', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Si falla, podríamos hacer logout automático
      return null;
    }
  }

  // Método para validar si el token sigue siendo válido
  async validateToken(): Promise<boolean> {
    try {
      const userData = await this.refreshUserData();
      return !!userData;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();