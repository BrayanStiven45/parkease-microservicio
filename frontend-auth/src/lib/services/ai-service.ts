// AI Service - Maneja las recomendaciones de IA para tarifas de estacionamiento
import { authService } from './auth-service';

const API_BASE_URL = 'http://localhost:3001/api';

export interface SuggestParkingRateInput {
  entryTime: string;
  durationHours: number;
  historicalData: string;
}

export interface SuggestParkingRateOutput {
  suggestedRate: number;
  reasoning: string;
}

class AIService {
  
  async suggestParkingRate(input: SuggestParkingRateInput): Promise<SuggestParkingRateOutput> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/suggest-parking-rate`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to get AI rate suggestion');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AI rate suggestion:', error);
      
      // Fallback a una sugerencia básica si el servicio de IA falla
      const baseRate = 2.50;
      const timeOfDay = new Date(input.entryTime).getHours();
      const isWeekend = [0, 6].includes(new Date(input.entryTime).getDay());
      
      let multiplier = 1;
      
      // Tarifa más alta en horas pico
      if ((timeOfDay >= 7 && timeOfDay <= 9) || (timeOfDay >= 17 && timeOfDay <= 19)) {
        multiplier = 1.3;
      }
      // Tarifa más alta los fines de semana
      if (isWeekend) {
        multiplier *= 1.2;
      }
      // Descuento para estacionamientos largos
      if (input.durationHours > 8) {
        multiplier *= 0.8;
      }
      
      const suggestedRate = baseRate * multiplier;
      
      return {
        suggestedRate: Math.round(suggestedRate * 100) / 100,
        reasoning: `AI service unavailable. Using fallback calculation: Base rate $${baseRate} ${
          timeOfDay >= 7 && timeOfDay <= 9 || timeOfDay >= 17 && timeOfDay <= 19 ? '+ peak hours surcharge' : ''
        }${isWeekend ? ' + weekend surcharge' : ''}${
          input.durationHours > 8 ? ' - long duration discount' : ''
        }. Consider factors like demand, location, and events for optimal pricing.`
      };
    }
  }

  async getAnalytics(): Promise<{
    totalRevenue: number;
    averageSessionDuration: number;
    peakHours: string;
    recommendedActions: string[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analytics`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      
      // Fallback analytics
      return {
        totalRevenue: 0,
        averageSessionDuration: 0,
        peakHours: '8-10 AM, 5-7 PM',
        recommendedActions: [
          'Consider dynamic pricing during peak hours',
          'Implement loyalty programs for frequent customers',
          'Optimize space utilization during off-peak hours'
        ]
      };
    }
  }

  async predictDemand(date: string, timeSlot: string): Promise<{
    predictedOccupancy: number;
    confidenceLevel: number;
    factors: string[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/predict-demand`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ date, timeSlot }),
      });

      if (!response.ok) {
        throw new Error('Failed to predict demand');
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting demand:', error);
      
      // Fallback prediction
      const dayOfWeek = new Date(date).getDay();
      const hour = parseInt(timeSlot.split(':')[0]);
      
      let baseOccupancy = 0.4; // 40% base
      
      // Adjustments based on time
      if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19) {
        baseOccupancy = 0.8; // 80% during peak hours
      } else if (hour >= 10 && hour <= 16) {
        baseOccupancy = 0.6; // 60% during business hours
      }
      
      // Weekend adjustments
      if ([0, 6].includes(dayOfWeek)) {
        baseOccupancy *= 0.7; // Generally lower on weekends
      }
      
      return {
        predictedOccupancy: Math.min(baseOccupancy, 1),
        confidenceLevel: 0.6,
        factors: [
          'Historical patterns',
          'Day of week',
          'Time of day',
          'Seasonal trends'
        ]
      };
    }
  }
}

export const aiService = new AIService();