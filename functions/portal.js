const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { v4: uuidv4 } = require("uuid");

const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

// ---------------------------------------------------------------------------
// generatePortalToken
// Creates a UUID portal token for a project (idempotent — reuses existing).
// Returns { token, portalUrl }.
// ---------------------------------------------------------------------------
const generatePortalToken = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in.");
  }

  const { projectId } = request.data;
  if (!projectId) {
    throw new HttpsError("invalid-argument", "projectId is required.");
  }

  const db = admin.firestore();
  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) {
    throw new HttpsError("not-found", "Project not found.");
  }

  const project = projectSnap.data();

  if (project.ownerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Not your project.");
  }

  const token = project.portalToken ?? uuidv4();

  await projectRef.update({
    portalToken: token,
    portalActive: true,
  });

  const portalUrl = `https://markitquote.com/portal/${token}`;
  return { token, portalUrl };
});

// ---------------------------------------------------------------------------
// sendPortalInvite
// Generates a token (if needed) then emails the client via SendGrid.
// ---------------------------------------------------------------------------
const sendPortalInvite = onCall({ secrets: [sendgridApiKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in.");
  }

  const { projectId } = request.data;
  if (!projectId) {
    throw new HttpsError("invalid-argument", "projectId is required.");
  }

  const db = admin.firestore();
  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) {
    throw new HttpsError("not-found", "Project not found.");
  }

  const project = projectSnap.data();

  if (project.ownerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Not your project.");
  }

  if (!project.client_email) {
    throw new HttpsError("failed-precondition", "Project has no client email address.");
  }

  const token = project.portalToken ?? uuidv4();
  if (!project.portalToken) {
    await projectRef.update({ portalToken: token, portalActive: true });
  }

  const portalUrl = `https://markitquote.com/portal/${token}`;
  const contractorUser = await admin.auth().getUser(request.auth.uid);
  const contractorName = contractorUser.displayName ?? "Your contractor";

  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(sendgridApiKey.value().trim());

  await sgMail.send({
    to: project.client_email,
    from: {
      email: "info@markitquote.com",
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

// ---------------------------------------------------------------------------
// activatePortal
// Called by the portal web page when a client opens their link for the
// first time. Transitions the project status from "draft" → "active".
// Also writes a portalSession doc keyed by the caller's anon UID so we
// can track which devices/clients have accessed the portal.
// ---------------------------------------------------------------------------
const activatePortal = onCall(async (request) => {
  const { token, platform = "web" } = request.data;
  if (!token) {
    throw new HttpsError("invalid-argument", "token is required.");
  }

  const db = admin.firestore();
  const snap = await db
    .collection("projects")
    .where("portalToken", "==", token)
    .where("portalActive", "==", true)
    .limit(1)
    .get();

  if (snap.empty) {
    throw new HttpsError("not-found", "Invalid or revoked portal token.");
  }

  const projectRef = snap.docs[0].ref;
  const project = snap.docs[0].data();

  // Only transition draft → active; don't touch completed projects.
  if (project.status === "draft") {
    await projectRef.update({ status: "active" });
  }

  // Record the portal session for this device if the caller is authenticated
  // (i.e. signed in anonymously). Unauthenticated calls still work but won't
  // record a session — this is a graceful fallback only.
  if (request.auth) {
    const uid = request.auth.uid;
    const sessionRef = projectRef.collection("portalSessions").doc(uid);
    const sessionSnap = await sessionRef.get();
    const now = FieldValue.serverTimestamp();

    if (!sessionSnap.exists) {
      // First visit on this device — create the session doc.
      await sessionRef.set({
        uid,
        email: project.client_email ?? null,
        platform,
        firstSeenAt: now,
        lastSeenAt: now,
      });
    } else {
      // Returning visit — just update the last seen timestamp.
      await sessionRef.update({ lastSeenAt: now });
    }
  }

  return { success: true };
});

module.exports = { generatePortalToken, sendPortalInvite, activatePortal };
