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
