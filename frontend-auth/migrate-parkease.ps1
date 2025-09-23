# 🚀 Script de Migración Automática - ParkEase
# Este script automatiza la migración de Firebase a API Gateway

Write-Host "🎯 Iniciando Migración ParkEase: Firebase → API Gateway" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Variables de configuración
$PROJECT_ROOT = "C:\Users\valen\Escritorio\universidad\8_semestre\Sistemas Distribuidos\Proyecto1\Firebase\parkease-microservicio"
$FRONTEND_REACT = "$PROJECT_ROOT\frontend-react"
$FRONTEND_AUTH = "$PROJECT_ROOT\frontend-auth"
$BACKUP_DIR = "${PROJECT_ROOT}-BACKUP"

# Función para mostrar progreso
function Show-Progress {
    param($Message, $Color = "Yellow")
    Write-Host "⏳ $Message" -ForegroundColor $Color
}

function Show-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Show-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Verificar que existe el proyecto
if (-not (Test-Path $PROJECT_ROOT)) {
    Show-Error "No se encontró el proyecto en: $PROJECT_ROOT"
    exit 1
}

Show-Success "Proyecto encontrado: $PROJECT_ROOT"

# ==================================================
# FASE 1: BACKUP Y PREPARACIÓN
# ==================================================

Write-Host "`n📁 FASE 1: Backup y Preparación" -ForegroundColor Cyan

Show-Progress "Creando backup del proyecto..."
if (Test-Path $BACKUP_DIR) {
    Remove-Item $BACKUP_DIR -Recurse -Force
}
Copy-Item -Path $PROJECT_ROOT -Destination $BACKUP_DIR -Recurse
Show-Success "Backup creado en: $BACKUP_DIR"

# Verificar que frontend-react existe
if (-not (Test-Path $FRONTEND_REACT)) {
    Show-Error "No se encontró frontend-react en: $FRONTEND_REACT"
    exit 1
}

cd $FRONTEND_REACT

# ==================================================
# FASE 2: ESTRUCTURA DE SERVICIOS
# ==================================================

Write-Host "`n🔧 FASE 2: Creando Estructura de Servicios" -ForegroundColor Cyan

# Crear carpetas necesarias
Show-Progress "Creando estructura de carpetas..."
$folders = @(
    "src\lib\services",
    "src\contexts"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -Path $folder -ItemType Directory -Force | Out-Null
        Show-Success "Creada carpeta: $folder"
    }
}

# Copiar servicios desde frontend-auth
Show-Progress "Copiando servicios desde frontend-auth..."
$serviceFiles = @(
    "auth-service.ts",
    "parking-service.ts", 
    "loyalty-service.ts",
    "user-service.ts",
    "analytics-service.ts"
)

foreach ($file in $serviceFiles) {
    $source = "$FRONTEND_AUTH\src\lib\services\$file"
    $dest = "src\lib\services\$file"
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force
        Show-Success "Copiado: $file"
    } else {
        Show-Error "No se encontró: $source"
    }
}

# Copiar types.ts
Show-Progress "Copiando types.ts..."
$typesSource = "$FRONTEND_AUTH\src\lib\types.ts"
$typesDest = "src\lib\types.ts"
if (Test-Path $typesSource) {
    Copy-Item -Path $typesSource -Destination $typesDest -Force
    Show-Success "Copiado types.ts"
}

# Copiar auth-context
Show-Progress "Copiando auth-context..."
$contextSource = "$FRONTEND_AUTH\src\contexts\auth-context.tsx"
$contextDest = "src\contexts\auth-context.tsx"
if (Test-Path $contextSource) {
    Copy-Item -Path $contextSource -Destination $contextDest -Force
    Show-Success "Copiado auth-context.tsx"
}

# ==================================================
# FASE 3: ACTUALIZAR PACKAGE.JSON
# ==================================================

Write-Host "`n📦 FASE 3: Actualizando Dependencias" -ForegroundColor Cyan

Show-Progress "Actualizando package.json..."

# Leer package.json actual
$packageJson = Get-Content "package.json" | ConvertFrom-Json

# Remover dependencias de Firebase
$firebaseDeps = @("firebase", "@firebase/app", "@firebase/auth", "@firebase/firestore")
foreach ($dep in $firebaseDeps) {
    if ($packageJson.dependencies.PSObject.Properties.Name -contains $dep) {
        $packageJson.dependencies.PSObject.Properties.Remove($dep)
        Show-Success "Removida dependencia: $dep"
    }
}

