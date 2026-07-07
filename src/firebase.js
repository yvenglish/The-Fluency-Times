// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbmG2--G2RXDlnF9WGyTLwIRq-uNsKzpI",
  authDomain: "thefluencytimes.firebaseapp.com",
  projectId: "thefluencytimes",
  storageBucket: "thefluencytimes.firebasestorage.app",
  messagingSenderId: "1002161814214",
  appId: "1:1002161814214:web:86cdfb262ca4eb001b35c7",
  measurementId: "G-7WFP6G3CB8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
