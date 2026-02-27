const crypto = require("crypto");

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
// getPortalCustomToken
// Called by the portal page before any Firestore reads. Validates the token,
// then returns a Firebase custom token that signs the client in with a stable
// UID derived from their email address. The same UID is produced every time
// for the same email, so the client is automatically re-authenticated on any
// device without any extra sign-in step.
// ---------------------------------------------------------------------------
const getPortalCustomToken = onCall(async (request) => {
  const { token } = request.data;
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

  const project = snap.docs[0].data();
  const email = project.client_email ?? null;

  // Derive a stable UID from the client email. If there's no email on the
  // project (shouldn't happen in practice) fall back to a token-based UID.
  const seed = email ? `portal_email_${email.toLowerCase().trim()}` : `portal_token_${token}`;
  const uid = "portal_" + crypto.createHash("sha256").update(seed).digest("hex").slice(0, 28);

  const customToken = await admin.auth().createCustomToken(uid, { portal: true, email });

  return { customToken, uid };
});

// ---------------------------------------------------------------------------
// activatePortal
// Called by the portal web page when a client opens their link for the
// first time. Transitions the project status from "draft" → "active".
// Also writes/updates a portalSession doc keyed by the client's stable UID
// (one doc per email address, shared across all devices).
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

  // Record/update the portal session. The UID is stable per email, so this
  // doc is shared across all devices — we track all platforms seen as an
  // array union so no visit data is lost.
  if (request.auth) {
    const uid = request.auth.uid;
    const sessionRef = projectRef.collection("portalSessions").doc(uid);
    const sessionSnap = await sessionRef.get();
    const now = FieldValue.serverTimestamp();

    if (!sessionSnap.exists) {
      await sessionRef.set({
        uid,
        email: project.client_email ?? null,
        platforms: [platform],
        firstSeenAt: now,
        lastSeenAt: now,
      });
    } else {
      await sessionRef.update({
        lastSeenAt: now,
        platforms: FieldValue.arrayUnion(platform),
      });
    }
  }

  return { success: true };
});

// ---------------------------------------------------------------------------
// disablePortal
// Soft revoke — sets portalActive: false and deletes the Firebase Auth user
// so the custom token can no longer be exchanged. The portalToken is kept so
// the contractor can re-enable without resending an invite.
// ---------------------------------------------------------------------------
const disablePortal = onCall(async (request) => {
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

  // Flip the kill switch.
  await projectRef.update({ portalActive: false });

  // Delete the Firebase Auth user so the custom token can't be re-used.
  // Derive the same UID the client would have been signed in with.
  const email = project.client_email ?? null;
  if (email) {
    const seed = `portal_email_${email.toLowerCase().trim()}`;
    const uid = "portal_" + crypto.createHash("sha256").update(seed).digest("hex").slice(0, 28);
    await admin.auth().deleteUser(uid).catch(() => {
      // User may not exist yet (portal was never opened) — that's fine.
    });
  }

  return { success: true };
});

// ---------------------------------------------------------------------------
// enablePortal
// Re-enables a previously disabled portal. Just flips portalActive back to
// true — the Firebase Auth user will be recreated automatically on the next
// portal visit via getPortalCustomToken.
// ---------------------------------------------------------------------------
const enablePortal = onCall(async (request) => {
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

  if (!project.portalToken) {
    throw new HttpsError("failed-precondition", "No portal token — send an invite first.");
  }

  await projectRef.update({ portalActive: true });

  return { success: true };
});

// ---------------------------------------------------------------------------
// deletePortal
// Hard revoke — clears the portal token, deletes the Firebase Auth user, and
// removes all portalSession docs. The client's link is permanently dead.
// The contractor must send a new invite to share the portal again.
// ---------------------------------------------------------------------------
const deletePortal = onCall(async (request) => {
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

  // Delete Firebase Auth user.
  const email = project.client_email ?? null;
  if (email) {
    const seed = `portal_email_${email.toLowerCase().trim()}`;
    const uid = "portal_" + crypto.createHash("sha256").update(seed).digest("hex").slice(0, 28);
    await admin.auth().deleteUser(uid).catch(() => {});
  }

  // Delete all portalSession docs.
  const sessionsSnap = await projectRef.collection("portalSessions").get();
  const batch = db.batch();
  sessionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  // Clear the portal fields from the project.
  await projectRef.update({
    portalToken: admin.firestore.FieldValue.delete(),
    portalActive: admin.firestore.FieldValue.delete(),
  });

  return { success: true };
});

module.exports = {
  generatePortalToken,
  sendPortalInvite,
  getPortalCustomToken,
  activatePortal,
  disablePortal,
  enablePortal,
  deletePortal,
};
