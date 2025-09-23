export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: string | Date;
  exitTime?: string | Date;
  status: 'active' | 'completed';
  totalCost?: number;
  userId: string;
  branchId: string;
}

export interface PaymentRequest {
  recordId: string;
  userId: string;
  plate: string;
  hourlyCost: number;
  paymentInitiatedAt: string | Date;
  paymentMethod: 'cash' | 'card' | 'digital_wallet';
  discountAmount?: number; // Descuento aplicado desde servicio externo
}

export interface PaymentCalculation {
  hoursParked: number;
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  breakdown: {
    hourlyRate: number;
    totalHours: number;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  paymentDetails?: {
    transactionId: string;
    plate: string;
    totalAmount: number;
    paymentMethod: string;
    hoursParked: number;
    timestamp: string | Date;
  };
  error?: string;
}

export interface PaymentTransaction {
  id: string;
  recordId: string;
  userId: string;
  plate: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'digital_wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionDate: Date | string;
  receiptNumber: string;
}

export interface TaxCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}