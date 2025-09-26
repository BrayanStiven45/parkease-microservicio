# ParkEase - Sistema de Gestión de Estacionamientos

## 📋 Descripción General

ParkEase es una aplicación de gestión de estacionamientos desarrollada con arquitectura de microservicios. El sistema permite a los administradores de estacionamientos gestionar sus sucursales, controlar el acceso de vehículos, procesar pagos y administrar un sistema de lealtad para los usuarios.

## 🏗️ Arquitectura del Sistema

La aplicación está construida con una arquitectura de microservicios que incluye:

- **Frontend**: Aplicación Next.js con React y TypeScript
- **API Gateway**: Punto de entrada único para todos los microservicios
- **Microservicios**: Servicios especializados para diferentes funcionalidades
- **Base de datos**: Firebase como backend principal

## 📁 Estructura del Proyecto

```
parkease-microservicio/
├── api-gateway/                 # API Gateway (Puerto 3001)
├── frontend_parkease/          # Frontend Next.js (Puerto 3000)
├── services/                    # Microservicios
│   ├── authentication/         # Servicio de autenticación (Puerto 4000)
│   ├── branch/                 # Servicio de sucursales (Puerto 4003)
│   ├── parkingRecords/         # Servicio de registros de estacionamiento (Puerto 4002)
│   ├── signup/                 # Servicio de registro (Puerto 4001)
│   ├── loyalty/                # Servicio de lealtad (En desarrollo)
│   └── payments/               # Servicio de pagos (En desarrollo)
└── api.http                    # Archivo de pruebas de API
```

## 🚀 Módulos de la Aplicación

### 1. Frontend (Next.js)

**Ubicación**: `frontend_parkease/`
**Puerto**: 3000
**Tecnologías**: Next.js 15, React 18, TypeScript, Tailwind CSS, Radix UI

#### Características:
- **Interfaz de usuario moderna** con componentes reutilizables
- **Autenticación integrada** con Firebase
- **Dashboard administrativo** para gestión de sucursales
- **Sistema de historial** de estacionamientos
- **Gestión de perfiles** de usuarios
- **Sugeridor de tarifas** con IA (Genkit)

#### Componentes principales:
- `components/auth/` - Formularios de login y registro
- `components/dashboard/` - Componentes del dashboard
- `components/admin/` - Componentes administrativos
- `contexts/auth-context.tsx` - Contexto de autenticación
- `lib/api.ts` - Cliente API para comunicación con microservicios

### 2. API Gateway

**Ubicación**: `api-gateway/`
**Puerto**: 3001
**Tecnologías**: Express.js, TypeScript, Axios

#### Funcionalidades:
- **Proxy inteligente** para todos los microservicios
- **Rate limiting** (100 requests por 15 minutos)
- **Seguridad** con Helmet y CORS
- **Logging** de todas las peticiones
- **Manejo de errores** centralizado

#### Rutas configuradas:
- `/api/auth/*` → Servicio de autenticación (Puerto 4000)
- `/api/branch/*` → Servicio de sucursales (Puerto 4003)
- `/api/parking-records/*` → Servicio de registros (Puerto 4002)

### 3. Microservicios

#### 3.1 Servicio de Autenticación
**Ubicación**: `services/authentication/`
**Puerto**: 4000
**Tecnologías**: Express.js, Firebase Admin SDK

**Funcionalidades**:
- Login de usuarios
- Verificación de tokens JWT
- Gestión de sesiones
- Integración con Firebase Auth

#### 3.2 Servicio de Sucursales
**Ubicación**: `services/branch/`
**Puerto**: 4003
**Tecnologías**: Express.js, Firebase Admin SDK

**Funcionalidades**:
- Gestión de perfiles de sucursales
- CRUD de sucursales
- Autenticación de administradores
- Configuración de estacionamientos

#### 3.3 Servicio de Registros de Estacionamiento
**Ubicación**: `services/parkingRecords/`
**Puerto**: 4002
**Tecnologías**: Express.js, Firebase

**Funcionalidades**:
- Registro de entrada y salida de vehículos
- Historial de estacionamientos
- Gestión de placas de vehículos
- Cálculo de tarifas

#### 3.4 Servicio de Registro
**Ubicación**: `services/signup/`
**Puerto**: 4001
**Tecnologías**: Express.js, Firebase

**Funcionalidades**:
- Registro de nuevos usuarios
- Validación de datos
- Creación de cuentas en Firebase

#### 3.5 Servicios en Desarrollo
- **Servicio de Lealtad** (`services/loyalty/`): Sistema de puntos y recompensas
- **Servicio de Pagos** (`services/payments/`): Procesamiento de transacciones

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Firebase con proyecto configurado
- Archivos de configuración de Firebase (`serviceAccountKey.json`)

### Paso 1: Clonar el Repositorio
```bash
git clone <repository-url>
cd parkease-microservicio
```

### Paso 2: Instalar Dependencias del API Gateway
```bash
cd api-gateway
npm install
```

### Paso 3: Instalar Dependencias del Frontend
```bash
cd ../frontend_parkease
npm install
```

