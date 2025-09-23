# ============================
# Etapa 1: Build
# ============================
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias y archivos de configuración
COPY package*.json tsconfig.json ./

# Instalar dependencias (incluyendo devDependencies para poder compilar TS)
RUN npm install

# Copiar el resto del código fuente
COPY src ./src

# Compilar TypeScript → genera dist/
RUN npm run build


# ============================
# Etapa 2: Producción
# ============================
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde la etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=4002
# Exponer el puerto del microservicio
EXPOSE 4002

# Comando de inicio
CMD ["node", "dist/index.js"]