
import { LoyaltyAccount } from "../models/loyaltyAccount";
import { db } from "./firebaseService";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

/**
 * Crea una cuenta de lealtad para una placa en Firestore.
 */
/**
 * Obtiene la información de una placa directamente de Firestore.
 * Si la placa existe, retorna el objeto LoyaltyAccount; si no, retorna null.
 */
export async function getAccount(plate: string): Promise<LoyaltyAccount | null> {
  const ref = doc(db, "plates", plate);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return snapshot.data() as LoyaltyAccount;
  }
  return null;
}

/**
 * Añade puntos a la cuenta de una placa en Firestore.
 */
export async function addPoints(plate: string, puntos: number): Promise<LoyaltyAccount | null> {
  const ref = doc(db, "plates", plate);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const account = snapshot.data() as LoyaltyAccount;
  account.puntos += puntos;
  await updateDoc(ref, { puntos: account.puntos });
  return account;
}

/**
 * Redime puntos de la cuenta de una placa en Firestore.
 */
export async function redeemPoints(plate: string, puntos: number): Promise<LoyaltyAccount | null> {
  const ref = doc(db, "plates", plate);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const account = snapshot.data() as LoyaltyAccount;
  if (account.puntos < puntos) return null;
  account.puntos -= puntos;
  await updateDoc(ref, { puntos: account.puntos });
  return account;
}

/**
 * Consulta el saldo de puntos de una placa en Firestore.
 */
export async function getBalance(plate: string): Promise<number | null> {
  const ref = doc(db, "plates", plate);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const account = snapshot.data();
  // Usar el campo 'puntos' según la estructura de Firestore
  return typeof account.puntos === "number" ? account.puntos : null;
}
