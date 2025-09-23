import { differenceInMinutes, differenceInHours, format } from "date-fns";
import { ParkingRecord, ApiResponse } from "../types";

/**
 * Validar datos de entrada de vehículo
 */
export function validateVehicleEntry(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.plate || typeof data.plate !== 'string') {
    errors.push("La placa es requerida y debe ser una cadena válida");
  } else if (!/^[A-Z0-9]{3,8}$/.test(data.plate.toUpperCase())) {
    errors.push("La placa debe tener entre 3 y 8 caracteres alfanuméricos");
  }
  
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push("El ID de usuario es requerido");
  }
  
  if (!data.branchId || typeof data.branchId !== 'string') {
    errors.push("El ID de sucursal es requerido");
  }
  
  if (data.vehicleType && !['car', 'motorcycle', 'truck', 'bicycle'].includes(data.vehicleType)) {
    errors.push("Tipo de vehículo inválido. Debe ser: car, motorcycle, truck, o bicycle");
  }
  
  return errors;
}

/**
 * Validar datos de salida de vehículo
 */
export function validateVehicleExit(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.recordId || typeof data.recordId !== 'string') {
    errors.push("El ID del registro es requerido");
  }
  
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push("El ID de usuario es requerido");
  }
  
  if (data.exitTime) {
    const exitTime = new Date(data.exitTime);
    if (isNaN(exitTime.getTime())) {
      errors.push("Hora de salida inválida");
    }
  }
  
  return errors;
}

/**
 * Calcular duración de estacionamiento
 */
export function calculateParkingDuration(entryTime: Date | string, exitTime: Date | string) {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  
  const totalMinutes = differenceInMinutes(exit, entry);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    hours,
    minutes,
    totalMinutes,
    formatted: `${hours}h ${minutes}m`
  };
}

/**
 * Formatear respuesta exitosa estándar
 */
export function formatSuccessResponse<T>(
  message: string, 
  data?: T
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date()
  };
}

/**
 * Formatear respuesta de error estándar
 */
export function formatErrorResponse(
  message: string, 
  error?: string
): ApiResponse {
  return {
    success: false,
    message,
    error,
    timestamp: new Date()
  };
}

/**
 * Normalizar placa de vehículo
 */
export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Generar ID único para spot
 */
export function generateSpotId(branchId: string, spotNumber: string): string {
  return `${branchId}-${spotNumber}`;
}

/**
 * Validar disponibilidad de horario
 */
export function isBusinessHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Horario de 6 AM a 11 PM
  return hour >= 6 && hour < 23;
}

/**
 * Calcular tarifa por hora según tipo de vehículo
 */
export function getHourlyRate(vehicleType: string): number {
  const rates = {
    car: 5000,
    motorcycle: 2500,
    truck: 8000,
    bicycle: 1000
  };
  
  return rates[vehicleType as keyof typeof rates] || rates.car;
}

/**
 * Verificar si una placa es válida según formato colombiano
 */
export function isValidColombianPlate(plate: string): boolean {
  const normalizedPlate = normalizePlate(plate);
  
  // Formato colombiano: ABC123 o ABC12D
  const carPattern = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
  // Formato moto: ABC12D
  const motorcyclePattern = /^[A-Z]{3}[0-9]{2}[A-Z]$/;
  
  return carPattern.test(normalizedPlate) || motorcyclePattern.test(normalizedPlate);
}

/**
 * Obtener estadísticas de tiempo promedio
 */
export function calculateAverageStayTime(records: ParkingRecord[]): number {
  if (records.length === 0) return 0;
  
  const completedRecords = records.filter(record => 
    record.status === 'completed' && record.exitTime
  );
  
  if (completedRecords.length === 0) return 0;
  
  const totalMinutes = completedRecords.reduce((sum, record) => {
    const duration = calculateParkingDuration(record.entryTime, record.exitTime!);
    return sum + duration.totalMinutes;
  }, 0);
  
  return Math.round(totalMinutes / completedRecords.length);
}

/**
 * Determinar la hora pico del día
 */
export function findPeakHour(records: ParkingRecord[]): string {
  const hourCounts: { [hour: string]: number } = {};
  
  records.forEach(record => {
    const hour = format(new Date(record.entryTime), 'HH');
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  let peakHour = '12';
  let maxCount = 0;
  
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = hour;
    }
  });
  
  return `${peakHour}:00`;
}

/**
 * Sanitizar datos de entrada
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    Object.keys(input).forEach(key => {
      sanitized[key] = sanitizeInput(input[key]);
    });
    return sanitized;
  }
  
  return input;
}