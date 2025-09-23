// Authentication Types
export interface User {
  uid: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
  createdAt: string;
  isActive: boolean;
  profileImage?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
  role?: 'user' | 'admin';
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
}

// Parking Types
export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: string;
  exitTime?: string;
  status: 'parked' | 'completed';
  totalCost?: number;
  parkingLotName?: string;
  userId: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
}

export interface ParkingLot {
  id: string;
  name: string;
  ownerId: string;
  maxCapacity: number;
  currentOccupancy: number;
  hourlyCost: number;
  address: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  operatingHours?: {
    open: string;
    close: string;
  };
}

// Loyalty Types
export interface LoyaltyAccount {
  plate: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  createdAt: string;
  lastUpdated: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
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

// Statistics and Analytics Types
export interface ParkingStats {
  totalVehicles: number;
  currentlyParked: number;
  todayRevenue: number;
  monthlyRevenue: number;
  averageStayTime: number;
  occupancyRate: number;
  peakHour: number;
  totalUniqueVehicles: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  vehicleCount: number;
}

export interface OccupancyData {
  hour: number;
  occupancy: number;
  maxCapacity: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface FeedbackForm {
  rating: number;
  comment: string;
  category: 'service' | 'pricing' | 'facilities' | 'app' | 'other';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Search and Filter Types
export interface SearchFilters {
  startDate?: string;
  endDate?: string;
  status?: 'parked' | 'completed' | 'all';
  plate?: string;
  minCost?: number;
  maxCost?: number;
  sortBy?: 'entryTime' | 'exitTime' | 'totalCost' | 'plate';
  sortOrder?: 'asc' | 'desc';
}

// UI Component Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Configuration Types
export interface AppConfig {
  apiBaseUrl: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    loyaltySystem: boolean;
    analytics: boolean;
    notifications: boolean;
    multipleLocations: boolean;
  };
}

// Export default interface for common use
export interface CommonProps {
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export type Theme = 'light' | 'dark' | 'system';

export type UserRole = 'user' | 'admin' | 'superadmin';

export type ParkingStatus = 'parked' | 'completed';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type SortOrder = 'asc' | 'desc';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export type AnalyticsType = 'revenue' | 'occupancy' | 'vehicles' | 'loyalty' | 'full';