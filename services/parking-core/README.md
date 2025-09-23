# 🚗 Parking Core Service - ParkEase

**Microservicio principal del sistema de estacionamiento** que maneja el ciclo de vida completo de los vehículos: desde la entrada hasta la salida, con gestión de ocupación en tiempo real.

## 🎯 **Responsabilidades**

- ✅ **Registro de Entrada**: Registrar vehículos al ingresar al estacionamiento
- ✅ **Registro de Salida**: Procesar salida y calcular duración de estancia  
- ✅ **Gestión de Ocupación**: Monitoreo en tiempo real de espacios disponibles
- ✅ **Validación de Vehículos**: Prevenir registros duplicados y validar placas
- ✅ **Multi-sucursal**: Soporte para múltiples ubicaciones de estacionamiento

## 🏗️ **Arquitectura**

```
📦 Parking Core Service
├── 🚪 API Gateway (Puerto 3003)
├── 🧠 Business Logic
│   ├── Vehicle Entry/Exit Management
│   ├── Occupancy Calculation
│   └── Plate Validation
├── 🔥 Firebase Firestore
│   ├── parkingRecords/
│   ├── branches/
│   └── users/{userId}/parkingRecords/
└── 📊 Real-time Analytics
```

## 🚀 **API Endpoints**

### **🚗 Gestión de Vehículos**

#### **1. Registrar Entrada de Vehículo**
```http
POST /parking/entry
Content-Type: application/json

{
  "plate": "ABC123",
  "userId": "user_123",
  "branchId": "branch-001",
  "spotNumber": "A-15",
  "vehicleType": "car"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Vehículo ABC123 registrado exitosamente",
  "data": {
    "record": {
      "id": "record_uuid",
      "plate": "ABC123", 
      "entryTime": "2025-09-22T14:30:00Z",
      "status": "active",
      "userId": "user_123",
      "branchId": "branch-001",
      "spotNumber": "A-15",
      "vehicleType": "car"
    },
    "occupancy": {
      "branchId": "branch-001",
      "occupiedSpots": 25,
      "availableSpots": 75,
      "occupancyRate": 25.0
    }
  },
  "timestamp": "2025-09-22T14:30:00Z"
}
```

#### **2. Registrar Salida de Vehículo**
```http
PUT /parking/exit/{recordId}
Content-Type: application/json

{
  "userId": "user_123",
  "exitTime": "2025-09-22T16:45:00Z"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Salida registrada para vehículo ABC123",
  "data": {
    "record": {
      "id": "record_uuid",
      "plate": "ABC123",
      "entryTime": "2025-09-22T14:30:00Z",
      "exitTime": "2025-09-22T16:45:00Z",
      "status": "completed"
    },
    "duration": {
      "hours": 2,
      "minutes": 15,
      "totalMinutes": 135,
      "formatted": "2h 15m"
    },
    "occupancy": {
      "branchId": "branch-001",
      "occupiedSpots": 24,
      "availableSpots": 76,
      "occupancyRate": 24.0
    }
  }
}
```

### **📊 Monitoreo y Estado**

#### **3. Obtener Ocupación de Sucursales**
```http
GET /parking/occupancy
```

#### **4. Ocupación de Sucursal Específica**
```http
GET /parking/occupancy/{branchId}
```

#### **5. Verificar Estado de Vehículo**
```http
GET /parking/status/{plate}
```

#### **6. Obtener Detalles de Registro**
```http
GET /parking/record/{recordId}
```

#### **7. Health Check**
```http
GET /health
```

## 📋 **Características Avanzadas**

### **🔒 Validaciones**
- ✅ **Placas Colombianas**: Formato ABC123 / ABC12D
- ✅ **Anti-duplicados**: Previene registros múltiples del mismo vehículo
- ✅ **Sanitización**: Limpia y normaliza datos de entrada
- ✅ **Tipos de vehículo**: car, motorcycle, truck, bicycle

### **⚡ Optimizaciones**
- ✅ **Alto Rendimiento**: Diseñado para manejar múltiples entradas simultáneas
- ✅ **Tiempo Real**: Actualizaciones instantáneas de ocupación
- ✅ **Escalabilidad**: Preparado para crecer horizontalmente
- ✅ **Logging**: Trazabilidad completa de operaciones

