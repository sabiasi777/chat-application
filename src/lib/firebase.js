import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-ad7cd.firebaseapp.com",
  projectId: "reactchat-ad7cd",
  storageBucket: "reactchat-ad7cd.appspot.com",
  messagingSenderId: "572994670011",
  appId: "1:572994670011:web:a849c77cd8ab61efee089e"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()