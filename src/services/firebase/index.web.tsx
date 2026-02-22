// Firebase web initialization
import { getAnalytics } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const host = process.env.EXPO_PUBLIC_EMULATOR_HOST ?? "localhost";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialize if not already initialized
if (getApps().length === 0) {
  const app = initializeApp(firebaseConfig);
  console.log(app);
  if (typeof window !== "undefined") {
    getAnalytics(app);
  }

  if (__DEV__) {
    connectAuthEmulator(getAuth(), `http://${host}:9099`, {
      disableWarnings: true,
    });
    connectFunctionsEmulator(getFunctions(), host, 5001);
    connectFirestoreEmulator(getFirestore(), host, 8080);
    connectStorageEmulator(getStorage(), host, 9199);
  }
}

// Export auth instance for use in the app
export { getAuth, getFirestore, getFunctions, getStorage };
