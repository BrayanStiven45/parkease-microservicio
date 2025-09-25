import { Router } from "express";
import { BranchController } from "../controllers/branchController";

const branchRouter = Router();

branchRouter.get("/profile", BranchController.getProfile);

export default branchRouter;
