import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBFcgk1QpYMxytV7XF2Fna-nr4xmqeFeFY",
  authDomain: "archipielablog.firebaseapp.com",
  projectId: "archipielablog",
  storageBucket: "archipielablog.firebasestorage.app",
  messagingSenderId: "638920556361",
  appId: "1:638920556361:web:1fb78f9876b23decfde498",
  measurementId: "G-Z4JXL4QBGK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { db, functions, analytics, auth };