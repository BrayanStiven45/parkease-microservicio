import { Request, Response } from "express";
import {
  createParkingRecord,
  getParkingRecord,
  updateParkingRecordExit,
  getActiveParkingRecordsByBranch,
  checkVehicleAlreadyParked,
  getBranchOccupancy
} from "../services/firebaseParkingService";
import {
  validateVehicleEntry,
  validateVehicleExit,
  calculateParkingDuration,
  formatSuccessResponse,
  formatErrorResponse,
  normalizePlate,
  sanitizeInput
} from "../services/parkingUtils";
import {
  VehicleEntryRequest,
  VehicleExitRequest,
  EntryResponse,
  ExitResponse,
  OccupancyResponse,
  ApiResponse
} from "../types";

/**
 * Registrar entrada de vehículo
 * POST /parking/entry
 */
export async function registerVehicleEntry(req: Request, res: Response) {
  try {
    // Sanitizar entrada
    const sanitizedData = sanitizeInput(req.body);
    const { plate, userId, branchId, spotNumber, vehicleType }: VehicleEntryRequest = sanitizedData;

    // Validar datos de entrada
    const validationErrors = validateVehicleEntry(sanitizedData);
    if (validationErrors.length > 0) {
      return res.status(400).json(formatErrorResponse(
        "Datos de entrada inválidos",
        validationErrors.join(", ")
      ));
    }

    // Normalizar placa
    const normalizedPlate = normalizePlate(plate);

    // Verificar si el vehículo ya está estacionado
    const existingRecord = await checkVehicleAlreadyParked(normalizedPlate);
    if (existingRecord) {
      return res.status(409).json(formatErrorResponse(
        `El vehículo con placa ${normalizedPlate} ya está estacionado`,
        `Registro activo desde ${existingRecord.entryTime}`
      ));
    }

    // Crear nuevo registro de estacionamiento
    const newRecord = await createParkingRecord(
      normalizedPlate,
      userId,
      branchId,
      spotNumber,
      vehicleType
    );

    // Obtener ocupación actualizada
    const occupancy = await getBranchOccupancy(branchId);

    const response: EntryResponse = formatSuccessResponse(
      `Vehículo ${normalizedPlate} registrado exitosamente`,
      {
        record: newRecord,
        occupancy
      }
    ) as EntryResponse;

    res.status(201).json(response);
  } catch (error) {
    console.error("Error registering vehicle entry:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor",
      error instanceof Error ? error.message : "Error desconocido"
    ));
  }
}

/**
 * Registrar salida de vehículo
 * PUT /parking/exit/{recordId}
 */
export async function registerVehicleExit(req: Request, res: Response) {
  try {
    const { recordId } = req.params;
    const sanitizedData = sanitizeInput(req.body);
    const { userId, exitTime }: VehicleExitRequest = sanitizedData;

    // Validar datos de salida
    const validationErrors = validateVehicleExit({ recordId, userId, exitTime });
    if (validationErrors.length > 0) {
      return res.status(400).json(formatErrorResponse(
        "Datos de salida inválidos",
        validationErrors.join(", ")
      ));
    }

    // Obtener registro actual
    const currentRecord = await getParkingRecord(recordId);
    if (!currentRecord) {
      return res.status(404).json(formatErrorResponse(
        "Registro de estacionamiento no encontrado"
      ));
    }

    if (currentRecord.status !== 'active') {
      return res.status(400).json(formatErrorResponse(
        "El vehículo ya ha salido del estacionamiento"
      ));
    }

    // Actualizar registro con salida
    const updatedRecord = await updateParkingRecordExit(
      recordId,
      userId,
      exitTime ? new Date(exitTime) : new Date()
    );

    // Calcular duración
    const duration = calculateParkingDuration(
      updatedRecord.entryTime,
      updatedRecord.exitTime!
    );

    // Obtener ocupación actualizada
    const occupancy = await getBranchOccupancy(currentRecord.branchId);

    const response: ExitResponse = formatSuccessResponse(
      `Salida registrada para vehículo ${updatedRecord.plate}`,
      {
        record: updatedRecord,
        duration,
        occupancy
      }
    ) as ExitResponse;

    res.json(response);
  } catch (error) {
    console.error("Error registering vehicle exit:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor",
      error instanceof Error ? error.message : "Error desconocido"
    ));
  }
}

