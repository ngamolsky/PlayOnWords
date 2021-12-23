// Initialize Cloud Firestore through Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAa2f3b-WWQAoMtGV8SSfYK0CX-ptAvTo8",
  authDomain: "xword-b9f56.firebaseapp.com",
  databaseURL: "https://xword-b9f56.firebaseio.com",
  projectId: "xword-b9f56",
  storageBucket: "xword-b9f56.appspot.com",
  messagingSenderId: "1048302721554",
  appId: "1:1048302721554:web:98ab78b374230335d1d6cb",
  measurementId: "G-NRLHKDFTMB",
};

initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
