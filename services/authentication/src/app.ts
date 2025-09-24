import express from "express";
import cors from "cors";
import loginRouter from "./routes/loginRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});


app.use("/auth", loginRouter);


export default app;