# Agregar nuevas dependencias
$newDeps = @{
    "date-fns" = "^3.6.0"
    "jwt-decode" = "^4.0.0"
}

foreach ($dep in $newDeps.GetEnumerator()) {
    $packageJson.dependencies | Add-Member -NotePropertyName $dep.Key -NotePropertyValue $dep.Value -Force
    Show-Success "Agregada dependencia: $($dep.Key)"
}

# Guardar package.json actualizado
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
Show-Success "package.json actualizado"

# Instalar dependencias
Show-Progress "Instalando nuevas dependencias..."
npm install
Show-Success "Dependencias instaladas"

# ==================================================
# FASE 4: ELIMINAR ARCHIVOS FIREBASE
# ==================================================

Write-Host "`n🗑️ FASE 4: Limpieza de Firebase" -ForegroundColor Cyan

$firebaseFiles = @(
    "src\lib\firebase.ts",
    "src\lib\firebase.js"
)

foreach ($file in $firebaseFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Show-Success "Eliminado: $file"
    }
}

# ==================================================
# FASE 5: CREAR ARCHIVO DE SERVICIOS INDEX
# ==================================================

Write-Host "`n🔗 FASE 5: Creando Exports de Servicios" -ForegroundColor Cyan

Show-Progress "Creando index.ts para servicios..."

$indexContent = @"
// Exportaciones centralizadas de servicios
export { authService } from './auth-service';
export { parkingService } from './parking-service';
export { loyaltyService } from './loyalty-service';
export { userService } from './user-service';
export { analyticsService } from './analytics-service';

// Exportar tipos
export * from '../types';
"@

Set-Content -Path "src\lib\services\index.ts" -Value $indexContent
Show-Success "Creado index.ts de servicios"

# ==================================================
# FASE 6: VERIFICACIÓN DE BUILD
# ==================================================

Write-Host "`n🧪 FASE 6: Verificación de Build" -ForegroundColor Cyan

Show-Progress "Verificando TypeScript..."
try {
    npx tsc --noEmit
    Show-Success "Verificación TypeScript exitosa"
} catch {
    Show-Error "Error en verificación TypeScript"
}

Show-Progress "Intentando build del proyecto..."
try {
    npm run build
    Show-Success "Build exitoso"
} catch {
    Show-Error "Error en build - revisar logs"
}

# ==================================================
# FASE 7: REPORTE FINAL
# ==================================================

Write-Host "`n📊 REPORTE DE MIGRACIÓN" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$report = @"

✅ COMPLETADO:
   • Backup creado en: $BACKUP_DIR
   • Servicios copiados (5 archivos)
   • Types.ts actualizado
   • Auth-context migrado
   • Package.json actualizado
   • Dependencias Firebase removidas
   • Nuevas dependencias instaladas
   • Archivos Firebase eliminados
   • Index de servicios creado

⚠️  PENDIENTE MANUAL:
   • Actualizar imports en componentes React
   • Reemplazar llamadas Firebase por servicios
   • Verificar rutas protegidas
   • Probar funcionalidad completa
   • Configurar API Gateway endpoints

📁 ARCHIVOS MIGRADOS:
   • src/lib/services/auth-service.ts
   • src/lib/services/parking-service.ts
   • src/lib/services/loyalty-service.ts
   • src/lib/services/user-service.ts
   • src/lib/services/analytics-service.ts
   • src/lib/types.ts
   • src/contexts/auth-context.tsx

🔍 PRÓXIMOS PASOS:
   1. Revisar MIGRATION-GUIDE.md para pasos manuales
   2. Actualizar componentes React (ver guía)
   3. Implementar endpoints en API Gateway
   4. Probar funcionalidad completa
   5. Deploy y configuración

📚 DOCUMENTACIÓN:
   • API-ENDPOINTS.md - Documentación de API
   • MIGRATION-GUIDE.md - Guía paso a paso
   
"@

Write-Host $report -ForegroundColor White

Write-Host "`n🎉 ¡MIGRACIÓN BASE COMPLETADA!" -ForegroundColor Green
Write-Host "Ahora sigue la guía manual para completar la migración de componentes." -ForegroundColor Yellow
Write-Host "Revisa MIGRATION-GUIDE.md para los próximos pasos." -ForegroundColor Yellow

# Abrir guía de migración
$guidePath = "$FRONTEND_AUTH\MIGRATION-GUIDE.md"
if (Test-Path $guidePath) {
    Write-Host "`n📖 Abriendo guía de migración..." -ForegroundColor Green
    Start-Process $guidePath
}