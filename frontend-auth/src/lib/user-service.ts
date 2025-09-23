import { authService, User } from './auth-service-complete';

const API_BASE_URL = 'http://localhost:3001'; // API Gateway URL

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  profileImage?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  ownerId: string;
  maxCapacity: number;
  currentOccupancy: number;
  hourlyCost: number;
  address: string;
  city: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalParkingLots: number;
  totalActiveVehicles: number;
  totalRevenue: number;
  recentRegistrations: User[];
  topParkingLots: ParkingLot[];
}

class UserService {
  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return response.json();
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }

    return response.json();
  }

  // Upload profile image
  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(`${API_BASE_URL}/api/user/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile image');
    }

    return response.json();
  }

  // Delete user account
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/user/delete-account`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete account');
    }

    return response.json();
  }

  // Get parking lot information (for parking lot owners)
  async getParkingLotInfo(): Promise<ParkingLot> {
    const response = await fetch(`${API_BASE_URL}/api/user/parking-lot`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get parking lot information');
    }

    return response.json();
  }

  // Update parking lot settings
  async updateParkingLotSettings(data: {
    name?: string;
    maxCapacity?: number;
    hourlyCost?: number;
    address?: string;
    city?: string;
  }): Promise<ParkingLot> {
    const response = await fetch(`${API_BASE_URL}/api/user/parking-lot`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update parking lot settings');
    }

    return response.json();
  }

  // Admin methods
  async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: UserProfile[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get users');
    }

    return response.json();
  }

  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get admin statistics');
    }

    return response.json();
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle user status');
    }

    return response.json();
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return response.json();
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search users');
    }

    return response.json();
  }
}

export const userService = new UserService();