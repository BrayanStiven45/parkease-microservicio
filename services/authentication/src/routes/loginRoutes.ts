import { Router } from "express";
import { login, verifySession, logout, signup} from "../controllers/loginController";

const loginRouter = Router();

loginRouter.post("/login", login);
loginRouter.post("/verify-token", verifySession);
loginRouter.post("/logout", logout)
loginRouter.post("/signup", signup);

export default loginRouter;
