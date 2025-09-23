export interface ParkingRecord {
  id: string;
  plate: string;
  entryTime: Date | string;
  exitTime?: Date | string;
  status: 'active' | 'completed' | 'cancelled';
  userId: string;
  branchId: string;
  spotNumber?: string;
  vehicleType?: 'car' | 'motorcycle' | 'truck' | 'bicycle';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VehicleEntryRequest {
  plate: string;
  userId: string;
  branchId: string;
  spotNumber?: string;
  vehicleType?: 'car' | 'motorcycle' | 'truck' | 'bicycle';
}

export interface VehicleExitRequest {
  recordId: string;
  userId: string;
  exitTime?: Date | string;
}

export interface BranchOccupancy {
  branchId: string;
  branchName: string;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  occupancyRate: number; // Percentage
  activeRecords: ParkingRecord[];
  lastUpdated: Date | string;
}

export interface ParkingStats {
  totalVehicles: number;
  activeVehicles: number;
  completedToday: number;
  averageStayTime: number; // in minutes
  peakHour: string;
  mostUsedSpots: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date | string;
}

export interface EntryResponse extends ApiResponse {
  data: {
    record: ParkingRecord;
    occupancy: BranchOccupancy;
  };
}

export interface ExitResponse extends ApiResponse {
  data: {
    record: ParkingRecord;
    duration: {
      hours: number;
      minutes: number;
      totalMinutes: number;
    };
    occupancy: BranchOccupancy;
  };
}

export interface OccupancyResponse extends ApiResponse {
  data: BranchOccupancy[];
}