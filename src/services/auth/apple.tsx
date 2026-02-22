import { AppleAuthProvider, getAuth } from "@react-native-firebase/auth";
import crashlytics from "@react-native-firebase/crashlytics";
import * as AppleAuthentication from "expo-apple-authentication";

export async function login() {
  try {
    const response = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const { identityToken, nonce } = response;
    if (!identityToken) {
      throw new Error(
        "🍎[AppleProvider] Sign-In failed - no identify token returned",
      );
    }

    const firstName = response.fullName?.givenName ?? "";
    const lastName = response.fullName?.familyName ?? "";
    const displayName = [firstName, lastName].filter(Boolean).join(" ");

    const appleCredentials = AppleAuthProvider.credential(identityToken, nonce);
    const { user } = await getAuth().signInWithCredential(appleCredentials);

    if (!user) {
      crashlytics().log(
        "🍎[AppleProvider] signInWithCredential returned undefined or missing user",
      );
      throw new Error("Apple sign-in failed: No user returned from Firebase");
    }
    return {
      id: user.uid,
      displayName: displayName || user.displayName || user.email || "User",
      email: user.email,
    };
  } catch (error: any) {
    if (error.code === "ERR_REQUEST_CANCELED") {
      return null;
    }
    crashlytics().recordError(error);
    throw error;
  }
}

export async function logout() {
  // TODO: Implement Apple sign-out logic
}
