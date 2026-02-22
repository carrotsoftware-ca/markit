// Use Firebase JS SDK for web Google sign-in
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

export async function login() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  // Normalize user object if needed
  return {
    user: result.user,
    credential: GoogleAuthProvider.credentialFromResult(result),
  };
}

export async function logout() {
  const auth = getAuth();
  await signOut(auth);
}
