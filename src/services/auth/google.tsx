import { getAuth } from "@/src/services/firebase";
import { GoogleAuthProvider } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "784107784111-fol4un4avfj9a4qj2bq0rr4oa2s0t2i5.apps.googleusercontent.com",
});

export async function login() {
  try {
    await GoogleSignin.hasPlayServices();
    const googleUser = await GoogleSignin.signIn();
    if (!googleUser || !googleUser.data) {
      // User cancelled sign-in
      return null;
    }
    const { idToken, user: googleProfile } = googleUser.data;
    if (!idToken) {
      throw new Error("Google Sign-In did not return an idToken");
    }
    const googleCredential = await GoogleAuthProvider.credential(idToken);
    const { user: firebaseUser } =
      await getAuth().signInWithCredential(googleCredential);

    const displayName =
      [googleProfile.givenName, googleProfile.familyName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      firebaseUser.displayName ||
      firebaseUser.email ||
      "User";

    return {
      id: firebaseUser.uid,
      displayName,
      email: firebaseUser.email,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function logout() {
  await GoogleSignin.signOut();
}
