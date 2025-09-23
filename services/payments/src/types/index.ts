export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: string | Date;
  exitTime?: string | Date;
  status: 'active' | 'completed';
  totalCost?: number;
  userId: string;
}

export interface PaymentRequest {
  recordId: string;
  userId: string;
  plate: string;
  pointsToRedeem?: number;
  hourlyCost: number;
  paymentInitiatedAt: string | Date;
}

export interface PaymentCalculation {
  hoursParked: number;
  initialCost: number;
  pointsDiscount: number;
  finalAmount: number;
  pointsEarned: number;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  paymentDetails?: {
    plate: string;
    totalCost: number;
    pointsEarned: number;
    pointsRedeemed: number;
    hoursParked: number;
  };
  error?: string;
}

export interface PlateData {
  puntos: number;
}

export interface AvailablePointsResponse {
  plate: string;
  availablePoints: number;
}