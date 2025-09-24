import { Request, Response } from "express";
import { signInUser, verifyToken, logout } from "../services/firebaseService";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await signInUser(email, password);
    res.json( user );
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function verifySession(req: Request, res: Response) {
  
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    
    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const decoded = await verifyToken(token);
    
    const data = {
      user: decoded, // uid, email, etc.
    }
    console.log('estoyyyyy aquiiiii22222', data)
    return res.json(data);

  } catch (error) {
    return res.status(401).json({ message: "Token inválido", error: (error as Error).message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    await logout();
    res.json({ message: "Logout exitoso" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión", error: (error as Error).message });
  }
}
