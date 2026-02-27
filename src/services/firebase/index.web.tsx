// firebase.web.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import "firebase/compat/storage";

const host = process.env.EXPO_PUBLIC_EMULATOR_HOST;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();

if (__DEV__) {
  app.auth().useEmulator(`http://${host}:9099`);
  app.functions().useEmulator(host, 5001);
  app.firestore().useEmulator(host, 8080);
  app.storage().useEmulator(host, 9199);
}
export const FirestoreFieldValue = firebase.firestore.FieldValue;
export const getAuth = () => app.auth();
export const getFirestore = () => app.firestore();
export const getFunctions = () => app.functions();
export const getStorage = () => app.storage();
