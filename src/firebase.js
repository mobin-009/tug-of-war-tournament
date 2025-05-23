import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔐 Replace this with your actual Firebase config from project settings
const firebaseConfig = {
    apiKey: "AIzaSyDlQSnvmFL-Ql30Fh-kQMV3OOSatPZZdXU",
    authDomain: "tugofwarapp.firebaseapp.com",
    projectId: "tugofwarapp",
    storageBucket: "tugofwarapp.firebasestorage.app",
    messagingSenderId: "991261817476",
    appId: "1:991261817476:web:00bad10d83c7f4c2d3e0d1"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
