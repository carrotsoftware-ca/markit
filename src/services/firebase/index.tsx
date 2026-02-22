import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import functions from "@react-native-firebase/functions";
import storage from "@react-native-firebase/storage";

// Silence deprecation warnings for namespaced API
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

const host = process.env.EXPO_PUBLIC_EMULATOR_HOST ?? "localhost";

// Initialize Firebase if needed
if (!firebase.apps.length) {
  firebase.initializeApp();
}

if (__DEV__) {
  auth().useEmulator(`http://${host}:9099`);
  functions().useEmulator(host, 5001);
  firestore().useEmulator(host, 8080);
  storage().useEmulator(host, 9199);
}

// Export getters for use in the app
export const getAuth = () => auth();
export const getFirestore = () => firestore();
export const getFunctions = () => functions();
export const getStorage = () => storage();
