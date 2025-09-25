import { Request, Response } from "express";
import { createUser } from "../services/firebaseSignUpService";

export async function signup(req: Request, res: Response) {
  const { email, password, username, parkingLotName, maxCapacity, hourlyCost, address, city } = req.body;
  try {
    const user = await createUser(email, password, { 
      username, 
      parkingLotName, 
      maxCapacity, 
      hourlyCost, 
      address, 
      city 
    });
    res.status(201).json({ message: "Usuario Creado Correctamente", user });
  } catch (err: any) {
    console.error("Error durante el registro:", err);
    res.status(400).json({ error: err.message });
  }
}
