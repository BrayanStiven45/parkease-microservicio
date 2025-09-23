import app from "./app";

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`🚀 Parking Core Service ejecutándose en el puerto ${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   POST   /parking/entry           - Registrar entrada de vehículo`);
  console.log(`   PUT    /parking/exit/:recordId  - Registrar salida de vehículo`);
  console.log(`   GET    /parking/occupancy       - Obtener ocupación de sucursales`);
  console.log(`   GET    /parking/status/:plate   - Verificar estado de vehículo`);
  console.log(`   GET    /health                  - Estado del servicio`);
  console.log(`   GET    /info                    - Información del servicio`);
  console.log(`🌐 Documentación: http://localhost:${PORT}/info`);
});