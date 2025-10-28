import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyC5wTAUwLceMknO1EOhBkXvYGSIbF5So98",
  authDomain: "tutorlearnerdatabase.firebaseapp.com",
  projectId: "tutorlearnerdatabase",
  storageBucket: "tutorlearnerdatabase.firebasestorage.app",
  messagingSenderId: "1084021393378",
  appId: "1:1084021393378:web:794d114cc01f81b6ebdbbb",
  measurementId: "G-JM31KN45X6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
