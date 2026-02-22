// Firebase web initialization
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDz9fLK9r-XPijmsIPdxWp1YvIzjdqaqlQ",
  authDomain: "markit-fb8ef.firebaseapp.com",
  projectId: "markit-fb8ef",
  storageBucket: "markit-fb8ef.firebasestorage.app",
  messagingSenderId: "784107784111",
  appId: "1:784107784111:web:f4b80165652897cfdf115a",
  measurementId: "G-YD6H75QCMN"
};

// Only initialize if not already initialized
if (getApps().length === 0) {
  const app = initializeApp(firebaseConfig);
  if (typeof window !== "undefined") {
    getAnalytics(app);
  }
}
