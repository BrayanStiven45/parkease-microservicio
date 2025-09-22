import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface UserAdditionalData {
  username?: string;
  parkingLotName?: string;
  maxCapacity?: number;
  hourlyCost?: number;
  address?: string;
  city?: string;
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

export async function signInUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  return {
    uid: user.uid,
    email: user.email,
  };
}
