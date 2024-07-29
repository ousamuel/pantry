// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiCHSzQy-D0aVQJbiYaxp1e95J5jMHiZU",
  authDomain: "pantry-1a23a.firebaseapp.com",
  projectId: "pantry-1a23a",
  storageBucket: "pantry-1a23a.appspot.com",
  messagingSenderId: "190689371100",
  appId: "1:190689371100:web:8ba25526fb9291b617e519"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };