import { Request, Response } from "express";
import { createUser, signInUser } from "../services/firebaseService";

export async function signup(req: Request, res: Response) {
  console.log("leegueee aquiiiiii")
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
    res.status(201).json({ message: "User created", user });
  } catch (err: any) {
    console.error("Error during sign up:", err);
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await signInUser(email, password);
    res.json({ message: "Login successful", user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
