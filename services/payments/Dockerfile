# Usar una imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3004

# Establecer variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3004

# Comando para ejecutar la aplicación
CMD ["npm", "start"]