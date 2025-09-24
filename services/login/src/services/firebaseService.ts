import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import admin from "firebase-admin";
import dotenv from "dotenv";
import serviceAccount from "../../serviceAccountKey.json" with { type: "json" };

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
const auth = getAuth(app);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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
