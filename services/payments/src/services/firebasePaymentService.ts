import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

export async function getParkingRecordForPayment(recordId: string): Promise<any> {
  try {
    const recordRef = doc(db, 'parkingRecords', recordId);
    const recordSnap = await getDoc(recordRef);
    
    if (recordSnap.exists()) {
      return recordSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching parking record:', error);
    throw new Error('No se pudo obtener el registro de estacionamiento');
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

export async function createPaymentTransaction(
  transactionData: {
    recordId: string;
    userId: string;
    plate: string;
    amount: number;
    paymentMethod: string;
    receiptNumber: string;
  }
): Promise<string> {
  try {
    const transactionId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const transactionRef = doc(db, 'paymentTransactions', transactionId);
    
    await setDoc(transactionRef, {
      ...transactionData,
      id: transactionId,
      status: 'completed',
      transactionDate: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return transactionId;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw new Error('No se pudo crear la transacción de pago');
  }
}

export async function processPaymentTransaction(
  userId: string,
  recordId: string,
  plate: string,
  finalAmount: number,
  paymentMethod: string
): Promise<string> {
  try {
    // Generate receipt number
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Create payment transaction record
    const transactionId = await createPaymentTransaction({
      recordId,
      userId,
      plate,
      amount: finalAmount,
      paymentMethod,
      receiptNumber
    });

    // Update parking record with payment info
    await updateParkingRecord(userId, recordId, {
      status: 'completed',
      exitTime: serverTimestamp(),
      totalCost: finalAmount,
    });

    return transactionId;
  } catch (error) {
    console.error('Error processing payment transaction:', error);
    throw new Error('Error al procesar la transacción de pago');
  }
}