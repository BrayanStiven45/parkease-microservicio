// Tipos TypeScript completos para el sistema ParkEase

export interface User {
  uid: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  role?: 'user' | 'admin';
  parkingLotName: string;
  maxCapacity: number;
  hourlyCost: number;
  address: string;
  city: string;
}

export interface SignupResponse {
  message: string;
  user: User;
  token: string;
}

export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: string;
  exitTime?: string;
  status: 'parked' | 'completed';
  cost?: number;
  totalCost?: number;
  userId: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  parkingLotName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParkingStats {
  totalVehicles: number;
  currentlyParked: number;
  todayRevenue: number;
  monthlyRevenue: number;
  averageStayTime: number;
  occupancyRate: number;
}

export interface ParkingHistoryResponse {
  records: ParkingRecord[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ParkingPayment {
  message: string;
  cost: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  finalCost?: number;
}

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
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  createdAt: string;
}

export interface LoyaltyStats {
  totalAccounts: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeAccounts: number;
  averagePointsPerAccount: number;
  topAccounts: Array<{
    plate: string;
    points: number;
  }>;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ParkingLotSettings {
  parkingLotName: string;
  maxCapacity: number;
  hourlyCost: number;
  address: string;
  city: string;
  operatingHours: {
    open: string;
    close: string;
  };
  loyaltyProgram: {
    enabled: boolean;
    pointsPerPeso: number;
    pesosPerPoint: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalActiveUsers: number;
  totalParkingLots: number;
  totalRevenue: number;
  totalVehiclesParked: number;
  topParkingLots: Array<{
    name: string;
    revenue: number;
    vehiclesCount: number;
  }>;
}

// Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  totalVehicles: number;
  currentlyParked: number;
  occupancyRate: number;
  revenueGrowth: number;
  vehicleGrowth: number;
  averageStayTime: number;
  peakHour: string;
  topPlates: Array<{
    plate: string;
    visits: number;
  }>;
}

export interface RevenueStats {
  totalRevenue: number;
  period: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: string;
    revenue: number;
  }>;
  growth: number;
  averageTicketValue: number;
}

export interface OccupancyStats {
  averageOccupancy: number;
  maxOccupancy: number;
  period: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: string;
    occupancy: number;
    capacity: number;
  }>;
  peakTimes: Array<{
    hour: number;
    occupancy: number;
  }>;
}

export interface VehicleStats {
  totalVehicles: number;
  uniqueVehicles: number;
  returningCustomers: number;
  newCustomers: number;
  averageVisitsPerVehicle: number;
  vehicleTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
}

export interface PeakHoursStats {
  peakHours: Array<{
    hour: number;
    vehicleCount: number;
    revenue: number;
  }>;
  quietHours: Array<{
    hour: number;
    vehicleCount: number;
    revenue: number;
  }>;
  recommendations: string[];
}

export interface AnalyticsExportData {
  format: 'csv' | 'json' | 'pdf';
  downloadUrl: string;
  generatedAt: string;
  size: number;
}

export interface ComparativeStats {
  period1: {
    start: string;
    end: string;
    revenue: number;
    vehicles: number;
    occupancy: number;
  };
  period2: {
    start: string;
    end: string;
    revenue: number;
    vehicles: number;
    occupancy: number;
  };
  comparison: {
    revenueGrowth: number;
    vehicleGrowth: number;
    occupancyGrowth: number;
  };
}

export interface RealtimeStats {
  currentlyParked: number;
  availableSpots: number;
  occupancyRate: number;
  todayRevenue: number;
  todayVehicles: number;
  lastUpdated: string;
  recentActivity: Array<{
    type: 'entry' | 'exit';
    plate: string;
    time: string;
  }>;
}

// Tipos legacy mantenidos para compatibilidad
export type Tariff = {
  id: number;
  name: string;
  pricePerHour: number;
};

export type Branch = {
  id: string;
  name: string;
  location: string;
  totalSpots: number;
  occupiedSpots: number;
  revenue: number;
}

// UI Component Types
export interface ToastMessage {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export interface SidebarMenuItem {
  href: string;
  label: string;
  icon: React.ComponentType;
  adminOnly: boolean;
}