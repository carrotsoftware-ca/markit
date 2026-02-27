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
