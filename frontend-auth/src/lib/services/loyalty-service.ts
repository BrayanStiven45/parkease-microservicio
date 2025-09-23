// Loyalty Service - Maneja el sistema de puntos y recompensas
import type { LoyaltyAccount, LoyaltyTransaction, LoyaltyStats } from '../types';
import { authService } from './auth-service';

const API_BASE_URL = 'http://localhost:3001/api';

class LoyaltyService {
  
  async getLoyaltyPoints(plate: string): Promise<{ points: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/${plate}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty points');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      throw error;
    }
  }

  async getLoyaltyAccount(plate: string): Promise<LoyaltyAccount> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/account/${plate}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty account');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loyalty account:', error);
      throw error;
    }
  }

  async getLoyaltyHistory(plate: string, page: number = 1, limit: number = 10): Promise<{
    transactions: LoyaltyTransaction[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/history/${plate}?page=${page}&limit=${limit}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loyalty history:', error);
      throw error;
    }
  }

  async addLoyaltyPoints(plate: string, points: number, description: string = 'Points earned'): Promise<LoyaltyTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/add`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          plate,
          points,
          type: 'earned',
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add loyalty points');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw error;
    }
  }

  async redeemLoyaltyPoints(plate: string, points: number, description: string = 'Points redeemed'): Promise<LoyaltyTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/redeem`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          plate,
          points,
          type: 'redeemed',
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem loyalty points');
      }

      return await response.json();
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      throw error;
    }
  }

  async getAllLoyaltyAccounts(userId: string, page: number = 1, limit: number = 20): Promise<{
    accounts: LoyaltyAccount[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/accounts/${userId}?page=${page}&limit=${limit}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty accounts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loyalty accounts:', error);
      throw error;
    }
  }

  async getLoyaltyStats(userId: string): Promise<LoyaltyStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/stats/${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching loyalty stats:', error);
      throw error;
    }
  }

  async searchLoyaltyAccounts(userId: string, query: string): Promise<LoyaltyAccount[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/search/${userId}?q=${encodeURIComponent(query)}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to search loyalty accounts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching loyalty accounts:', error);
      throw error;
    }
  }

  async createLoyaltyAccount(plate: string): Promise<LoyaltyAccount> {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/create`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ plate }),
      });

      if (!response.ok) {
        throw new Error('Failed to create loyalty account');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating loyalty account:', error);
      throw error;
    }
  }

  // Métodos de conveniencia para cálculos comunes
  calculatePointsFromAmount(amount: number, pointsPerPeso: number = 0.1): number {
    return Math.floor(amount * pointsPerPeso);
  }

  calculateDiscountFromPoints(points: number, pesosPerPoint: number = 10): number {
    return points * pesosPerPoint;
  }

  getPointsExpirationDate(earnedDate: Date, expirationDays: number = 365): Date {
    const expiration = new Date(earnedDate);
    expiration.setDate(expiration.getDate() + expirationDays);
    return expiration;
  }

  // Verificar si una cuenta tiene puntos suficientes
  async canRedeemPoints(plate: string, pointsToRedeem: number): Promise<boolean> {
    try {
      const account = await this.getLoyaltyAccount(plate);
      return account.points >= pointsToRedeem;
    } catch {
      return false;
    }
  }
}

export const loyaltyService = new LoyaltyService();