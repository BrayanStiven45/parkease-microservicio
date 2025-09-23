import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

export async function getPlatePoints(plate: string): Promise<number> {
  try {
    const plateRef = doc(db, 'plates', plate);
    const plateSnap = await getDoc(plateRef);
    
    if (plateSnap.exists()) {
      return plateSnap.data().puntos || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching plate points:', error);
    throw new Error('No se pudieron obtener los puntos de la placa');
  }
}

export async function updateParkingRecord(
  userId: string, 
  recordId: string, 
  updateData: {
    status: string;
    exitTime: any;
    totalCost: number;
  }
): Promise<void> {
  try {
    const recordRef = doc(db, 'users', userId, 'parkingRecords', recordId);
    await updateDoc(recordRef, updateData);
  } catch (error) {
    console.error('Error updating parking record:', error);
    throw new Error('No se pudo actualizar el registro de estacionamiento');
  }
}

export async function updatePlatePoints(plate: string, pointsChange: number): Promise<void> {
  try {
    const plateRef = doc(db, 'plates', plate);
    await updateDoc(plateRef, {
      puntos: increment(pointsChange)
    });
  } catch (error) {
    console.error('Error updating plate points:', error);
    throw new Error('No se pudieron actualizar los puntos de la placa');
  }
}

export async function processPaymentTransaction(
  userId: string,
  recordId: string,
  plate: string,
  finalAmount: number,
  pointsEarned: number,
  pointsRedeemed: number
): Promise<void> {
  try {
    // Update parking record
    await updateParkingRecord(userId, recordId, {
      status: 'completed',
      exitTime: serverTimestamp(),
      totalCost: finalAmount,
    });

    // Update loyalty points (earned points minus redeemed points)
    const pointsChange = pointsEarned - pointsRedeemed;
    await updatePlatePoints(plate, pointsChange);
  } catch (error) {
    console.error('Error processing payment transaction:', error);
    throw new Error('Error al procesar la transacción de pago');
  }
}