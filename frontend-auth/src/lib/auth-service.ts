const API_BASE_URL = 'http://localhost:3001'; // API Gateway URL

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username?: string;
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    uid: string;
    email: string;
    [key: string]: any;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {

    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });


    if (!response.ok) {
      const error = await response.json();
      console.log(error)
      throw new Error(error.error || 'Signup failed');
    }
    
    return response.json();
  }
}

export const authService = new AuthService();