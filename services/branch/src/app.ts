import express from "express";
import cors from "cors";
import branchRouter from "./routes/branchRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // tu frontend
    credentials: true,
  })
);


app.use("/branch", branchRouter);


export default app;
