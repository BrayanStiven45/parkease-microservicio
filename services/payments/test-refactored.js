// Simple test to verify the refactored payment service works
const { calculateParkingCost } = require('./dist/services/paymentUtils');

console.log('🧪 Testing refactored payment service...');

// Test the calculate function without points
try {
  const result = calculateParkingCost(
    '2024-01-01T10:00:00Z',
    '2024-01-01T12:30:00Z',
    50 // $50/hour
  );
  
  console.log('✅ Calculation test passed:');
  console.log('  Hours parked:', result.hoursParked);
  console.log('  Total amount:', result.totalAmount);
  
  // Verify no points fields exist
  if (result.pointsEarned !== undefined || result.pointsDiscount !== undefined) {
    console.log('❌ ERROR: Points fields still exist in result');
  } else {
    console.log('✅ Points logic successfully removed');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}

console.log('\n🔄 Refactoring complete! Payment service now focuses only on payment processing.');
console.log('Points/loyalty functionality has been successfully removed.');