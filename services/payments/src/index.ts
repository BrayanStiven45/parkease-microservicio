import app from "./app";

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`🚀 Servicio de Pagos ejecutándose en el puerto ${PORT}`);
});