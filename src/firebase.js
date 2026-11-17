// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD48WzU25D1EG-DwjdNQuda0L_RBELUiLw",
  authDomain: "practicafirebase-215b7.firebaseapp.com",
  projectId: "practicafirebase-215b7",
  storageBucket: "practicafirebase-215b7.firebasestorage.app",
  messagingSenderId: "1029004919658",
  appId: "1:1029004919658:web:3cfc2ac7795c7eeab8db13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);