// User Service - Maneja perfiles de usuario y gestión administrativa
import { apiService } from './api-service';

export interface UserProfile {
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
  updatedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeParking: number;
  totalBranches: number;
  monthlyGrowth: number;
}

class UserService {
  
  async getProfile(): Promise<UserProfile> {
    try {
      return await apiService.get<UserProfile>('/user/profile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      return await apiService.put<UserProfile>('/user/profile', profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.put('/user/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Admin functions
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      return await apiService.get<UserProfile[]>('/admin/users');
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  async getAllBranches(): Promise<UserProfile[]> {
    try {
      return await apiService.get<UserProfile[]>('/admin/branches');
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  async getBranch(branchId: string): Promise<UserProfile> {
    try {
      return await apiService.get<UserProfile>(`/admin/branches/${branchId}`);
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw error;
    }
  }

  async createBranch(branchData: {
    username: string;
    parkingLotName: string;
    maxCapacity: number;
    hourlyCost: number;
    address: string;
    city: string;
    password: string;
  }): Promise<UserProfile> {
    try {
      // Generar email automáticamente
      const sanitizedName = branchData.parkingLotName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${sanitizedName}@parkease.com`;

      return await apiService.post<UserProfile>('/admin/create-branch', {
        ...branchData,
        email,
        role: 'user',
      });
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async deleteBranch(branchId: string): Promise<void> {
    try {
      await apiService.delete(`/admin/branches/${branchId}`);
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  }

  async toggleBranchStatus(branchId: string): Promise<void> {
    try {
      await apiService.put(`/admin/branches/${branchId}/toggle-status`);
    } catch (error) {
      console.error('Error toggling branch status:', error);
      throw error;
    }
  }

  async getAdminStats(): Promise<AdminStats> {
    try {
      return await apiService.get<AdminStats>('/admin/stats');
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalUsers: 0,
        totalRevenue: 0,
        activeParking: 0,
        totalBranches: 0,
        monthlyGrowth: 0,
      };
    }
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      return await apiService.get<UserProfile[]>(`/admin/users/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await apiService.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId: string): Promise<void> {
    try {
      await apiService.put(`/admin/users/${userId}/toggle-status`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      await apiService.put(`/admin/users/${userId}/role`, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
}

export const userService = new UserService();