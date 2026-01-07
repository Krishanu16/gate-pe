import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyD4eUMaI7RGfYp8-Wbc07bmLUubMgx4Eag",
  authDomain: "gate-26.firebaseapp.com",
  projectId: "gate-26",
  storageBucket: "gate-26.firebasestorage.app",
  messagingSenderId: "40953329334",
  appId: "1:40953329334:web:de0a9122337df712f7d817",
  measurementId: "G-GBKB5CRC8T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);