/**
 * Obtener ocupación de todas las sucursales
 * GET /parking/occupancy
 */
export async function getBranchesOccupancy(req: Request, res: Response) {
  try {
    // Por ahora, usando IDs de sucursales predefinidos
    // En el futuro esto vendría de una base de datos de sucursales
    const branchIds = ['branch-001', 'branch-002', 'branch-003'];
    
    const occupancyPromises = branchIds.map(branchId => 
      getBranchOccupancy(branchId).catch(error => {
        console.error(`Error getting occupancy for branch ${branchId}:`, error);
        return null;
      })
    );

    const occupancyResults = await Promise.all(occupancyPromises);
    const validOccupancies = occupancyResults.filter(result => result !== null);

    const response: OccupancyResponse = formatSuccessResponse(
      "Ocupación obtenida exitosamente",
      validOccupancies
    ) as OccupancyResponse;

    res.json(response);
  } catch (error) {
    console.error("Error getting branches occupancy:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor",
      error instanceof Error ? error.message : "Error desconocido"
    ));
  }
}

/**
 * Obtener ocupación de una sucursal específica
 * GET /parking/occupancy/{branchId}
 */
export async function getSingleBranchOccupancy(req: Request, res: Response) {
  try {
    const { branchId } = req.params;

    if (!branchId) {
      return res.status(400).json(formatErrorResponse(
        "ID de sucursal requerido"
      ));
    }

    const occupancy = await getBranchOccupancy(branchId);

    const response: ApiResponse = formatSuccessResponse(
      `Ocupación de sucursal ${branchId} obtenida exitosamente`,
      occupancy
    );

    res.json(response);
  } catch (error) {
    console.error("Error getting branch occupancy:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor",
      error instanceof Error ? error.message : "Error desconocido"
    ));
  }
}

/**
 * Obtener registro específico
 * GET /parking/record/{recordId}
 */
export async function getParkingRecordDetails(req: Request, res: Response) {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json(formatErrorResponse(
        "ID de registro requerido"
      ));
    }

    const record = await getParkingRecord(recordId);
    
    if (!record) {
      return res.status(404).json(formatErrorResponse(
        "Registro de estacionamiento no encontrado"
      ));
    }

    const response: ApiResponse = formatSuccessResponse(
      "Registro obtenido exitosamente",
      record
    );

    res.json(response);
  } catch (error) {
    console.error("Error getting parking record:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor",
      error instanceof Error ? error.message : "Error desconocido"
    ));
  }
}

/**
 * Verificar si un vehículo está estacionado
 * GET /parking/status/{plate}
 */
export async function checkVehicleStatus(req: Request, res: Response) {
  try {
    const { plate } = req.params;

    if (!plate) {
      return res.status(400).json(formatErrorResponse(
        "Placa de vehículo requerida"
      ));
    }

    const normalizedPlate = normalizePlate(plate);
    const activeRecord = await checkVehicleAlreadyParked(normalizedPlate);

    if (activeRecord) {
      const response: ApiResponse = formatSuccessResponse(
        `Vehículo ${normalizedPlate} está actualmente estacionado`,
        {
          isParked: true,
          record: activeRecord
        }
      );
      res.json(response);
    } else {
      const response: ApiResponse = formatSuccessResponse(
        `Vehículo ${normalizedPlate} no está estacionado`,
        {
          isParked: false,
          record: null
        }
      );
      res.json(response);
    }
  } catch (error) {
    console.error("Error checking vehicle status:", error);
    res.status(500).json(formatErrorResponse(
      "Error interno del servidor",
      error instanceof Error ? error.message : "Error desconocido"
    ));
  }
}