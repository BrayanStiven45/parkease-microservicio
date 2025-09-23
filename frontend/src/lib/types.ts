// Tipos principales del sistema
export interface User {
  uid: string;
  email: string;
  username: string;
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface LoyaltyAccount {
  plate: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  joinDate: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  totalSpots: number;
  occupiedSpots: number;
  revenue: number;
  manager: string;
  isActive: boolean;
}

export interface Tariff {
  id: number;
  name: string;
  pricePerHour: number;
}

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeParking: number;
  totalBranches: number;
  monthlyGrowth: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  activeVehicles: number;
  totalCapacity: number;
  occupancyRate: number;
  todayRevenue: number;
  weeklyGrowth: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}