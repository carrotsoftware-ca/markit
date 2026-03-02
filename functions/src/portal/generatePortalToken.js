const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { v4: uuidv4 } = require("uuid");

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
  z;
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

module.exports = { generatePortalToken };
