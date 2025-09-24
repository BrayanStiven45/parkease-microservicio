// // Import the functions you need from the SDKs you need
// import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// import { getAuth, type Auth } from "firebase/auth";

// let app: FirebaseApp;
// let auth: Auth;

// const firebaseConfig = {
//   apiKey: "AIzaSyDdfEjzf02sTM_A8kBm2wqoS57GBiM8kOk",
//   authDomain: "parkease-20584.firebaseapp.com",
//   projectId: "parkease-20584",
//   storageBucket: "parkease-20584.appspot.com",  
//   messagingSenderId: "504816111613",
//   appId: "1:504816111613:web:3b2ace97dbae8cbfe29394",
//   measurementId: "G-34ZYBD2GPR"
// };

// if (!getApps().length) {
//     app = initializeApp(firebaseConfig);
// } else {
//     app = getApp();
// }

// auth = getAuth(app);

// export { app, auth };

// Firebase has been removed in favor of HTTP API calls via src/lib/api.ts
// This file is kept to avoid import breakage; all exports are undefined placeholders.
// Migrate imports to use AuthAPI/ParkingAPI/UsersAPI from '@/lib/api'.

export const app = undefined as any;
export const auth = undefined as any;
export const db = undefined as any;
export const storage = undefined as any;
export const analytics = undefined as any;
