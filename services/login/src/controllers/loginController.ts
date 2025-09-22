import { Request, Response } from "express";
import { signInUser } from "../services/firebaseService";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await signInUser(email, password);
    res.json({ message: "Inicio de sesión exitoso", user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
