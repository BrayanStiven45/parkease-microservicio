// Analytics Service - Maneja estadísticas y reportes avanzados
import type { DashboardStats, RevenueStats, OccupancyStats, VehicleStats, PeakHoursStats, AnalyticsExportData, ComparativeStats, RealtimeStats } from '../types';
import { authService } from './auth-service';

const API_BASE_URL = 'http://localhost:3001/api';

class AnalyticsService {
  
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard?userId=${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getRevenueStats(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<RevenueStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/revenue?userId=${userId}&period=${period}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  }

  async getOccupancyStats(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<OccupancyStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/occupancy?userId=${userId}&period=${period}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch occupancy stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching occupancy stats:', error);
      throw error;
    }
  }

  async getVehicleStats(userId: string): Promise<VehicleStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/vehicles?userId=${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      throw error;
    }
  }

  async getPeakHoursStats(userId: string): Promise<PeakHoursStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/peak-hours?userId=${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch peak hours stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching peak hours stats:', error);
      throw error;
    }
  }

  async exportAnalyticsData(userId: string, options: {
    startDate: Date;
    endDate: Date;
    format: 'csv' | 'json' | 'pdf';
    includeCharts?: boolean;
  }): Promise<AnalyticsExportData> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/export`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          startDate: options.startDate.toISOString(),
          endDate: options.endDate.toISOString(),
          format: options.format,
          includeCharts: options.includeCharts || false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export analytics data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  async getComparativeStats(userId: string, compareWith: {
    period1: { start: Date; end: Date };
    period2: { start: Date; end: Date };
  }): Promise<ComparativeStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/comparative`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          period1: {
            start: compareWith.period1.start.toISOString(),
            end: compareWith.period1.end.toISOString(),
          },
          period2: {
            start: compareWith.period2.start.toISOString(),
            end: compareWith.period2.end.toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comparative stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching comparative stats:', error);
      throw error;
    }
  }

  async getRealtimeStats(userId: string): Promise<RealtimeStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/realtime?userId=${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch realtime stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
      throw error;
    }
  }

  // Métodos de conveniencia para cálculos locales
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  calculateAverageStayTime(records: Array<{ entryTime: string; exitTime?: string }>): number {
    const completedRecords = records.filter(r => r.exitTime);
    if (completedRecords.length === 0) return 0;

    const totalMinutes = completedRecords.reduce((sum, record) => {
      const entry = new Date(record.entryTime);
      const exit = new Date(record.exitTime!);
      const diffMinutes = (exit.getTime() - entry.getTime()) / (1000 * 60);
      return sum + diffMinutes;
    }, 0);

    return totalMinutes / completedRecords.length;
  }

  formatCurrency(amount: number, currency: 'COP' | 'USD' = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  generateTimeLabels(period: 'daily' | 'weekly' | 'monthly'): string[] {
    const now = new Date();
    const labels: string[] = [];

    switch (period) {
      case 'daily':
        for (let i = 23; i >= 0; i--) {
          const hour = now.getHours() - i;
          labels.push(`${hour < 0 ? 24 + hour : hour}:00`);
        }
        break;
      case 'weekly':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('es-CO', { weekday: 'short' }));
        }
        break;
      case 'monthly':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }));
        }
        break;
    }

    return labels;
  }

  // Método para calcular sugerencias de precios basado en estadísticas
  async calculateRateSuggestion(userId: string): Promise<{
    currentRate: number;
    suggestedRate: number;
    reason: string;
    confidence: number;
  }> {
    try {
      const [occupancyStats, revenueStats, peakHours] = await Promise.all([
        this.getOccupancyStats(userId),
        this.getRevenueStats(userId),
        this.getPeakHoursStats(userId),
      ]);

      const user = authService.getCurrentUser();
      const currentRate = user?.hourlyCost || 3000;

      let suggestedRate = currentRate;
      let reason = '';
      let confidence = 0.5;

      // Lógica de sugerencia basada en ocupación
      if (occupancyStats.averageOccupancy > 0.85) {
        suggestedRate = Math.round(currentRate * 1.15);
        reason = 'High occupancy detected. Consider increasing rates to manage demand.';
        confidence = 0.8;
      } else if (occupancyStats.averageOccupancy < 0.4) {
        suggestedRate = Math.round(currentRate * 0.9);
        reason = 'Low occupancy detected. Consider decreasing rates to attract more customers.';
        confidence = 0.7;
      } else {
        reason = 'Current occupancy levels are optimal. No rate change recommended.';
        confidence = 0.6;
      }

      return {
        currentRate,
        suggestedRate,
        reason,
        confidence,
      };
    } catch (error) {
      console.error('Error calculating rate suggestion:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();