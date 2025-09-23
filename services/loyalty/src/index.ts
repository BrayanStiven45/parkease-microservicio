import app from "./app";

/**
 * Punto de entrada del microservicio de lealtad.
 */
const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Loyalty service running on port ${PORT}`);
});
