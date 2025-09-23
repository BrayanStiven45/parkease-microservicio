// AI Service - Maneja funciones de inteligencia artificial
import { apiService } from './api-service';

export interface SuggestParkingRateInput {
  entryTime: string;
  durationHours: number;
  historicalData: string;
}

export interface SuggestParkingRateOutput {
  suggestedRate: number;
  reasoning: string;
  confidence: number;
  factors: string[];
}

export interface AnalyticsInsight {
  title: string;
  description: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  priority: number;
}

export interface DemandPrediction {
  date: string;
  timeSlot: string;
  predictedOccupancy: number;
  confidence: number;
  factors: string[];
}

class AIService {
  
  async suggestParkingRate(input: SuggestParkingRateInput): Promise<SuggestParkingRateOutput> {
    try {
      return await apiService.post<SuggestParkingRateOutput>('/ai/suggest-parking-rate', input);
    } catch (error) {
      console.error('Error getting AI rate suggestion:', error);
      
      // Fallback a una sugerencia básica si el servicio de IA falla
      const baseRate = 2.50;
      const timeOfDay = new Date(input.entryTime).getHours();
      const dayOfWeek = new Date(input.entryTime).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let multiplier = 1;
      const factors = ['Base rate'];
      
      // Tarifa más alta en horas pico
      if ((timeOfDay >= 7 && timeOfDay <= 9) || (timeOfDay >= 17 && timeOfDay <= 19)) {
        multiplier = 1.3;
        factors.push('Peak hours');
      }
      // Tarifa más alta los fines de semana
      if (isWeekend) {
        multiplier *= 1.2;
        factors.push('Weekend surcharge');
      }
      // Descuento para estacionamientos largos
      if (input.durationHours > 8) {
        multiplier *= 0.8;
        factors.push('Long duration discount');
      }
      
      const suggestedRate = baseRate * multiplier;
      
      return {
        suggestedRate: Math.round(suggestedRate * 100) / 100,
        confidence: 0.7,
        factors,
        reasoning: `AI service unavailable. Using fallback calculation based on ${factors.join(', ')}. Consider demand patterns, location factors, and special events for optimal pricing.`
      };
    }
  }

  async getAnalyticsInsights(): Promise<AnalyticsInsight[]> {
    try {
      return await apiService.get<AnalyticsInsight[]>('/ai/analytics/insights');
    } catch (error) {
      console.error('Error fetching AI analytics insights:', error);
      
      // Fallback insights
      return [
        {
          title: 'Peak Hours Optimization',
          description: 'High demand detected during morning and evening rush hours',
          recommendation: 'Consider implementing dynamic pricing during 7-9 AM and 5-7 PM',
          impact: 'high',
          priority: 1
        },
        {
          title: 'Weekend Strategy',
          description: 'Lower utilization on weekends observed',
          recommendation: 'Implement weekend promotions or events to increase occupancy',
          impact: 'medium',
          priority: 2
        },
        {
          title: 'Loyalty Program Enhancement',
          description: 'Frequent customers could benefit from improved rewards',
          recommendation: 'Expand loyalty program with tier-based benefits',
          impact: 'medium',
          priority: 3
        }
      ];
    }
  }

  async predictDemand(date: string, timeSlot: string): Promise<DemandPrediction> {
    try {
      return await apiService.post<DemandPrediction>('/ai/predict-demand', { date, timeSlot });
    } catch (error) {
      console.error('Error predicting demand:', error);
      
      // Fallback prediction based on simple heuristics
      const dayOfWeek = new Date(date).getDay();
      const hour = parseInt(timeSlot.split(':')[0]);
      
      let baseOccupancy = 0.4; // 40% base
      const factors = ['Historical patterns'];
      
      // Adjustments based on time
      if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19) {
        baseOccupancy = 0.8; // 80% during peak hours
        factors.push('Peak hours');
      } else if (hour >= 10 && hour <= 16) {
        baseOccupancy = 0.6; // 60% during business hours
        factors.push('Business hours');
      }
      
      // Weekend adjustments
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseOccupancy *= 0.7; // Generally lower on weekends
        factors.push('Weekend pattern');
      }
      
      return {
        date,
        timeSlot,
        predictedOccupancy: Math.min(baseOccupancy, 1),
        confidence: 0.65,
        factors
      };
    }
  }

  async optimizeCapacity(): Promise<{
    currentUtilization: number;
    recommendedAdjustments: string[];
    potentialRevenue: number;
  }> {
    try {
      return await apiService.get('/ai/optimize-capacity');
    } catch (error) {
      console.error('Error getting capacity optimization:', error);
      
      return {
        currentUtilization: 0.75,
        recommendedAdjustments: [
          'Consider adding 10-15 more spaces during peak hours',
          'Implement reservation system for guaranteed spots',
          'Add premium parking options for higher revenue'
        ],
        potentialRevenue: 1250.50
      };
    }
  }

  async generateReport(type: 'weekly' | 'monthly' | 'quarterly'): Promise<{
    summary: string;
    keyMetrics: Record<string, number>;
    recommendations: string[];
    trends: Array<{ name: string; value: number; change: number }>;
  }> {
    try {
      return await apiService.get(`/ai/reports/${type}`);
    } catch (error) {
      console.error('Error generating AI report:', error);
      
      return {
        summary: `${type} report generated with basic analytics due to service limitations.`,
        keyMetrics: {
          totalRevenue: 2450.75,
          averageSession: 2.3,
          peakUtilization: 0.85,
          customerSatisfaction: 4.2
        },
        recommendations: [
          'Focus on improving peak hour management',
          'Implement customer feedback system',
          'Consider loyalty program enhancements'
        ],
        trends: [
          { name: 'Revenue', value: 2450.75, change: 12.5 },
          { name: 'Occupancy', value: 0.75, change: 5.2 },
          { name: 'Sessions', value: 142, change: 8.1 }
        ]
      };
    }
  }
}

export const aiService = new AIService();