// Use Firebase JS SDK for web Google sign-in
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export async function login() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const displayName =
      firebaseUser.displayName || firebaseUser.email || "User";
    return {
      id: firebaseUser.uid,
      displayName,
      email: firebaseUser.email,
    };
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      // User closed the popup, treat as cancel
      return null;
    }
    throw error;
  }
}

export async function logout() {
  const auth = getAuth();
  await signOut(auth);
}
