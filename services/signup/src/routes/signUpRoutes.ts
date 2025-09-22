import { Router } from "express";
import { signup } from "../controllers/signUpController";

const signUpRouter = Router();

signUpRouter.post("/signup", signup);

export default signUpRouter;
