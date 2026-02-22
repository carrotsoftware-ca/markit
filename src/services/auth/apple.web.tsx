import {
  getAuth,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const provider = new OAuthProvider("apple.com");
provider.addScope("email");
provider.addScope("name");

export async function login() {
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return {
      id: user.uid,
      displayName: user.displayName || user.email || "User",
      email: user.email,
    };
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      return null;
    }
    throw error;
  }
}

export async function logout() {
  const auth = getAuth();
  await signOut(auth);
}
