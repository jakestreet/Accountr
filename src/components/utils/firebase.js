import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBm1Di-H46sTLQthb8Iv0Xg1VnZE2cEoPQ",
  authDomain: "swe4713accoutingapp.firebaseapp.com",
  projectId: "swe4713accoutingapp",
  storageBucket: "swe4713accoutingapp.appspot.com",
  messagingSenderId: "231813298108",
  appId: "1:231813298108:web:f32bdda7dedbf02096ddb9",
  measurementId: "G-0TGZETXQXZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);