### **🌐 Multi-tenancy**
- ✅ **Multi-sucursal**: Soporte nativo para múltiples ubicaciones
- ✅ **Aislamiento**: Datos separados por sucursal
- ✅ **Agregación**: Estadísticas consolidadas

## 🛠️ **Instalación y Configuración**

### **1. Instalación**
```bash
cd services/parking-core
npm install
```

### **2. Configuración**
```bash
# Copiar variables de entorno
cp .env.example .env

# Editar con tus credenciales de Firebase
nano .env
```

### **3. Desarrollo**
```bash
# Ejecutar en modo desarrollo
npm run dev

# Compilar
npm run build

# Ejecutar producción
npm start
```

### **4. Docker**
```bash
# Construir imagen
docker build -t parkease-parking-core .

# Ejecutar contenedor
docker run -p 3003:3003 \
  --env-file .env \
  parkease-parking-core
```

## 🗄️ **Estructura de Datos**

### **ParkingRecord**
```typescript
{
  id: string;                    // UUID único
  plate: string;                 // Placa normalizada (ABC123)
  entryTime: Date;              // Tiempo de entrada
  exitTime?: Date;              // Tiempo de salida (opcional)
  status: 'active' | 'completed' | 'cancelled';
  userId: string;               // ID del usuario
  branchId: string;            // ID de la sucursal
  spotNumber?: string;         // Número de espacio (A-15)
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'bicycle';
  createdAt: Date;
  updatedAt: Date;
}
```

### **BranchOccupancy**
```typescript
{
  branchId: string;
  branchName: string;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  occupancyRate: number;        // Porcentaje 0-100
  activeRecords: ParkingRecord[];
  lastUpdated: Date;
}
```

## 🔥 **Integración con Firebase**

### **Colecciones**
```
firestore/
├── parkingRecords/           # Registros principales
│   └── {recordId}/
├── branches/                 # Configuración de sucursales
│   └── {branchId}/
└── users/                    # Registros por usuario
    └── {userId}/
        └── parkingRecords/
            └── {recordId}/
```

### **Índices Requeridos**
```javascript
// Consultas optimizadas
parkingRecords: [
  { fields: ['branchId', 'status', 'entryTime'] },
  { fields: ['plate', 'status'] },
  { fields: ['userId', 'status', 'entryTime'] }
]
```

## 📈 **Monitoreo y Métricas**

### **Health Check**
```http
GET /health
# Response: 200 OK + uptime, version, status
```

### **Métricas Clave**
- 🚗 **Total de vehículos activos**
- ⏱️ **Tiempo promedio de estancia**
- 📊 **Tasa de ocupación por sucursal**
- 🔥 **Hora pico de actividad**

## 🔧 **Scripts NPM**

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

## 🚀 **Despliegue**

### **Local**
```bash
npm run dev
# Servidor corriendo en http://localhost:3003
```

### **Docker**
```bash
docker-compose up parking-core
```

### **Kubernetes**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: parking-core
spec:
  replicas: 3
  selector:
    matchLabels:
      app: parking-core
  template:
    spec:
      containers:
      - name: parking-core
        image: parkease/parking-core:latest
        ports:
        - containerPort: 3003
```

## 🧪 **Testing**

```bash
# Ejecutar pruebas
npm test

# Pruebas con coverage
npm run test:coverage

# Pruebas de integración
npm run test:integration
```

## 📝 **Ejemplo de Uso**

```javascript
// 1. Registrar entrada
const entryResponse = await fetch('http://localhost:3003/parking/entry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plate: 'ABC123',
    userId: 'user_123',
    branchId: 'branch-001',
    vehicleType: 'car'
  })
});

// 2. Verificar estado
const statusResponse = await fetch('http://localhost:3003/parking/status/ABC123');

// 3. Registrar salida
const exitResponse = await fetch(`http://localhost:3003/parking/exit/${recordId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_123'
  })
});
```

## 🤝 **Integración con Otros Microservicios**

- **🔐 Auth Service**: Validación de usuarios
- **💳 Payment Service**: Procesamiento de pagos al salir
- **📊 Analytics Service**: Datos para reportes y estadísticas
- **📱 Notification Service**: Alertas de ocupación

---

## 📞 **Soporte**

Este microservicio está diseñado para ser **robusto**, **escalable** y **fácil de mantener**. Para consultas técnicas o reportar problemas, revisa los logs del servicio o consulta la documentación de la API en `/info`.