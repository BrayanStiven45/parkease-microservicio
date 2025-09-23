import { authService } from './auth-service-complete';

const API_BASE_URL = 'http://localhost:3001'; // API Gateway URL

export interface LoyaltyAccount {
  plate: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  createdAt: string;
  lastUpdated: string;
}

export interface LoyaltyTransaction {
  id: string;
  plate: string;
  type: 'earned' | 'redeemed';
  points: number;
  reason: string;
  parkingRecordId?: string;
  createdAt: string;
}

export interface LoyaltyStats {
  totalPlates: number;
  totalPointsInCirculation: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  topLoyaltyPlates: Array<{
    plate: string;
    points: number;
    totalEarned: number;
  }>;
}

class LoyaltyService {
  // Get loyalty points for a specific plate
  async getLoyaltyPoints(plate: string): Promise<{ points: number }> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/${plate}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get loyalty points');
    }

    return response.json();
  }

  // Get detailed loyalty account information
  async getLoyaltyAccount(plate: string): Promise<LoyaltyAccount> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/account/${plate}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get loyalty account');
    }

    return response.json();
  }

  // Get loyalty transaction history
  async getLoyaltyHistory(plate: string, page: number = 1, limit: number = 10): Promise<{
    transactions: LoyaltyTransaction[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/history/${plate}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get loyalty history');
    }

    return response.json();
  }

  // Add loyalty points
  async addLoyaltyPoints(plate: string, points: number, reason: string, parkingRecordId?: string): Promise<LoyaltyAccount> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/add`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({
        plate,
        points,
        reason,
        parkingRecordId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add loyalty points');
    }

    return response.json();
  }

  // Redeem loyalty points
  async redeemLoyaltyPoints(plate: string, points: number, reason: string): Promise<LoyaltyAccount> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/redeem`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({
        plate,
        points,
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to redeem loyalty points');
    }

    return response.json();
  }

  // Get all loyalty accounts for a user's parking lot
  async getAllLoyaltyAccounts(userId: string): Promise<LoyaltyAccount[]> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/accounts/${userId}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get loyalty accounts');
    }

    return response.json();
  }

  // Get loyalty statistics
  async getLoyaltyStats(userId: string): Promise<LoyaltyStats> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/stats/${userId}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get loyalty statistics');
    }

    return response.json();
  }

  // Search loyalty accounts by plate
  async searchLoyaltyAccounts(userId: string, query: string): Promise<LoyaltyAccount[]> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/search/${userId}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search loyalty accounts');
    }

    return response.json();
  }

  // Create or update loyalty account
  async createLoyaltyAccount(plate: string): Promise<LoyaltyAccount> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/create`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ plate }),
    });

    if (!response.ok) {
      throw new Error('Failed to create loyalty account');
    }

    return response.json();
  }
}

export const loyaltyService = new LoyaltyService();