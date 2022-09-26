import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1Sl0KSjS6nVJ5McvpPsltHkyopECTYnM",
  authDomain: "accountr-1a2b7.firebaseapp.com",
  projectId: "accountr-1a2b7",
  storageBucket: "accountr-1a2b7.appspot.com",
  messagingSenderId: "687123515917",
  appId: "1:687123515917:web:9fe31d4db87e0ff1f32344",
  measurementId: "G-Z3D6P0HFWN"
};



// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const appAdmin = initializeApp(firebaseConfig, "secondary");
export const auth = getAuth(app);
export const authAdmin = getAuth(appAdmin);
export const storage = getStorage(app);