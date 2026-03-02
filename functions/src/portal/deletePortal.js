const crypto = require("crypto");

const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

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
    await admin
      .auth()
      .deleteUser(uid)
      .catch(() => {});
  }

  // Delete all portalSession docs.
  const sessionsSnap = await projectRef.collection("portalSessions").get();
  const batch = db.batch();
  sessionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  // Clear the portal fields from the project.
  await projectRef.update({
    portalToken: FieldValue.delete(),
    portalActive: FieldValue.delete(),
  });

  return { success: true };
});

module.exports = { deletePortal };
