import express from "express";
import { 
  calculatePayment, 
  processPayment 
} from "../controllers/paymentController";

const router = express.Router();

// Ruta para calcular el costo de estacionamiento
router.post("/calculate", calculatePayment);

// Ruta para procesar un pago
router.post("/process", processPayment);

export default router;