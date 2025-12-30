import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5V0KitHgRL2NFcvI7-5bKGkTFWhppGck",
  authDomain: "sea-trader.firebaseapp.com",
  projectId: "sea-trader",
  storageBucket: "sea-trader.firebasestorage.app",
  messagingSenderId: "74135715728",
  appId: "1:74135715728:web:e5191f372346e9cbd7fd15",
  measurementId: "G-KEX3CB3T1J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
