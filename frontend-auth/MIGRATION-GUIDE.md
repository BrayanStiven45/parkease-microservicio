# 📋 Guía de Migración Completa: Firebase → API Gateway

Esta guía te llevará paso a paso para migrar tu proyecto ParkEase completo de Firebase a un sistema basado en API Gateway.

## 🎯 Objetivos de la Migración

1. ✅ Eliminar todas las dependencias de Firebase
2. ✅ Implementar arquitectura de servicios modulares
3. ✅ Conectar todo a tu API Gateway
4. ✅ Mantener la funcionalidad completa
5. ✅ Mejorar la separación de responsabilidades

---

## 📁 Estructura Final del Proyecto

```
parkease-microservicio/
├── frontend-auth/                    # ✅ YA MIGRADO
│   ├── src/
│   │   ├── lib/
│   │   │   ├── services/            # Servicios modulares
│   │   │   │   ├── auth-service.ts
│   │   │   │   ├── parking-service.ts
│   │   │   │   ├── loyalty-service.ts
│   │   │   │   ├── user-service.ts
│   │   │   │   └── analytics-service.ts
│   │   │   └── types.ts
│   │   ├── contexts/
│   │   │   └── auth-context.tsx
│   │   └── ...
│   └── package.json                 # Sin dependencias Firebase
├── frontend-react/                  # ⚠️  PENDIENTE MIGRACIÓN
├── services/                        # ⚠️  PENDIENTE REORGANIZACIÓN
└── api-gateway/                     # Backend API
```

---

## 🚀 Fase 1: Preparación (15 min)

### 1.1 Backup del Proyecto
```powershell
# Crear backup completo
Copy-Item -Path "C:\Users\valen\Escritorio\universidad\8_semestre\Sistemas Distribuidos\Proyecto1\Firebase\parkease-microservicio" -Destination "C:\Users\valen\Escritorio\universidad\8_semestre\Sistemas Distribuidos\Proyecto1\Firebase\parkease-microservicio-BACKUP" -Recurse
```

### 1.2 Instalar Dependencias Base
```powershell
# En frontend-react
cd "C:\Users\valen\Escritorio\universidad\8_semestre\Sistemas Distribuidos\Proyecto1\Firebase\parkease-microservicio\frontend-react"
npm install date-fns jwt-decode
```

---

## 🔧 Fase 2: Migración de Servicios (45 min)

### 2.1 Copiar Arquitectura de Servicios

**1. Crear carpeta de servicios:**
```powershell
New-Item -Path "frontend-react\src\lib\services" -ItemType Directory -Force
```

**2. Copiar todos los servicios desde `frontend-auth`:**

- `auth-service.ts` → Autenticación completa
- `parking-service.ts` → Gestión de parking
- `loyalty-service.ts` → Sistema de puntos
- `user-service.ts` → Gestión de usuarios
- `analytics-service.ts` → Estadísticas y reportes

**3. Actualizar types.ts:**
Copia el `types.ts` completo desde `frontend-auth/src/lib/`

### 2.2 Migrar Context de Autenticación

**Copiar:** `frontend-auth/src/contexts/auth-context.tsx` → `frontend-react/src/contexts/`

### 2.3 Actualizar package.json

**Remover dependencias Firebase:**
```json
{
  "dependencies": {
    // ELIMINAR ESTAS:
    // "firebase": "^x.x.x",
    // "@firebase/app": "^x.x.x",
    // "@firebase/auth": "^x.x.x",
    // "@firebase/firestore": "^x.x.x",
    
    // AGREGAR ESTAS:
    "date-fns": "^3.6.0",
    "jwt-decode": "^4.0.0"
  }
}
```

---

## 🎨 Fase 3: Migración de Componentes (60 min)

### 3.1 Componentes de Autenticación

**Archivos a modificar:**
- `src/components/auth/login-form.tsx`
- `src/components/auth/signup-form.tsx`
- `src/components/auth/ProtectedRoute.tsx`

**Patrón de migración:**
```tsx
// ANTES (Firebase)
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

// DESPUÉS (Service)
import { authService } from '../../lib/services/auth-service';
```

**Reemplazar llamadas:**
```tsx
// ANTES
await signInWithEmailAndPassword(auth, email, password);

// DESPUÉS  
await authService.login(email, password);
```

### 3.2 Dashboard Components

**Archivos críticos:**
- `src/components/dashboard/active-parking.tsx`
- `src/components/dashboard/active-parking-table.tsx`
- `src/components/dashboard/vehicle-entry-modal.tsx`
- `src/components/dashboard/payment-modal.tsx`

**Patrón de migración:**
```tsx
// ANTES
import { db } from '../../lib/firebase';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';

// DESPUÉS
import { parkingService } from '../../lib/services/parking-service';
import { loyaltyService } from '../../lib/services/loyalty-service';
```

### 3.3 History Components

**Archivos:**
- `src/components/history/parking-history-table.tsx`

**Migración:**
```tsx
// ANTES - Firebase query
const parkingQuery = query(
  collection(db, 'parkingRecords'),
  where('userId', '==', user.uid),
  orderBy('exitTime', 'desc')
);

// DESPUÉS - Service call
const historyData = await parkingService.getParkingHistory(user.uid, {
  page: currentPage,
  limit: recordsPerPage
});
```

---

