import { Request, Response } from "express";
import { 
  getPlatePoints, 
  processPaymentTransaction 
} from "../services/firebasePaymentService";
import { 
  calculateParkingCost,
  validatePaymentRequest,
  validatePointsRedemption,
  formatErrorResponse,
  formatSuccessResponse
} from "../services/paymentUtils";
import { 
  PaymentRequest, 
  PaymentCalculation, 
  PaymentResponse,
  AvailablePointsResponse 
} from "../types";

export async function calculatePayment(req: Request, res: Response) {
  try {
    const { 
      plate, 
      entryTime, 
      pointsToRedeem = 0, 
      hourlyCost, 
      paymentInitiatedAt 
    }: {
      plate: string;
      entryTime: string;
      pointsToRedeem?: number;
      hourlyCost: number;
      paymentInitiatedAt: string;
    } = req.body;

    if (!plate || !entryTime || !hourlyCost || !paymentInitiatedAt) {
      return res.status(400).json(formatErrorResponse(
        "Faltan campos requeridos: plate, entryTime, hourlyCost, paymentInitiatedAt"
      ));
    }

    const calculation = calculateParkingCost(
      entryTime,
      paymentInitiatedAt,
      hourlyCost,
      pointsToRedeem
    );

    res.json(calculation);
  } catch (error) {
    console.error("Error calculating payment:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor al calcular el pago"
    ));
  }
}

export async function getAvailablePoints(req: Request, res: Response) {
  try {
    const { plate } = req.params;

    if (!plate) {
      return res.status(400).json(formatErrorResponse(
        "La placa es requerida"
      ));
    }

    const availablePoints = await getPlatePoints(plate);

    const response: AvailablePointsResponse = {
      plate,
      availablePoints
    };

    res.json(formatSuccessResponse(response));
  } catch (error) {
    console.error("Error fetching available points:", error);
    res.status(500).json(formatErrorResponse(
      "Error al obtener los puntos disponibles"
    ));
  }
}

export async function processPayment(req: Request, res: Response) {
  try {
    const paymentData: PaymentRequest & { entryTime: string } = req.body;

    // Validate required fields
    const validationErrors = validatePaymentRequest(paymentData);
    if (validationErrors.length > 0) {
      return res.status(400).json(formatErrorResponse(
        "Datos de entrada inválidos",
        { errors: validationErrors }
      ));
    }

    const {
      recordId,
      userId,
      plate,
      entryTime,
      pointsToRedeem = 0,
      hourlyCost,
      paymentInitiatedAt
    } = paymentData;

    // Get available points for validation
    const availablePoints = await getPlatePoints(plate);
    
    if (!validatePointsRedemption(pointsToRedeem, availablePoints)) {
      return res.status(400).json(formatErrorResponse(
        "No tienes suficientes puntos para canjear"
      ));
    }

    // Calculate payment details
    const costDetails = calculateParkingCost(
      entryTime,
      paymentInitiatedAt,
      hourlyCost,
      pointsToRedeem
    );

    // Process the payment transaction
    await processPaymentTransaction(
      userId,
      recordId,
      plate,
      costDetails.finalAmount,
      costDetails.pointsEarned,
      pointsToRedeem
    );

    const response: PaymentResponse = {
      success: true,
      message: `Pago procesado exitosamente para ${plate}`,
      paymentDetails: {
        plate,
        totalCost: costDetails.finalAmount,
        pointsEarned: costDetails.pointsEarned,
        pointsRedeemed: pointsToRedeem,
        hoursParked: costDetails.hoursParked
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error processing payment:", error);
    
    const errorResponse: PaymentResponse = {
      success: false,
      message: "Error al procesar el pago",
      error: error instanceof Error ? error.message : "Error desconocido"
    };

    res.status(500).json(errorResponse);
  }
}