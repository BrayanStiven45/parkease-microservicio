#!/usr/bin/env node

const express = require('express');
const app = express();

app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Microservicio de pagos funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Calculator endpoint (standalone test)
app.post('/test/calculate', (req, res) => {
  const { hoursParked = 2, hourlyCost = 5000, pointsToRedeem = 0 } = req.body;
  
  const initialCost = hoursParked * hourlyCost;
  const pointsDiscount = pointsToRedeem * 40;
  const finalAmount = Math.max(0, initialCost - pointsDiscount);
  const pointsEarned = Math.floor(hoursParked * 10);

  res.json({
    hoursParked,
    initialCost,
    pointsDiscount,
    finalAmount,
    pointsEarned,
    calculation: `${hoursParked} horas × $${hourlyCost} = $${initialCost} - $${pointsDiscount} descuento = $${finalAmount}`
  });
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`🧪 Servidor de pruebas ejecutándose en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET  /test - Estado del servidor`);
  console.log(`   POST /test/calculate - Calculadora de pagos`);
});

module.exports = app;