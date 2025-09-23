import express from "express";
import cors from "cors";
import parkingRouter from "./routes/parkingRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Rutas principales
app.use("/parking", parkingRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "parking-core",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de información del servicio
app.get("/info", (req, res) => {
  res.json({
    service: "Parking Core Service",
    description: "Microservicio principal para gestión de entrada y salida de vehículos",
    version: "1.0.0",
    endpoints: {
      "POST /parking/entry": "Registrar entrada de vehículo",
      "PUT /parking/exit/:recordId": "Registrar salida de vehículo",
      "GET /parking/occupancy": "Obtener ocupación de todas las sucursales",
      "GET /parking/occupancy/:branchId": "Obtener ocupación de una sucursal",
      "GET /parking/record/:recordId": "Obtener detalles de un registro",
      "GET /parking/status/:plate": "Verificar estado de un vehículo",
      "GET /health": "Estado del servicio",
      "GET /info": "Información del servicio"
    },
    features: [
      "Registro de entrada y salida de vehículos",
      "Gestión de ocupación en tiempo real",
      "Validación de placas colombianas",
      "Prevención de registros duplicados",
      "Cálculo automático de duración",
      "Soporte para múltiples tipos de vehículos",
      "API RESTful con respuestas estructuradas"
    ]
  });
});

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint no encontrado",
    error: `La ruta ${req.method} ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString()
  });
});

// Manejo global de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

export default app;