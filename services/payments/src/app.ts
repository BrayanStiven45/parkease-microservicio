import express from "express";
import cors from "cors";
import paymentRouter from "./routes/paymentRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/payments", paymentRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "payments" });
});

export default app;