import { getFunctions } from "@/src/services/firebase";

/**
 * Calls the sendPortalInvite Cloud Function.
 * Generates a portal token if one doesn't exist, then emails the client.
 * Returns the portal URL on success.
 */
export async function sendPortalInvite(projectId: string): Promise<string> {
  const result = await getFunctions().httpsCallable("sendPortalInvite")({ projectId });
  return (result.data as { portalUrl: string }).portalUrl;
}

/**
 * Calls the generatePortalToken Cloud Function.
 * Returns the portal URL without sending an email — useful for the kill switch toggle.
 */
export async function generatePortalToken(projectId: string): Promise<string> {
  const result = await getFunctions().httpsCallable("generatePortalToken")({ projectId });
  return (result.data as { portalUrl: string }).portalUrl;
}

/**
 * Calls the getPortalCustomToken Cloud Function.
 * Validates the portal token and returns a Firebase custom token that signs
 * the client in with a stable UID derived from their email address. The same
 * UID is produced on every device, so the session is automatically restored
 * when the client reopens the link on a different device.
 */
export async function getPortalCustomToken(token: string): Promise<string> {
  const result = await getFunctions().httpsCallable("getPortalCustomToken")({ token });
  return (result.data as { customToken: string }).customToken;
}

/**
 * Calls the activatePortal Cloud Function.
 * Transitions the project status from "draft" → "active" when the client
 * first opens their portal link. Also records a portalSession for this device.
 * Safe to call multiple times — only transitions status when still in draft.
 */
export async function activatePortal(
  token: string,
  platform: "web" | "ios" | "android" = "web",
): Promise<void> {
  await getFunctions().httpsCallable("activatePortal")({ token, platform });
}

/**
 * Soft-revokes the portal. Sets portalActive: false and deletes the Firebase
 * Auth user so the custom token can no longer be exchanged. The portalToken
 * is preserved so the contractor can re-enable without resending an invite.
 */
export async function disablePortal(projectId: string): Promise<void> {
  await getFunctions().httpsCallable("disablePortal")({ projectId });
}

/**
 * Re-enables a previously disabled portal. The Firebase Auth user will be
 * recreated automatically on the client's next portal visit.
 */
export async function enablePortal(projectId: string): Promise<void> {
  await getFunctions().httpsCallable("enablePortal")({ projectId });
}

/**
 * Hard-deletes the portal. Clears the portal token, deletes the Firebase Auth
 * user and all portalSession docs. The client's link is permanently dead.
 * The contractor must send a new invite to share the portal again.
 */
export async function deletePortal(projectId: string): Promise<void> {
  await getFunctions().httpsCallable("deletePortal")({ projectId });
}
