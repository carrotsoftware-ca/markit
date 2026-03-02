const crypto = require("crypto");

const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

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
    await admin
      .auth()
      .deleteUser(uid)
      .catch(() => {
        // User may not exist yet (portal was never opened) — that's fine.
      });
  }

  return { success: true };
});

module.exports = { disablePortal };
