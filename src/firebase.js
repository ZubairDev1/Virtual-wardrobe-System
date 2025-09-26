// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBG0FNpq_RalDmbgtpy-xXqesp7qJPGsok",
  authDomain: "virtual-wardrobe-system.firebaseapp.com",
  projectId: "virtual-wardrobe-system",
  storageBucket: "virtual-wardrobe-system.firebasestorage.app",
  messagingSenderId: "160648507940",
  appId: "1:160648507940:web:005bfbcf56afaa07829eb1",
  measurementId: "G-NYQGC76Q9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export the auth instance
export const db = getFirestore(app);

// Optional: Add this for debugging
console.log('Firebase initialized with app:', app);