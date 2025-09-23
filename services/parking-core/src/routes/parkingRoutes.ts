import express from "express";
import {
  registerVehicleEntry,
  registerVehicleExit,
  getBranchesOccupancy,
  getSingleBranchOccupancy,
  getParkingRecordDetails,
  checkVehicleStatus
} from "../controllers/parkingController";

const router = express.Router();

// Rutas principales del microservicio de parking
// POST /parking/entry - Registrar entrada de vehículo
router.post("/entry", registerVehicleEntry);

// PUT /parking/exit/:recordId - Registrar salida de vehículo
router.put("/exit/:recordId", registerVehicleExit);

// GET /parking/occupancy - Obtener ocupación de todas las sucursales
router.get("/occupancy", getBranchesOccupancy);

// GET /parking/occupancy/:branchId - Obtener ocupación de una sucursal específica
router.get("/occupancy/:branchId", getSingleBranchOccupancy);

// GET /parking/record/:recordId - Obtener detalles de un registro específico
router.get("/record/:recordId", getParkingRecordDetails);

// GET /parking/status/:plate - Verificar si un vehículo está estacionado
router.get("/status/:plate", checkVehicleStatus);

export default router;