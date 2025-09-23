import { authService } from './auth-service-complete';

const API_BASE_URL = 'http://localhost:3001'; // API Gateway URL

export interface DashboardStats {
  totalVehiclesToday: number;
  totalRevenueToday: number;
  currentOccupancy: number;
  averageStayTime: number;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    plate: string;
    timestamp: string;
  }>;
}

export interface RevenueStats {
  daily: Array<{
    date: string;
    revenue: number;
    vehicleCount: number;
  }>;
  weekly: Array<{
    week: string;
    revenue: number;
    vehicleCount: number;
  }>;
  monthly: Array<{
    month: string;
    revenue: number;
    vehicleCount: number;
  }>;
  totalRevenue: number;
  averageDaily: number;
  bestDay: {
    date: string;
    revenue: number;
  };
}

export interface OccupancyStats {
  hourly: Array<{
    hour: number;
    occupancy: number;
    maxCapacity: number;
  }>;
  daily: Array<{
    date: string;
    averageOccupancy: number;
    peakOccupancy: number;
  }>;
  currentOccupancy: number;
  maxCapacity: number;
  occupancyRate: number;
}

export interface VehicleStats {
  frequentPlates: Array<{
    plate: string;
    visitCount: number;
    totalRevenue: number;
    lastVisit: string;
  }>;
  averageStayTime: number;
  longestStay: {
    plate: string;
    duration: number;
    date: string;
  };
  shortestStay: {
    plate: string;
    duration: number;
    date: string;
  };
  totalUniqueVehicles: number;
}

export interface DateRangeRequest {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

class AnalyticsService {
  // Get dashboard overview statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get dashboard statistics');
    }

    return response.json();
  }

  // Get revenue statistics
  async getRevenueStats(dateRange?: DateRangeRequest): Promise<RevenueStats> {
    let url = `${API_BASE_URL}/api/analytics/revenue`;
    
    if (dateRange) {
      url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get revenue statistics');
    }

    return response.json();
  }

  // Get occupancy statistics
  async getOccupancyStats(dateRange?: DateRangeRequest): Promise<OccupancyStats> {
    let url = `${API_BASE_URL}/api/analytics/occupancy`;
    
    if (dateRange) {
      url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get occupancy statistics');
    }

    return response.json();
  }

  // Get vehicle statistics
  async getVehicleStats(dateRange?: DateRangeRequest): Promise<VehicleStats> {
    let url = `${API_BASE_URL}/api/analytics/vehicles`;
    
    if (dateRange) {
      url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get vehicle statistics');
    }

    return response.json();
  }

  // Get peak hours analysis
  async getPeakHoursAnalysis(dateRange?: DateRangeRequest): Promise<{
    hourly: Array<{
      hour: number;
      averageOccupancy: number;
      totalVehicles: number;
    }>;
    peakHour: number;
    slowestHour: number;
  }> {
    let url = `${API_BASE_URL}/api/analytics/peak-hours`;
    
    if (dateRange) {
      url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get peak hours analysis');
    }

    return response.json();
  }

  // Export analytics data
  async exportAnalytics(
    type: 'revenue' | 'occupancy' | 'vehicles' | 'full',
    format: 'csv' | 'excel',
    dateRange?: DateRangeRequest
  ): Promise<Blob> {
    let url = `${API_BASE_URL}/api/analytics/export?type=${type}&format=${format}`;
    
    if (dateRange) {
      url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export analytics data');
    }

    return response.blob();
  }

  // Get comparative statistics (compare with previous period)
  async getComparativeStats(dateRange: DateRangeRequest): Promise<{
    current: {
      revenue: number;
      vehicles: number;
      averageStay: number;
      occupancyRate: number;
    };
    previous: {
      revenue: number;
      vehicles: number;
      averageStay: number;
      occupancyRate: number;
    };
    changes: {
      revenue: number; // percentage change
      vehicles: number;
      averageStay: number;
      occupancyRate: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/api/analytics/comparative`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(dateRange),
    });

    if (!response.ok) {
      throw new Error('Failed to get comparative statistics');
    }

    return response.json();
  }

  // Get real-time statistics (live updates)
  async getRealTimeStats(): Promise<{
    currentOccupancy: number;
    todayRevenue: number;
    todayVehicles: number;
    averageStayToday: number;
    recentEntries: Array<{
      plate: string;
      entryTime: string;
    }>;
    recentExits: Array<{
      plate: string;
      exitTime: string;
      totalCost: number;
    }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/analytics/realtime`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get real-time statistics');
    }

    return response.json();
  }
}

export const analyticsService = new AnalyticsService();