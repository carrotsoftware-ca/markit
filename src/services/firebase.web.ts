import { getAnalytics } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDz9fLK9r-XPijmsIPdxWp1YvIzjdqaqlQ",
  authDomain: "markit-fb8ef.firebaseapp.com",
  projectId: "markit-fb8ef",
  storageBucket: "markit-fb8ef.appspot.com",
  messagingSenderId: "784107784111",
  appId: "1:784107784111:web:f4b80165652897cfdf115a",
  measurementId: "G-YD6H75QCMN",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
getAnalytics(app);
