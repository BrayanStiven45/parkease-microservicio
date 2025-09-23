// Loyalty Service - Maneja sistema de puntos de lealtad
import { apiService } from './api-service';

export interface LoyaltyAccount {
  plate: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  joinDate: string;
}

export interface LoyaltyTransaction {
  id: string;
  plate: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  date: string;
}

class LoyaltyService {
  
  async getLoyaltyPoints(plate: string): Promise<{ points: number }> {
    try {
      return await apiService.get<{ points: number }>(`/loyalty/points/${encodeURIComponent(plate)}`);
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      return { points: 0 };
    }
  }

  async getLoyaltyAccount(plate: string): Promise<LoyaltyAccount | null> {
    try {
      return await apiService.get<LoyaltyAccount>(`/loyalty/account/${encodeURIComponent(plate)}`);
    } catch (error) {
      console.error('Error fetching loyalty account:', error);
      return null;
    }
  }

  async createLoyaltyAccount(plate: string): Promise<LoyaltyAccount> {
    try {
      return await apiService.post<LoyaltyAccount>('/loyalty/account', { plate });
    } catch (error) {
      console.error('Error creating loyalty account:', error);
      throw error;
    }
  }

  async addLoyaltyPoints(plate: string, points: number, description: string): Promise<{ 
    newBalance: number; 
    pointsAdded: number; 
  }> {
    try {
      return await apiService.post(`/loyalty/points/add`, {
        plate,
        points,
        description,
      });
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw error;
    }
  }

  async redeemLoyaltyPoints(plate: string, points: number, description: string): Promise<{ 
    newBalance: number; 
    pointsRedeemed: number; 
  }> {
    try {
      return await apiService.post(`/loyalty/points/redeem`, {
        plate,
        points,
        description,
      });
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      throw error;
    }
  }

  async getLoyaltyHistory(plate: string): Promise<LoyaltyTransaction[]> {
    try {
      return await apiService.get<LoyaltyTransaction[]>(`/loyalty/history/${encodeURIComponent(plate)}`);
    } catch (error) {
      console.error('Error fetching loyalty history:', error);
      return [];
    }
  }

  async getAllLoyaltyAccounts(): Promise<LoyaltyAccount[]> {
    try {
      return await apiService.get<LoyaltyAccount[]>('/loyalty/accounts');
    } catch (error) {
      console.error('Error fetching all loyalty accounts:', error);
      return [];
    }
  }

  calculatePointsFromCost(cost: number): number {
    // 1 punto por cada $1 gastado
    return Math.floor(cost);
  }

  calculateDiscountFromPoints(points: number): number {
    // Cada 100 puntos = $1 de descuento
    return Math.floor(points / 100);
  }

  getTierFromPoints(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  }

  getTierBenefits(tier: string): string[] {
    switch (tier) {
      case 'platinum':
        return ['20% discount on all parking', '2x points', 'Priority support', 'Free valet service'];
      case 'gold':
        return ['15% discount on all parking', '1.5x points', 'Priority support'];
      case 'silver':
        return ['10% discount on all parking', '1.2x points'];
      case 'bronze':
      default:
        return ['5% discount on long stays', 'Standard points'];
    }
  }
}

export const loyaltyService = new LoyaltyService();