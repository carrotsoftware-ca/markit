import { getAuth } from "@/src/services/firebase";

/*
dummy google account
playstore@markitquote.com
XHKyd0xezMuCpVBpEv8R
*/

export async function login({ email, password }: { email: string; password: string }) {
  const userCredential = await getAuth().signInWithEmailAndPassword(email, password);
  const user = userCredential.user;
  return {
    id: user.uid,
    displayName: user.displayName ?? email.split("@")[0],
    email: user.email,
  };
}

export async function register({ email, password }: { email: string; password: string }) {
  const userCredential = await getAuth().createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  return {
    id: user.uid,
    displayName: user.displayName ?? email.split("@")[0],
    email: user.email,
  };
}

export async function sendPasswordReset(email: string) {
  await getAuth().sendPasswordResetEmail(email);
}

export async function logout() {
  await getAuth().signOut();
}
