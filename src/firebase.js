import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCJ42pYzbzuQqxyVAZCGEmByT7g1zg_eD8",
  authDomain: "qr-trac-c72b3.firebaseapp.com",
  projectId: "qr-trac-c72b3",
  storageBucket: "qr-trac-c72b3.firebasestorage.app",
  messagingSenderId: "1004399470045",
  appId: "1:1004399470045:web:7ff62a09c0dd4e7f590234",
  measurementId: "G-S9HCV389KW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { db, functions, analytics, auth };