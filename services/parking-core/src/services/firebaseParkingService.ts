import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";
import { ParkingRecord, BranchOccupancy } from "../types";

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

/**
 * Crear un nuevo registro de entrada de vehículo
 */
export async function createParkingRecord(
  plate: string,
  userId: string,
  branchId: string,
  spotNumber?: string,
  vehicleType?: string
): Promise<ParkingRecord> {
  try {
    const recordId = uuidv4();
    const now = new Date();
    
    const record: ParkingRecord = {
      id: recordId,
      plate: plate.toUpperCase(),
      entryTime: now,
      status: 'active',
      userId,
      branchId,
      spotNumber,
      vehicleType: vehicleType as any || 'car',
      createdAt: now,
      updatedAt: now
    };

    // Guardar en la colección principal de registros
    const recordRef = doc(db, 'parkingRecords', recordId);
    await setDoc(recordRef, {
      ...record,
      entryTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // También guardar en la colección del usuario
    const userRecordRef = doc(db, 'users', userId, 'parkingRecords', recordId);
    await setDoc(userRecordRef, {
      ...record,
      entryTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return record;
  } catch (error) {
    console.error('Error creating parking record:', error);
    throw new Error('No se pudo crear el registro de estacionamiento');
  }
}

/**
 * Obtener un registro de estacionamiento por ID
 */
export async function getParkingRecord(recordId: string): Promise<ParkingRecord | null> {
  try {
    const recordRef = doc(db, 'parkingRecords', recordId);
    const recordSnap = await getDoc(recordRef);
    
    if (recordSnap.exists()) {
      const data = recordSnap.data();
      return {
        ...data,
        entryTime: data.entryTime?.toDate?.() || data.entryTime,
        exitTime: data.exitTime?.toDate?.() || data.exitTime,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as ParkingRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching parking record:', error);
    throw new Error('No se pudo obtener el registro de estacionamiento');
  }
}

/**
 * Actualizar un registro para marcar la salida del vehículo
 */
export async function updateParkingRecordExit(
  recordId: string,
  userId: string,
  exitTime?: Date
): Promise<ParkingRecord> {
  try {
    const record = await getParkingRecord(recordId);
    
    if (!record) {
      throw new Error('Registro de estacionamiento no encontrado');
    }

    if (record.status !== 'active') {
      throw new Error('El vehículo ya ha salido del estacionamiento');
    }

    const updateData = {
      exitTime: exitTime ? Timestamp.fromDate(exitTime) : serverTimestamp(),
      status: 'completed',
      updatedAt: serverTimestamp()
    };

    // Actualizar registro principal
    const recordRef = doc(db, 'parkingRecords', recordId);
    await updateDoc(recordRef, updateData);

    // Actualizar registro del usuario
    const userRecordRef = doc(db, 'users', userId, 'parkingRecords', recordId);
    await updateDoc(userRecordRef, updateData);

    // Retornar el registro actualizado
    return await getParkingRecord(recordId) as ParkingRecord;
  } catch (error) {
    console.error('Error updating parking record exit:', error);
    throw new Error(error instanceof Error ? error.message : 'No se pudo actualizar el registro de salida');
  }
}

/**
 * Obtener registros activos por sucursal
 */
export async function getActiveParkingRecordsByBranch(branchId: string): Promise<ParkingRecord[]> {
  try {
    const recordsRef = collection(db, 'parkingRecords');
    const q = query(
      recordsRef,
      where('branchId', '==', branchId),
      where('status', '==', 'active'),
      orderBy('entryTime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const records: ParkingRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        ...data,
        entryTime: data.entryTime?.toDate?.() || data.entryTime,
        exitTime: data.exitTime?.toDate?.() || data.exitTime,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as ParkingRecord);
    });
    
    return records;
  } catch (error) {
    console.error('Error fetching active parking records:', error);
    throw new Error('No se pudieron obtener los registros activos');
  }
}

/**
 * Verificar si un vehículo ya está estacionado
 */
export async function checkVehicleAlreadyParked(plate: string): Promise<ParkingRecord | null> {
  try {
    const recordsRef = collection(db, 'parkingRecords');
    const q = query(
      recordsRef,
      where('plate', '==', plate.toUpperCase()),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        entryTime: data.entryTime?.toDate?.() || data.entryTime,
        exitTime: data.exitTime?.toDate?.() || data.exitTime,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as ParkingRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking vehicle status:', error);
    throw new Error('No se pudo verificar el estado del vehículo');
  }
}

/**
 * Obtener información de ocupación de una sucursal
 */
export async function getBranchOccupancy(branchId: string): Promise<BranchOccupancy> {
  try {
    // Obtener configuración de la sucursal
    const branchRef = doc(db, 'branches', branchId);
    const branchSnap = await getDoc(branchRef);
    
    if (!branchSnap.exists()) {
      throw new Error('Sucursal no encontrada');
    }
    
    const branchData = branchSnap.data();
    const totalSpots = branchData.totalSpots || 50; // Default 50 spots
    const branchName = branchData.name || `Sucursal ${branchId}`;
    
    // Obtener registros activos
    const activeRecords = await getActiveParkingRecordsByBranch(branchId);
    const occupiedSpots = activeRecords.length;
    const availableSpots = totalSpots - occupiedSpots;
    const occupancyRate = (occupiedSpots / totalSpots) * 100;
    
    return {
      branchId,
      branchName,
      totalSpots,
      occupiedSpots,
      availableSpots,
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      activeRecords,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching branch occupancy:', error);
    throw new Error('No se pudo obtener la información de ocupación');
  }
}