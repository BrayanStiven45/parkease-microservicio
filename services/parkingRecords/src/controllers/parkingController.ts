import { Request, Response } from "express";
import { getParkingRecords } from "../services/firebaseService";


export async function parking(req: Request, res: Response) {
  try {
    const { branchId } = req.query
    const history = await getParkingRecords(branchId);
    res.json({ message: "Historial de estacionamiento obtenido", history });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
