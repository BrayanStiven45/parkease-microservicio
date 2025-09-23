import { Router } from "express";
import {
  createAccountHandler,
  addPointsHandler,
  redeemPointsHandler,
  getBalanceHandler,
} from "../controllers/loyaltyController";

/**
 * Rutas del microservicio de lealtad.
 */
const loyaltyRouter = Router();

loyaltyRouter.post("/account", createAccountHandler);
loyaltyRouter.post("/add", addPointsHandler);
loyaltyRouter.post("/redeem", redeemPointsHandler);
loyaltyRouter.get("/balance/:plate", getBalanceHandler);

export default loyaltyRouter;
