# API Gateway Endpoints Documentation

Esta documentación describe todos los endpoints necesarios que debe implementar tu API Gateway para que funcione con la aplicación frontend migrada.

## Base URL
```
http://localhost:3001
```

## Autenticación
Todos los endpoints protegidos requieren un header de autorización:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
Autentica un usuario y devuelve un token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "username": "John Doe",
    "role": "user",
    "parkingLotName": "Downtown Parking",
    "hourlyCost": 3000,
    "maxCapacity": 50,
    "address": "123 Main St",
    "city": "Springfield"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/auth/signup
Registra un nuevo usuario.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "John Doe",
  "role": "user",
  "parkingLotName": "My Parking Lot",
  "maxCapacity": 50,
  "hourlyCost": 3000,
  "address": "123 Main St",
  "city": "Springfield"
}
```

**Response:** Same as login

### POST /api/auth/logout
Invalida el token actual.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/me
Obtiene información del usuario actual.

**Response:**
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "username": "John Doe",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚗 Parking Endpoints

### GET /api/parking/active/{userId}
Obtiene todos los registros de parking activos.

**Response:**
```json
[
  {
    "id": "record123",
    "plate": "ABC-123",
    "entryTime": "2024-01-01T10:00:00.000Z",
    "status": "parked",
    "userId": "user123"
  }
]
```

### POST /api/parking/add/{userId}
Agrega un nuevo registro de parking.

**Request Body:**
```json
{
  "plate": "ABC-123"
}
```

**Response:**
```json
{
  "id": "record123",
  "plate": "ABC-123",
  "entryTime": "2024-01-01T10:00:00.000Z",
  "status": "parked",
  "userId": "user123"
}
```

### POST /api/parking/payment/{userId}
Procesa el pago de un registro de parking.

**Request Body:**
```json
{
  "recordId": "record123",
  "pointsToRedeem": 100
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "cost": 15000
}
```

### GET /api/parking/history/{userId}
Obtiene el historial de parking con paginación.

**Query Parameters:**
- `page`: número de página (default: 1)
- `limit`: registros por página (default: 10)

**Response:**
```json
{
  "records": [...],
  "totalCount": 150,
  "totalPages": 15,
  "currentPage": 1
}
```

### GET /api/parking/stats/{userId}
Obtiene estadísticas de parking.

**Response:**
```json
{
  "totalVehicles": 1500,
  "currentlyParked": 25,
  "todayRevenue": 150000,
  "monthlyRevenue": 4500000,
  "averageStayTime": 120,
  "occupancyRate": 0.75
}
```

### PUT /api/parking/update/{userId}/{recordId}
Actualiza un registro de parking.

### DELETE /api/parking/delete/{userId}/{recordId}
Elimina un registro de parking.

### GET /api/parking/search/{userId}
Busca registros de parking.

**Query Parameters:**
- `q`: término de búsqueda

---

## 🎯 Loyalty Endpoints

### GET /api/loyalty/{plate}
Obtiene los puntos de loyalty de una placa.

**Response:**
```json
{
  "points": 1250
}
```

### GET /api/loyalty/account/{plate}
Obtiene información detallada de la cuenta de loyalty.

**Response:**
```json
{
  "plate": "ABC-123",
  "points": 1250,
  "totalEarned": 5000,
  "totalRedeemed": 3750,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastUpdated": "2024-03-01T00:00:00.000Z"
}
```

### GET /api/loyalty/history/{plate}
Obtiene el historial de transacciones de loyalty.

### POST /api/loyalty/add
Agrega puntos de loyalty.

### POST /api/loyalty/redeem
Redime puntos de loyalty.

### GET /api/loyalty/accounts/{userId}
Obtiene todas las cuentas de loyalty para un usuario.

### GET /api/loyalty/stats/{userId}
Obtiene estadísticas de loyalty.

### GET /api/loyalty/search/{userId}
Busca cuentas de loyalty.

### POST /api/loyalty/create
Crea una nueva cuenta de loyalty.

---

## 👤 User Endpoints

### GET /api/user/profile
Obtiene el perfil del usuario actual.

### PUT /api/user/profile
Actualiza el perfil del usuario.

### PUT /api/user/change-password
Cambia la contraseña del usuario.

### POST /api/user/upload-image
Sube una imagen de perfil.

### DELETE /api/user/delete-account
Elimina la cuenta del usuario.

### GET /api/user/parking-lot
Obtiene información del estacionamiento del usuario.

### PUT /api/user/parking-lot
Actualiza configuración del estacionamiento.

---

## 👨‍💼 Admin Endpoints

### GET /api/admin/users
Obtiene lista de usuarios (solo admin).

### GET /api/admin/stats
Obtiene estadísticas administrativas.

### PUT /api/admin/users/{userId}/toggle-status
Activa/desactiva un usuario.

### DELETE /api/admin/users/{userId}
Elimina un usuario.

### GET /api/admin/users/search
Busca usuarios.

---

## 📊 Analytics Endpoints

### GET /api/analytics/dashboard
Obtiene estadísticas del dashboard.

### GET /api/analytics/revenue
Obtiene estadísticas de ingresos.

### GET /api/analytics/occupancy
Obtiene estadísticas de ocupación.

### GET /api/analytics/vehicles
Obtiene estadísticas de vehículos.

### GET /api/analytics/peak-hours
Obtiene análisis de horas pico.

### GET /api/analytics/export
Exporta datos analíticos.

### POST /api/analytics/comparative
Obtiene estadísticas comparativas.

### GET /api/analytics/realtime
Obtiene estadísticas en tiempo real.

---

## 🚨 Error Responses

Todos los endpoints pueden devolver estos errores estándar:

**400 Bad Request:**
```json
{
  "error": "Invalid request data",
  "details": "Validation errors..."
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

1. Todos los timestamps deben estar en formato ISO 8601
2. Los precios están en centavos (ej: 3000 = $30.00)
3. Las respuestas deben incluir headers CORS apropiados
4. Los tokens JWT deben tener un tiempo de expiración razonable
5. Implementar rate limiting para prevenir abuso
6. Logs detallados para debugging y monitoring
7. Validación de datos en el backend
8. Sanitización de entradas para prevenir inyecciones

## 🔧 Implementation Tips

1. Usar middleware para autenticación
2. Implementar paginación consistente
3. Usar códigos de estado HTTP apropiados
4. Implementar búsqueda con índices de base de datos
5. Cache para estadísticas frecuentemente consultadas
6. Websockets para actualizaciones en tiempo real (opcional)
7. Compresión gzip para respuestas grandes
8. Documentación automática con Swagger/OpenAPI