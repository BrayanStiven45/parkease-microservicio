import { Request, Response } from "express";
import {
  getAccount,
  addPoints,
  redeemPoints,
  getBalance,
} from "../services/loyaltyService";

/**
 * Crea una cuenta de lealtad por placa.
 */
export async function createAccountHandler(req: Request, res: Response) {
  const { plate } = req.body;
  if (!plate) return res.status(400).json({ error: "Plate is required" });
  try {
    const account = await getAccount(plate);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Añade puntos después de un pago.
 */
export async function addPointsHandler(req: Request, res: Response) {
  const { plate, puntos } = req.body;
  if (!plate || typeof puntos !== "number")
    return res.status(400).json({ error: "Plate and points are required" });
  try {
    const account = await addPoints(plate, puntos);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Redime puntos como descuento.
 */
export async function redeemPointsHandler(req: Request, res: Response) {
  const { plate, puntos } = req.body;
  if (!plate || typeof puntos !== "number")
    return res.status(400).json({ error: "Plate and points are required" });
  try {
    const account = await redeemPoints(plate, puntos);
    if (!account) return res.status(400).json({ error: "Insufficient points or account not found" });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Consulta el saldo de puntos por placa.
 */
export async function getBalanceHandler(req: Request, res: Response) {
  const { plate } = req.params;
  if (!plate) return res.status(400).json({ error: "Plate is required" });
  try {
    const points = await getBalance(plate);
    if (points === null) return res.status(404).json({ error: "Account not found" });
    res.json({ plate, points });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
