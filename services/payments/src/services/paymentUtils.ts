import { differenceInSeconds } from "date-fns";

/**
 * Calcula los detalles del pago basado en el tiempo de estacionamiento
 */
export function calculateParkingCost(
  entryTime: string | Date,
  paymentInitiatedAt: string | Date,
  hourlyCost: number,
  pointsToRedeem: number = 0
) {
  const secondsParked = differenceInSeconds(
    new Date(paymentInitiatedAt), 
    new Date(entryTime)
  );
  
  const hoursParked = secondsParked / 3600;
  const initialCost = hoursParked * hourlyCost;
  
  // 1 punto = $40 pesos
  const pointsDiscount = pointsToRedeem * 40;
  const finalAmount = Math.max(0, initialCost - pointsDiscount);
  
  // 10 puntos por hora estacionada
  const pointsEarned = Math.floor(hoursParked * 10);

  return {
    hoursParked: parseFloat(hoursParked.toFixed(2)),
    initialCost: parseFloat(initialCost.toFixed(2)),
    pointsDiscount: parseFloat(pointsDiscount.toFixed(2)),
    finalAmount: parseFloat(finalAmount.toFixed(2)),
    pointsEarned
  };
}

/**
 * Valida que todos los campos requeridos estén presentes
 */
export function validatePaymentRequest(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.recordId) errors.push("recordId es requerido");
  if (!data.userId) errors.push("userId es requerido");
  if (!data.plate) errors.push("plate es requerida");
  if (!data.entryTime) errors.push("entryTime es requerido");
  if (typeof data.hourlyCost !== 'number' || data.hourlyCost <= 0) {
    errors.push("hourlyCost debe ser un número positivo");
  }
  if (!data.paymentInitiatedAt) errors.push("paymentInitiatedAt es requerido");
  
  return errors;
}

/**
 * Valida que los puntos a canjear no excedan los puntos disponibles
 */
export function validatePointsRedemption(
  pointsToRedeem: number, 
  availablePoints: number
): boolean {
  return pointsToRedeem <= availablePoints && pointsToRedeem >= 0;
}

/**
 * Formatea la respuesta de error estándar
 */
export function formatErrorResponse(message: string, details?: any) {
  return {
    success: false,
    error: message,
    ...(details && { details })
  };
}

/**
 * Formatea la respuesta de éxito estándar
 */
export function formatSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    ...data
  };
}