## 🏢 Fase 4: Admin Components (30 min)

### 4.1 Admin Components

**Archivos:**
- `src/components/admin/create-branch-form.tsx`

**Migración:**
```tsx
// ANTES
import { collection, addDoc } from 'firebase/firestore';

// DESPUÉS
import { userService } from '../../lib/services/user-service';
```

### 4.2 Rate Suggester

**Archivo:**
- `src/components/rate-suggester/rate-suggester-form.tsx`

**Migración:**
```tsx
// ANTES - Firebase analytics
const analyticsQuery = collection(db, 'analytics');

// DESPUÉS - Analytics service  
const analytics = await analyticsService.getDashboardStats(userId);
```

---

## 📱 Fase 5: Pages y Layout (20 min)

### 5.1 Pages

**Archivos:**
- `src/pages/LoginPage.tsx`

**Migración:**
```tsx
// Actualizar imports para usar nuevos servicios
import { AuthProvider } from '../contexts/auth-context';
```

### 5.2 Layout Components

**Archivos:**
- `src/components/layout/app-header.tsx`
- `src/components/layout/app-sidebar.tsx`

**Migración:**
```tsx
// ANTES
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

// DESPUÉS
import { authService } from '../../lib/services/auth-service';
import { useAuth } from '../../contexts/auth-context';
```

---

## 🗂️ Fase 6: Archivos Core (15 min)

### 6.1 Eliminar Firebase

**Archivos a eliminar:**
```powershell
Remove-Item "frontend-react\src\lib\firebase.ts" -Force
```

### 6.2 Actualizar App.tsx

```tsx
// ANTES
import { AuthProvider } from './contexts/firebase-auth-context';

// DESPUÉS  
import { AuthProvider } from './contexts/auth-context';
```

### 6.3 Actualizar main.tsx

```tsx
// Remover cualquier inicialización de Firebase
// Mantener solo React y router setup
```

---

## 🧪 Fase 7: Testing y Validación (30 min)

### 7.1 Verificación de Build

```powershell
cd frontend-react
npm run build
```

**Errores comunes:**
- Imports de Firebase no resueltos → Revisar y actualizar
- Tipos faltantes → Verificar types.ts
- Servicios no encontrados → Revisar paths de servicios

### 7.2 Verificación de Funcionalidad

**Checklist completo:**

✅ **Autenticación:**
- [ ] Login funciona
- [ ] Signup funciona  
- [ ] Logout funciona
- [ ] Protección de rutas funciona

✅ **Dashboard:**
- [ ] Lista vehículos activos
- [ ] Agregar vehículo
- [ ] Procesar pago
- [ ] Ver estadísticas

✅ **Historial:**
- [ ] Ver historial paginado
- [ ] Buscar en historial
- [ ] Filtros funcionan

✅ **Loyalty:**
- [ ] Ver puntos
- [ ] Redimir puntos
- [ ] Historial loyalty

✅ **Admin:** (si aplica)
- [ ] Gestión usuarios
- [ ] Estadísticas admin
- [ ] Configuraciones

---

## 🚀 Fase 8: Optimización Final (15 min)

### 8.1 Performance

**ESLint y limpieza:**
```powershell
npm run lint -- --fix
```

**Optimizar imports:**
```tsx
// Agrupar imports por servicios
import { 
  authService,
  parkingService,
  loyaltyService
} from '../lib/services';
```

### 8.2 Error Handling

**Verificar manejo de errores en:**
- Formularios de auth
- Operaciones de parking
- Llamadas a servicios

### 8.3 TypeScript

**Verificar tipos:**
```powershell
npx tsc --noEmit
```

---

## 📊 Resumen de Cambios

### ❌ Removido:
- Firebase SDK (auth, firestore, storage)
- Firebase configuration
- Firebase-specific hooks
- Realtime listeners
- Firebase deployment config

### ✅ Agregado:
- 5 servicios modulares (auth, parking, loyalty, user, analytics)
- JWT token management
- REST API communication
- Comprehensive TypeScript types
- Error handling patterns
- Service-based architecture

### 🔄 Transformado:
- 15+ componentes migrados de Firebase a servicios
- Context de autenticación renovado
- Sistema de estado local con localStorage
- Patterns de comunicación HTTP

---

## 🆘 Troubleshooting

### Error Común 1: "Cannot find module 'firebase'"
**Solución:** Verificar que todos los imports de firebase fueron actualizados a servicios.

### Error Común 2: "User is not authenticated"  
**Solución:** Verificar que el AuthProvider está envolviendo la app correctamente.

### Error Común 3: "Service method not found"
**Solución:** Verificar que todos los servicios están siendo importados correctamente.

### Error Común 4: "Token expired"
**Solución:** Implementar refresh token o manejar expiration en auth-service.

---

## 🎯 Próximos Pasos

1. **Testing exhaustivo** de cada funcionalidad
2. **Implementar API Gateway** con endpoints documentados
3. **Deploy y configuración** de producción
4. **Monitoring y logs** para debugging
5. **Performance optimization** si es necesario

---

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. Revisa los logs de la consola del navegador
2. Verifica que el API Gateway esté corriendo
3. Confirma que todos los endpoints estén implementados
4. Revisa la documentación de API-ENDPOINTS.md

¡Tu sistema ParkEase estará completamente migrado y funcionando sin Firebase! 🎉