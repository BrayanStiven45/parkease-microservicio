#!/usr/bin/env node

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Mock database
let parkingRecords = [];
let branches = {
  'branch-001': { name: 'Sucursal Centro', totalSpots: 50 },
  'branch-002': { name: 'Sucursal Norte', totalSpots: 75 },
  'branch-003': { name: 'Sucursal Sur', totalSpots: 100 }
};

// Test endpoints
app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Parking Core Service Test funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    activeRecords: parkingRecords.filter(r => r.status === 'active').length,
    totalRecords: parkingRecords.length
  });
});

// Mock entry endpoint
app.post('/test/entry', (req, res) => {
  const { plate, userId, branchId, spotNumber, vehicleType = 'car' } = req.body;
  
  // Validaciones básicas
  if (!plate || !userId || !branchId) {
    return res.status(400).json({
      success: false,
      error: 'Faltan campos requeridos: plate, userId, branchId'
    });
  }

  // Verificar si ya está estacionado
  const existing = parkingRecords.find(r => r.plate === plate.toUpperCase() && r.status === 'active');
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `Vehículo ${plate} ya está estacionado`,
      existingRecord: existing
    });
  }

  // Crear nuevo registro
  const record = {
    id: uuidv4(),
    plate: plate.toUpperCase(),
    entryTime: new Date(),
    status: 'active',
    userId,
    branchId,
    spotNumber,
    vehicleType,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  parkingRecords.push(record);

  // Calcular ocupación
  const activeInBranch = parkingRecords.filter(r => r.branchId === branchId && r.status === 'active');
  const branch = branches[branchId];
  const occupancy = {
    branchId,
    branchName: branch?.name || `Sucursal ${branchId}`,
    totalSpots: branch?.totalSpots || 50,
    occupiedSpots: activeInBranch.length,
    availableSpots: (branch?.totalSpots || 50) - activeInBranch.length,
    occupancyRate: ((activeInBranch.length / (branch?.totalSpots || 50)) * 100).toFixed(2)
  };

  res.status(201).json({
    success: true,
    message: `Vehículo ${plate} registrado exitosamente`,
    data: { record, occupancy },
    timestamp: new Date()
  });
});

// Mock exit endpoint
app.put('/test/exit/:recordId', (req, res) => {
  const { recordId } = req.params;
  const { userId } = req.body;

  const recordIndex = parkingRecords.findIndex(r => r.id === recordId);
  if (recordIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Registro no encontrado'
    });
  }

  const record = parkingRecords[recordIndex];
  if (record.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: 'El vehículo ya ha salido'
    });
  }

  // Actualizar registro
  const exitTime = new Date();
  record.exitTime = exitTime;
  record.status = 'completed';
  record.updatedAt = exitTime;

  // Calcular duración
  const entryTime = new Date(record.entryTime);
  const totalMinutes = Math.floor((exitTime - entryTime) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const duration = {
    hours,
    minutes,
    totalMinutes,
    formatted: `${hours}h ${minutes}m`
  };

  // Calcular ocupación actualizada
  const activeInBranch = parkingRecords.filter(r => r.branchId === record.branchId && r.status === 'active');
  const branch = branches[record.branchId];
  const occupancy = {
    branchId: record.branchId,
    branchName: branch?.name || `Sucursal ${record.branchId}`,
    totalSpots: branch?.totalSpots || 50,
    occupiedSpots: activeInBranch.length,
    availableSpots: (branch?.totalSpots || 50) - activeInBranch.length,
    occupancyRate: ((activeInBranch.length / (branch?.totalSpots || 50)) * 100).toFixed(2)
  };

  res.json({
    success: true,
    message: `Salida registrada para vehículo ${record.plate}`,
    data: { record, duration, occupancy },
    timestamp: new Date()
  });
});

// Mock status endpoint
app.get('/test/status/:plate', (req, res) => {
  const { plate } = req.params;
  const normalizedPlate = plate.toUpperCase();
  
  const activeRecord = parkingRecords.find(r => r.plate === normalizedPlate && r.status === 'active');
  
  res.json({
    success: true,
    message: activeRecord 
      ? `Vehículo ${normalizedPlate} está estacionado`
      : `Vehículo ${normalizedPlate} no está estacionado`,
    data: {
      isParked: !!activeRecord,
      record: activeRecord || null
    },
    timestamp: new Date()
  });
});

// Mock occupancy endpoint
app.get('/test/occupancy', (req, res) => {
  const occupancyData = Object.keys(branches).map(branchId => {
    const activeInBranch = parkingRecords.filter(r => r.branchId === branchId && r.status === 'active');
    const branch = branches[branchId];
    
    return {
      branchId,
      branchName: branch.name,
      totalSpots: branch.totalSpots,
      occupiedSpots: activeInBranch.length,
      availableSpots: branch.totalSpots - activeInBranch.length,
      occupancyRate: ((activeInBranch.length / branch.totalSpots) * 100).toFixed(2),
      activeRecords: activeInBranch
    };
  });

  res.json({
    success: true,
    message: 'Ocupación obtenida exitosamente',
    data: occupancyData,
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`🧪 Parking Core Test Server ejecutándose en http://localhost:${PORT}`);
  console.log(`📋 Endpoints de prueba disponibles:`);
  console.log(`   GET  /test                     - Estado del servidor`);
  console.log(`   POST /test/entry               - Registrar entrada (mock)`);
  console.log(`   PUT  /test/exit/:recordId      - Registrar salida (mock)`);
  console.log(`   GET  /test/status/:plate       - Verificar estado de vehículo`);
  console.log(`   GET  /test/occupancy           - Obtener ocupación de sucursales`);
  console.log(`\n🔧 Ejemplo de uso:`);
  console.log(`   curl -X POST http://localhost:${PORT}/test/entry \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"plate":"ABC123","userId":"user1","branchId":"branch-001"}'`);
});

module.exports = app;