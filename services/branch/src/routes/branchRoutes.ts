import { Router } from "express";
import { BranchController } from "../controllers/branchController";

const branchRouter = Router();

branchRouter.get("/profile", BranchController.getProfile);
branchRouter.put("/profile", BranchController.updateProfile);

export default branchRouter;
