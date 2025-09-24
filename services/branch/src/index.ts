import app from './app';
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4003;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Servicio de surcursales corriendo en el puerto ${PORT}`);
});
