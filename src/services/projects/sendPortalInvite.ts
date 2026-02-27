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
 * Calls the activatePortal Cloud Function.
 * Transitions the project status from "draft" → "active" when the client
 * first opens their portal link. Safe to call multiple times — only acts
 * when the project is still in draft.
 */
export async function activatePortal(token: string): Promise<void> {
  await getFunctions().httpsCallable("activatePortal")({ token });
}
