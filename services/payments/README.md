# Microservicio de Pagos - ParkEase

Este microservicio maneja todo lo relacionado con el procesamiento de pagos para el sistema de parqueadero ParkEase.

## Características

- ✅ Cálculo automático de costos basado en duración de estacionamiento
- ✅ Sistema de puntos de lealtad (10 puntos por hora)
- ✅ Canje de puntos por descuentos (1 punto = $40 pesos)
- ✅ Integración con Firebase Firestore
- ✅ Validaciones de negocio
- ✅ Manejo de errores robusto

## API Endpoints

### 1. Calcular Costo de Pago
```
POST /payments/calculate
```

**Body:**
```json
{
  "plate": "ABC123",
  "entryTime": "2025-09-22T10:00:00Z",
  "pointsToRedeem": 10,
  "hourlyCost": 5000,
  "paymentInitiatedAt": "2025-09-22T12:30:00Z"
}
```

**Response:**
```json
{
  "hoursParked": 2.5,
  "initialCost": 12500,
  "pointsDiscount": 400,
  "finalAmount": 12100,
  "pointsEarned": 25
}
```

### 2. Obtener Puntos Disponibles
```
GET /payments/points/:plate
```

**Response:**
```json
{
  "plate": "ABC123",
  "availablePoints": 150
}
```

### 3. Procesar Pago
```
POST /payments/process
```

**Body:**
```json
{
  "recordId": "record123",
  "userId": "user456",
  "plate": "ABC123",
  "entryTime": "2025-09-22T10:00:00Z",
  "pointsToRedeem": 10,
  "hourlyCost": 5000,
  "paymentInitiatedAt": "2025-09-22T12:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pago procesado exitosamente para ABC123",
  "paymentDetails": {
    "plate": "ABC123",
    "totalCost": 12100,
    "pointsEarned": 25,
    "pointsRedeemed": 10,
    "hoursParked": 2.5
  }
}
```

## Estructura del Proyecto

```
src/
├── controllers/
│   └── paymentController.ts     # Lógica de control de pagos
├── routes/
│   └── paymentRoutes.ts         # Definición de rutas
├── services/
│   └── firebasePaymentService.ts # Integración con Firebase
├── types/
│   └── index.ts                 # Definiciones de tipos TypeScript
├── app.ts                       # Configuración de Express
└── index.ts                     # Punto de entrada
```

## Instalación y Ejecución

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (crear archivo .env):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
PORT=3004
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Compilar para producción:
```bash
npm run build
npm start
```

## Sistema de Puntos

- **Ganancia:** 10 puntos por cada hora de estacionamiento
- **Valor:** 1 punto = $40 pesos colombianos
- **Uso:** Los puntos se pueden canjear para obtener descuentos en futuros pagos

## Integración con Frontend

Este microservicio reemplaza la lógica del componente `PaymentModal` del frontend. El frontend ahora debe hacer llamadas HTTP a este servicio en lugar de manejar la lógica localmente.

### Migración del Frontend

1. **Obtener puntos disponibles:**
```typescript
const response = await fetch(`/api/payments/points/${plate}`);
const { availablePoints } = await response.json();
```

2. **Calcular costo:**
```typescript
const response = await fetch('/api/payments/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plate,
    entryTime,
    pointsToRedeem,
    hourlyCost,
    paymentInitiatedAt
  })
});
```

3. **Procesar pago:**
```typescript
const response = await fetch('/api/payments/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});
```