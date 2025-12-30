import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    projectId: "sea-trader-bot-v1",
    appId: "1:508148127414:web:d47f93e356a6dd9a0d7817",
    storageBucket: "sea-trader-bot-v1.firebasestorage.app",
    apiKey: "AIzaSyB6jMng_5PsebeoF29IqAVMHMnAdABIe6I",
    authDomain: "sea-trader-bot-v1.firebaseapp.com",
    messagingSenderId: "508148127414",
    measurementId: "G-PLACEHOLDER" // Optional
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
