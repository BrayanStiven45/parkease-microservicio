import express from "express";
import cors from "cors";
import parkingRouter from "./routes/parkingRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});


app.use("/parking-records", parkingRouter);

export default app;
