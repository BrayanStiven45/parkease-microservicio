import { Router } from "express";
import { parking } from "../controllers/parkingController";

const parkingRouter = Router();

parkingRouter.get("/history/:userId", parking);


export default parkingRouter;
