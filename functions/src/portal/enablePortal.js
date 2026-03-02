const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

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

module.exports = { enablePortal };
