import { Request, Response } from "express";
import { getProfile } from "../services/firebaseService";


export class BranchController {

  static async create (req:Request, res:Response) {
    const { email, password, username, parkingLotName, maxCapacity, hourlyCost, address, city } = req.body;
    try {
      const user = await createBranch(email, password, { 
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

  // Obtiene el perfil del usuario authenticaso
  static async getProfile (req:Request, res:Response) {
    const authHeader = req.headers.authorization;
    console.log('aquiiiii en getprofile', authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado" });
    }
    const idToken = authHeader.split(" ")[1];

    try {
      const data = await getProfile(idToken);
      res.status(200).json(data);
    } catch (err: any) {
      console.error("Error al obtener el perfil:", err);
      res.status(401).json({ error: "Token inválido o expirado" });
    }
  }
}
