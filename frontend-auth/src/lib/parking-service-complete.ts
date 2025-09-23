import { authService } from './auth-service-complete';

const API_BASE_URL = 'http://localhost:3001'; // API Gateway URL

export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: string;
  exitTime?: string;
  status: 'parked' | 'completed';
  totalCost?: number;
  parkingLotName?: string;
  userId: string;
}

export interface AddRecordRequest {
  plate: string;
}

export interface PaymentRequest {
  recordId: string;
  pointsToRedeem?: number;
}

export interface ParkingStats {
  totalVehicles: number;
  currentlyParked: number;
  todayRevenue: number;
  monthlyRevenue: number;
  averageStayTime: number;
  occupancyRate: number;
}

export interface ParkingHistory {
  records: ParkingRecord[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

class ParkingService {
  // Active parking records
  async getActiveParkingRecords(userId: string): Promise<ParkingRecord[]> {
    const response = await fetch(`${API_BASE_URL}/api/parking/active/${userId}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch parking records');
    }

    return response.json();
  }

  // Add new parking record
  async addParkingRecord(userId: string, data: AddRecordRequest): Promise<ParkingRecord> {
    const response = await fetch(`${API_BASE_URL}/api/parking/add/${userId}`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to add parking record');
    }

    return response.json();
  }

  // Process payment
  async processPayment(userId: string, data: PaymentRequest): Promise<{ message: string; cost: number }> {
    const response = await fetch(`${API_BASE_URL}/api/parking/payment/${userId}`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to process payment');
    }

    return response.json();
  }

  // Get parking history with pagination
  async getParkingHistory(userId: string, page: number = 1, limit: number = 10): Promise<ParkingHistory> {
    const response = await fetch(`${API_BASE_URL}/api/parking/history/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch parking history');
    }

    return response.json();
  }

  // Get parking statistics
  async getParkingStats(userId: string): Promise<ParkingStats> {
    const response = await fetch(`${API_BASE_URL}/api/parking/stats/${userId}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch parking statistics');
    }

    return response.json();
  }

  // Update parking record
  async updateParkingRecord(userId: string, recordId: string, data: Partial<ParkingRecord>): Promise<ParkingRecord> {
    const response = await fetch(`${API_BASE_URL}/api/parking/update/${userId}/${recordId}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update parking record');
    }

    return response.json();
  }

  // Delete parking record
  async deleteParkingRecord(userId: string, recordId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/parking/delete/${userId}/${recordId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete parking record');
    }

    return response.json();
  }

  // Search parking records
  async searchParkingRecords(userId: string, query: string): Promise<ParkingRecord[]> {
    const response = await fetch(`${API_BASE_URL}/api/parking/search/${userId}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search parking records');
    }

    return response.json();
  }
}

export const parkingService = new ParkingService();