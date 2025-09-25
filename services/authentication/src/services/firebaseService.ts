import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import admin from "firebase-admin";
import { getFirestore, doc, setDoc } from "firebase/firestore";
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

interface UserAdditionalData {
  username?: string;
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Configuración Admin (firebase-admin) ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    }),
  });
}

const adminAuth = admin.auth();

export async function signInUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // console.log(userCredential)
  const user = userCredential.user;
  const token = await user.getIdToken();
  
  return {
    uid: user.uid,
    email: user.email,
    token,
  };
}

export async function verifyToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken; // contiene uid, email, claims, etc.
  } catch (error) {
    console.log(error)
    throw new Error("Token inválido o expirado");
  }
}

export async function logout(){
  try {
    await signOut(auth);
    console.log("Usuario deslogueado correctamente");
  } catch (error) {
    console.error("Error al desloguear:", error);
  }
}

export async function createUser(email: string, password: string, additionalData?: UserAdditionalData) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Store additional user data in Firestore if provided
  if (additionalData) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      username: additionalData.username || '',
      email: user.email,
      parkingLotName: additionalData.parkingLotName || '',
      maxCapacity: additionalData.maxCapacity || 100,
      hourlyCost: additionalData.hourlyCost || 2.5,
      address: additionalData.address || '',
      city: additionalData.city || '',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    uid: user.uid,
    email: user.email,
    ...additionalData,
  };
}