import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore, collection, doc, getDocs, getDoc } from "firebase/firestore";
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
const auth = getAuth(app);
const db = getFirestore(app);

export async function getParkingRecords(userId: string) {
  try {
    console.log(userId);
    const recordsRef = collection(doc(collection(db, "users"), userId), "parkingRecords");
    const snapshot = await getDocs(recordsRef);

    if (snapshot.empty) {
      return [];
    }

    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return JSON.parse(JSON.stringify(records));
  } catch (error) {
    console.error("Error fetching parking records:", error);
    throw new Error("Error fetching parking records");
  }
}
