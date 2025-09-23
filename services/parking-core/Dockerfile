# Usar imagen base de Node.js Alpine para menor tamaño
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción solamente
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S parkinguser -u 1001

# Cambiar ownership de archivos al usuario no-root
RUN chown -R parkinguser:nodejs /app

# Cambiar a usuario no-root
USER parkinguser

# Exponer puerto del servicio
EXPOSE 3003

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para ejecutar la aplicación
CMD ["npm", "start"]