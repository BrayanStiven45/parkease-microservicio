// User Service - Maneja perfiles de usuario y configuración
import type { UserProfile, ParkingLotSettings, AdminStats } from '../types';
import { authService } from './auth-service';

const API_BASE_URL = 'http://localhost:3001/api';

class UserService {
  
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async uploadProfileImage(imageFile: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/user/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/delete-account`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Logout después de eliminar la cuenta
      await authService.logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Configuración del estacionamiento
  async getParkingLotSettings(): Promise<ParkingLotSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/parking-lot`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parking lot settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching parking lot settings:', error);
      throw error;
    }
  }

  async updateParkingLotSettings(settings: Partial<ParkingLotSettings>): Promise<ParkingLotSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/parking-lot`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update parking lot settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating parking lot settings:', error);
      throw error;
    }
  }

  // Funciones de administración (solo para admins)
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{
    users: UserProfile[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Crear nueva sucursal/branch (admin)
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

      const response = await fetch(`${API_BASE_URL}/admin/create-branch`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          ...branchData,
          email,
          role: 'user',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create branch');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  // Obtener todas las branches/sucursales (admin)
  async getAllBranches(): Promise<UserProfile[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/branches`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  // Eliminar branch (admin)
  async deleteBranch(branchId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/branches/${branchId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  }

  // Alternar estado activo/inactivo de branch (admin)
  async toggleBranchStatus(branchId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/branches/${branchId}/toggle-status`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle branch status');
      }
    } catch (error) {
      console.error('Error toggling branch status:', error);
      throw error;
    }
  }

  // Obtener branch específica por ID (admin)
  async getBranch(branchId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/branches/${branchId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch branch');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw error;
    }
  }
}

export const userService = new UserService();