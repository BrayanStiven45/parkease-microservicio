// Parking Service - Maneja registros de estacionamiento
import { apiService } from './api-service';

export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: string;
  exitTime?: string;
  status: 'parked' | 'completed';
  totalCost?: number;
  parkingLotName?: string;
  userId?: string;
}

export interface AddRecordRequest {
  plate: string;
  entryTime?: string;
}

export interface PaymentRequest {
  recordId: string;
  loyaltyPoints?: number;
  paymentMethod?: string;
}

class ParkingService {
  
  async getActiveParkingRecords(userId?: string): Promise<ParkingRecord[]> {
    try {
      const endpoint = userId ? `/parking/active/${userId}` : '/parking/active';
      return await apiService.get<ParkingRecord[]>(endpoint);
    } catch (error) {
      console.error('Error fetching active parking records:', error);
      throw error;
    }
  }

  async getParkingHistory(userId?: string, page = 1, limit = 10): Promise<{
    records: ParkingRecord[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const endpoint = userId 
        ? `/parking/history/${userId}?page=${page}&limit=${limit}`
        : `/parking/history?page=${page}&limit=${limit}`;
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Error fetching parking history:', error);
      throw error;
    }
  }

  async addParkingRecord(userId: string, data: AddRecordRequest): Promise<ParkingRecord> {
    try {
      return await apiService.post<ParkingRecord>(`/parking/records/${userId}`, {
        ...data,
        entryTime: data.entryTime || new Date().toISOString(),
        status: 'parked',
      });
    } catch (error) {
      console.error('Error adding parking record:', error);
      throw error;
    }
  }

  async processPayment(userId: string, data: PaymentRequest): Promise<{ 
    message: string; 
    cost: number;
    pointsEarned?: number;
    pointsUsed?: number;
  }> {
    try {
      return await apiService.post(`/parking/payment/${userId}`, data);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async searchRecords(query: string, userId?: string): Promise<ParkingRecord[]> {
    try {
      const endpoint = userId 
        ? `/parking/search/${userId}?q=${encodeURIComponent(query)}`
        : `/parking/search?q=${encodeURIComponent(query)}`;
      return await apiService.get<ParkingRecord[]>(endpoint);
    } catch (error) {
      console.error('Error searching parking records:', error);
      throw error;
    }
  }

  async getRecordById(recordId: string): Promise<ParkingRecord> {
    try {
      return await apiService.get<ParkingRecord>(`/parking/record/${recordId}`);
    } catch (error) {
      console.error('Error fetching parking record:', error);
      throw error;
    }
  }

  async deleteRecord(recordId: string): Promise<void> {
    try {
      await apiService.delete(`/parking/record/${recordId}`);
    } catch (error) {
      console.error('Error deleting parking record:', error);
      throw error;
    }
  }

  async calculateCost(recordId: string): Promise<{ cost: number; duration: string }> {
    try {
      return await apiService.get(`/parking/calculate-cost/${recordId}`);
    } catch (error) {
      console.error('Error calculating cost:', error);
      throw error;
    }
  }
}

export const parkingService = new ParkingService();