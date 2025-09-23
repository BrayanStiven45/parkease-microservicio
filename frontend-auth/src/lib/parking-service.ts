const API_BASE_URL = 'http://localhost:3001'; // API Gateway URL

export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: string;
  exitTime?: string;
  status: 'parked' | 'completed';
  totalCost?: number;
  parkingLotName?: string;
}

export interface AddRecordRequest {
  plate: string;
}

export interface PaymentRequest {
  recordId: string;
  pointsToRedeem?: number;
}

class ParkingService {
  async getActiveParkingRecords(userId: string): Promise<ParkingRecord[]> {
    const response = await fetch(`${API_BASE_URL}/api/parking/active/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch parking records');
    }

    return response.json();
  }

  async addParkingRecord(userId: string, data: AddRecordRequest): Promise<ParkingRecord> {
    const response = await fetch(`${API_BASE_URL}/api/parking/add/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to add parking record');
    }

    return response.json();
  }

  async processPayment(userId: string, data: PaymentRequest): Promise<{ message: string; cost: number }> {
    const response = await fetch(`${API_BASE_URL}/api/parking/payment/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to process payment');
    }

    return response.json();
  }

  async getLoyaltyPoints(plate: string): Promise<{ points: number }> {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/${plate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get loyalty points');
    }

    return response.json();
  }
}

export const parkingService = new ParkingService();