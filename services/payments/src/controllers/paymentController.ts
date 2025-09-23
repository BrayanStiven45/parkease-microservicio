import { Request, Response } from "express";
import { 
  processPaymentTransaction,
  getParkingRecordForPayment
} from "../services/firebasePaymentService";
import { 
  calculateParkingCost,
  validatePaymentRequest,
  formatErrorResponse,
  formatSuccessResponse
} from "../services/paymentUtils";
import { 
  PaymentRequest, 
  PaymentCalculation, 
  PaymentResponse
} from "../types";

export async function calculatePayment(req: Request, res: Response) {
  try {
    const { 
      plate, 
      entryTime, 
      hourlyCost, 
      paymentInitiatedAt 
    }: {
      plate: string;
      entryTime: string;
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
      hourlyCost
    );

    res.json(calculation);
  } catch (error) {
    console.error("Error calculating payment:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor al calcular el pago"
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
      hourlyCost,
      paymentInitiatedAt,
      paymentMethod
    } = paymentData;

    // Calculate payment details
    const costDetails = calculateParkingCost(
      entryTime,
      paymentInitiatedAt,
      hourlyCost
    );

    // Process the payment transaction
    const transactionId = await processPaymentTransaction(
      userId,
      recordId,
      plate,
      costDetails.totalAmount,
      paymentMethod
    );

    const response: PaymentResponse = {
      success: true,
      message: `Pago procesado exitosamente para ${plate}`,
      paymentDetails: {
        transactionId,
        plate,
        totalAmount: costDetails.totalAmount,
        paymentMethod,
        hoursParked: costDetails.hoursParked,
        timestamp: new Date()
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