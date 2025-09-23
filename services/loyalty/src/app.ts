import express from "express";
import loyaltyRouter from "./routes/loyaltyRoutes";

const app = express();

app.use(express.json());
app.use("/loyalty", loyaltyRouter);

export default app;
