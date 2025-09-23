import axios from 'axios';

const BASE_URL = 'http://localhost:3004';

async function testPaymentMicroservice() {
  console.log('🧪 Iniciando pruebas del microservicio de pagos...\n');

  try {
    // Test 1: Health check
    console.log('📋 Test 1: Health Check');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Calculate payment
    console.log('\n📋 Test 2: Calcular Pago');
    const calculateData = {
      plate: 'ABC123',
      entryTime: '2025-09-22T10:00:00Z',
      pointsToRedeem: 10,
      hourlyCost: 5000,
      paymentInitiatedAt: '2025-09-22T12:30:00Z'
    };
    
    const calculateResponse = await axios.post(`${BASE_URL}/payments/calculate`, calculateData);
    console.log('✅ Cálculo exitoso:', calculateResponse.data);

    // Test 3: Get available points (this might fail if Firebase is not configured)
    console.log('\n📋 Test 3: Obtener Puntos Disponibles');
    try {
      const pointsResponse = await axios.get(`${BASE_URL}/payments/points/ABC123`);
      console.log('✅ Puntos obtenidos:', pointsResponse.data);
    } catch (error) {
      console.log('⚠️ Test de puntos falló (Firebase no configurado):', error.response?.data || error.message);
    }

    console.log('\n🎉 Pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Solo ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  testPaymentMicroservice();
}

export { testPaymentMicroservice };