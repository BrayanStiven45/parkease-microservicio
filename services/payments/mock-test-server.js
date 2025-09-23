// Simple HTTP test to verify payment service endpoints
const express = require('express');
const cors = require('cors');

// Mock versions of Firebase functions for testing
const mockFirebase = {
  processPaymentTransaction: () => Promise.resolve('MOCK-TRANSACTION-123'),
  getParkingRecordForPayment: () => Promise.resolve({ 
    id: 'record-123', 
    plate: 'ABC123',
    entryTime: new Date('2024-01-01T10:00:00Z')
  })
};

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

// Mock calculate endpoint (points removed)
app.post('/calculate', (req, res) => {
  const { plate, entryTime, hourlyCost, paymentInitiatedAt } = req.body;
  
  if (!plate || !entryTime || !hourlyCost || !paymentInitiatedAt) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  // Simple calculation without points
  const hoursParked = 2.5;
  const totalAmount = hoursParked * hourlyCost;
  
  res.json({
    hoursParked,
    totalAmount
  });
});

// Mock process payment endpoint (points removed)
app.post('/process', async (req, res) => {
  const { recordId, userId, plate, paymentMethod } = req.body;
  
  if (!recordId || !userId || !plate || !paymentMethod) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  try {
    const transactionId = await mockFirebase.processPaymentTransaction();
    
    res.json({
      success: true,
      message: `Pago procesado exitosamente para ${plate}`,
      paymentDetails: {
        transactionId,
        plate,
        totalAmount: 125,
        paymentMethod,
        hoursParked: 2.5,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: error.message
    });
  }
});

const PORT = 3999;
app.listen(PORT, () => {
  console.log(`🧪 Mock Payment Service (refactored) running on port ${PORT}`);
  console.log('✅ Points logic removed - service now handles only payments');
  console.log('\nAvailable endpoints:');
  console.log('  POST /calculate - Calculate parking cost (no points)');
  console.log('  POST /process - Process payment transaction (no points)');
  console.log('\n🚀 Refactoring successful!');
});

module.exports = app;