### Paso 4: Instalar Dependencias de los Microservicios
```bash
# Servicio de Autenticación
cd ../services/authentication
npm install

# Servicio de Sucursales
cd ../branch
npm install

# Servicio de Registros
cd ../parkingRecords
npm install

# Servicio de Registro
cd ../signup
npm install
```

### Paso 5: Configurar Variables de Entorno

#### API Gateway (api-gateway/.env)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
USER_SERVICE_URL=http://localhost:4000
BRANCH_SERVICE_URL=http://localhost:4003
PARKING_SERVICE_URL=http://localhost:4002
```

#### Frontend (frontend_parkease/.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

#### Microservicios
Cada microservicio necesita su archivo `.env` con:
```env
PORT=<puerto_del_servicio>
FIREBASE_PROJECT_ID=your_project_id
```

### Paso 6: Configurar Firebase
1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication con Email/Password
3. Descargar el archivo `serviceAccountKey.json` y colocarlo en cada microservicio
4. Configurar las reglas de Firestore según sea necesario

## 🚀 Ejecución de la Aplicación

### Opción 1: Ejecución Manual (Recomendada para desarrollo)

#### Terminal 1 - API Gateway
```bash
cd api-gateway
npm run dev
```

#### Terminal 2 - Servicio de Autenticación
```bash
cd services/authentication
npm run dev
```

#### Terminal 3 - Servicio de Sucursales
```bash
cd services/branch
npm run dev
```

#### Terminal 4 - Servicio de Registros
```bash
cd services/parkingRecords
npm run dev
```

#### Terminal 5 - Servicio de Registro
```bash
cd services/signup
npm run dev
```

#### Terminal 6 - Frontend
```bash
cd frontend_parkease
npm run dev
```

### Opción 2: Ejecución con Docker (Para producción)

#### Construir y ejecutar el API Gateway
```bash
cd api-gateway
docker build -t parkease-api-gateway .
docker run -p 3001:3001 parkease-api-gateway
```

## 🌐 Acceso a la Aplicación

### URLs de Acceso
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Servicios**:
  - Autenticación: http://localhost:4000
  - Sucursales: http://localhost:4003
  - Registros: http://localhost:4002
  - Registro: http://localhost:4001

### Flujo de Uso
1. **Acceder al frontend** en http://localhost:3000
2. **Registrarse** como nuevo usuario o hacer login
3. **Configurar sucursal** si eres administrador
4. **Gestionar estacionamientos** desde el dashboard
5. **Ver historial** de registros y transacciones

## 🔧 Scripts Disponibles

### API Gateway
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Construir para producción
npm start        # Ejecutar en producción
```

### Frontend
```bash
npm run dev              # Desarrollo con Turbopack
npm run build           # Construir para producción
npm run start           # Ejecutar en producción
npm run lint            # Linter de código
npm run typecheck       # Verificación de tipos
```

### Microservicios
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Construir para producción
npm start        # Ejecutar en producción
```

## 🧪 Pruebas de API

Utiliza el archivo `api.http` para probar los endpoints:

```http
# Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
    "email": "usuario@parkease.com",
    "password": "password123"
}

# Obtener perfil
GET http://localhost:3001/api/branch/profile
Authorization: Bearer <token>

# Historial de estacionamientos
GET http://localhost:3001/api/parking-records/history?branchId=<branchId>
Authorization: Bearer <token>
```

## 📊 Monitoreo y Logs

### Logs del Sistema
- Todos los servicios registran peticiones con timestamp
- El API Gateway incluye rate limiting y manejo de errores
- Firebase proporciona logs de autenticación y base de datos

### Health Checks
- API Gateway: http://localhost:3001/health
- Cada microservicio incluye logging de estado

## 🔒 Seguridad

### Medidas Implementadas
- **Rate Limiting**: 100 requests por 15 minutos por IP
- **CORS**: Configurado para el frontend específico
- **Helmet**: Headers de seguridad HTTP
- **JWT Tokens**: Autenticación basada en tokens
- **Firebase Security Rules**: Reglas de acceso a datos

### Configuración de Firebase
```javascript
// Reglas de Firestore (ejemplo)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://tu-dominio.com
FIREBASE_PROJECT_ID=tu-proyecto-firebase
```

### Docker Compose (Opcional)
```yaml
version: '3.8'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
  
  frontend:
    build: ./frontend_parkease
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://api-gateway:3001
```

## 🤝 Contribución

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bugs
docs: documentación
style: formato de código
refactor: refactorización
test: pruebas
```

### Flujo de Desarrollo
1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Realizar cambios y commits
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📝 Notas Adicionales

### Dependencias Principales
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Firebase Admin SDK, Axios
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **IA**: Google Genkit para sugerencias de tarifas

### Limitaciones Actuales
- Los servicios de loyalty y payments están en desarrollo
- No hay implementación de notificaciones en tiempo real
- Falta implementación de tests automatizados

### Próximas Mejoras
- Implementación completa de servicios de loyalty y payments
- Sistema de notificaciones push
- Tests unitarios y de integración
- Métricas y monitoreo avanzado
- CI/CD pipeline

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contactar al equipo de desarrollo de ParkEase.

---

**Desarrollado con ❤️ por el equipo de ParkEase**
