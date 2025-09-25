import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import admin from "firebase-admin";
import dotenv from "dotenv";
import serviceAccount from "../../serviceAccountKey.json" with {type: 'json'}

dotenv.config();

// --- Configuración cliente (firebase/app) ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Configuración Admin (firebase-admin) ---

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

interface UserAdditionalData {
  username?: string;
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
}

// --- Crear usuario ---
export async function create(email: string, password: string, additionalData?: UserAdditionalData) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (additionalData) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: additionalData.username || "",
      email: user.email,
      parkingLotName: additionalData.parkingLotName || "",
      maxCapacity: additionalData.maxCapacity || 100,
      hourlyCost: additionalData.hourlyCost || 2.5,
      address: additionalData.address || "",
      city: additionalData.city || "",
      createdAt: new Date().toISOString(),
    });
  }

  return {
    uid: user.uid,
    email: user.email,
    ...additionalData,
  };
}

// --- Actualizar usuario ---
export async function update(uid: string, data: Partial<UserAdditionalData>) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

// --- Eliminar usuario (Auth + Firestore + Subcolecciones) ---
export async function remove(uid: string) {
  // 1. Eliminar Auth (con Admin SDK, ya que desde cliente no se puede)
  await adminAuth.deleteUser(uid);

  // 2. Eliminar subcolecciones del usuario
  const userDocRef = adminDb.collection("users").doc(uid);
  const subcollections = await userDocRef.listCollections();

  for (const sub of subcollections) {
    const docs = await sub.listDocuments();
    for (const d of docs) {
      await d.delete();
    }
  }

  // 3. Eliminar documento del usuario en "users"
  await userDocRef.delete();

  return { success: true, message: `Usuario ${uid} eliminado de Auth y Firestore.` };
}

// Devuelve todos los branches si el usuario auth es admin
export async function getAllBranches() {
  
}

// Devuelve el perfil del usuario autenticado
export async function getProfile(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      throw new Error("Perfil no encontrado");
    }
    const userData = userDoc.data();
    if (!userData) {
      throw new Error("Perfil no encontrado");
    }
    const userDataJson = {
      user: {
        uid: userData?.uid || "",
        email: userData?.email || "",
        displayName: userData?.username || ""},
      userData: {
        username: userData?.username || "",
        parkingLotName: userData?.parkingLotName || "",
        hourlyCost: userData?.hourlyCost || 0,
        maxCapacity: userData?.maxCapacity || 0,
        address: userData?.address || "",
        city: userData?.city || "",
      }
    };
    console.log(userDataJson);
    return userDataJson;
  } catch (error) {
    console.log(error)
    throw new Error("Token inválido o expirado");
  }
}
