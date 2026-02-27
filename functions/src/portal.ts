import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { v4 as uuidv4 } from "uuid";

const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

// ---------------------------------------------------------------------------
// generatePortalToken
// Creates a UUID portal token for a project (idempotent — reuses existing).
// Returns { token, portalUrl }.
// ---------------------------------------------------------------------------
export const generatePortalToken = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in.");
  }

  const { projectId } = request.data as { projectId: string };
  if (!projectId) {
    throw new HttpsError("invalid-argument", "projectId is required.");
  }

  const db = admin.firestore();
  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) {
    throw new HttpsError("not-found", "Project not found.");
  }

  const project = projectSnap.data()!;

  // Only the project owner can generate a token
  if (project.ownerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Not your project.");
  }

  // Reuse existing token if present; otherwise generate a new one
  const token: string = project.portalToken ?? uuidv4();

  await projectRef.update({
    portalToken: token,
    portalActive: true,
  });

  const portalUrl = `https://markit.app/portal/${token}`;
  return { token, portalUrl };
});

// ---------------------------------------------------------------------------
// sendPortalInvite
// Generates a token (if needed) then emails the client via SendGrid.
// ---------------------------------------------------------------------------
export const sendPortalInvite = onCall({ secrets: [sendgridApiKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in.");
  }

  const { projectId } = request.data as { projectId: string };
  if (!projectId) {
    throw new HttpsError("invalid-argument", "projectId is required.");
  }

  const db = admin.firestore();
  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) {
    throw new HttpsError("not-found", "Project not found.");
  }

  const project = projectSnap.data()!;

  if (project.ownerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Not your project.");
  }

  if (!project.client_email) {
    throw new HttpsError("failed-precondition", "Project has no client email address.");
  }

  // Ensure token exists
  const token: string = project.portalToken ?? uuidv4();
  if (!project.portalToken) {
    await projectRef.update({ portalToken: token, portalActive: true });
  }

  const portalUrl = `https://markit.app/portal/${token}`;
  const contractorName =
    (await admin.auth().getUser(request.auth.uid)).displayName ?? "Your contractor";

  // Send email via SendGrid
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(sendgridApiKey.value());

  await sgMail.send({
    to: project.client_email,
    from: {
      email: "noreply@markit.app",
      name: "markit!",
    },
    subject: `${contractorName} shared a project with you — ${project.name}`,
    html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 28px; margin-bottom: 4px;">markit<span style="color:#FF6B00;">!</span></h1>
          <p style="color: #888; margin-top: 0;">Project Portal</p>

          <p style="font-size: 16px; margin-top: 24px;">
            Hi there,<br/><br/>
            <strong>${contractorName}</strong> has shared a project with you:
            <strong>${project.name}</strong>.
          </p>

          <p style="font-size: 16px;">
            Click below to view your project measurements and files.
          </p>

          <a href="${portalUrl}"
             style="display:inline-block; margin-top: 16px; padding: 14px 28px;
                    background-color: #FF6B00; color: white; text-decoration: none;
                    border-radius: 8px; font-size: 16px; font-weight: bold;">
            View Project
          </a>

          <p style="margin-top: 32px; font-size: 13px; color: #aaa;">
            This link is unique to you. Do not share it.<br/>
            If you did not expect this email, you can safely ignore it.
          </p>
        </div>
      `,
  });

  return { success: true, portalUrl };
});
