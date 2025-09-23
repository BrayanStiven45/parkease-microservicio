// Parking Service - Maneja todas las operaciones de parking
import type { ParkingRecord, ParkingStats, ParkingHistoryResponse, ParkingPayment } from '../types';
import { authService } from './auth-service';

const API_BASE_URL = 'http://localhost:3001/api';

class ParkingService {
  
  async getActiveParkingRecords(userId: string): Promise<ParkingRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/active/${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active parking records');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching active parking records:', error);
      throw error;
    }
  }

  async addParkingRecord(userId: string, plate: string): Promise<ParkingRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/add/${userId}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ plate }),
      });

      if (!response.ok) {
        throw new Error('Failed to add parking record');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding parking record:', error);
      throw error;
    }
  }

  async processPayment(userId: string, recordId: string, pointsToRedeem: number = 0): Promise<ParkingPayment> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/payment/${userId}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ recordId, pointsToRedeem }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async getParkingHistory(userId: string, page: number = 1, limit: number = 10): Promise<ParkingHistoryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/history/${userId}?page=${page}&limit=${limit}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parking history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching parking history:', error);
      throw error;
    }
  }

  async getParkingStats(userId: string): Promise<ParkingStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/stats/${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parking stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching parking stats:', error);
      throw error;
    }
  }

  async updateParkingRecord(userId: string, recordId: string, updates: Partial<ParkingRecord>): Promise<ParkingRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/update/${userId}/${recordId}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update parking record');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating parking record:', error);
      throw error;
    }
  }

  async deleteParkingRecord(userId: string, recordId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/delete/${userId}/${recordId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete parking record');
      }
    } catch (error) {
      console.error('Error deleting parking record:', error);
      throw error;
    }
  }

  async searchParkingRecords(userId: string, query: string): Promise<ParkingRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/search/${userId}?q=${encodeURIComponent(query)}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to search parking records');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching parking records:', error);
      throw error;
    }
  }

  // Método para obtener estadísticas de ocupación en tiempo real
  async getOccupancyStats(userId: string): Promise<{
    currentlyParked: number;
    maxCapacity: number;
    occupancyRate: number;
    availableSpots: number;
  }> {
    try {
      const stats = await this.getParkingStats(userId);
      const user = authService.getCurrentUser();
      const maxCapacity = user?.maxCapacity || 50;

      return {
        currentlyParked: stats.currentlyParked,
        maxCapacity,
        occupancyRate: stats.occupancyRate,
        availableSpots: maxCapacity - stats.currentlyParked,
      };
    } catch (error) {
      console.error('Error fetching occupancy stats:', error);
      throw error;
    }
  }

  // Método para obtener estadísticas de ingresos
  async getRevenueStats(userId: string): Promise<{
    todayRevenue: number;
    monthlyRevenue: number;
    totalRevenue: number;
    averageTicketValue: number;
  }> {
    try {
      const stats = await this.getParkingStats(userId);
      
      return {
        todayRevenue: stats.todayRevenue,
        monthlyRevenue: stats.monthlyRevenue,
        totalRevenue: stats.monthlyRevenue * 12, // Estimación simple
        averageTicketValue: stats.todayRevenue / Math.max(1, stats.totalVehicles),
      };
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  }
}

export const parkingService = new ParkingService();