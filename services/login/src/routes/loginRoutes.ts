import { Router } from "express";
import { login, verifySession, logout} from "../controllers/loginController";

const loginRouter = Router();

loginRouter.post("/login", login);
loginRouter.post("/verify-token", verifySession);
loginRouter.post("/logout", logout)

export default loginRouter;
