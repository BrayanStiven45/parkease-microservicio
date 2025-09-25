import { Router } from "express";
import { parking } from "../controllers/parkingController";

const parkingRouter = Router();

parkingRouter.get("/history", parking);


export default parkingRouter;
