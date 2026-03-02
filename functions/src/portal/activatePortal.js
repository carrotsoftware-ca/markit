const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

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
  const firstVisit = project.status === "draft";
  if (firstVisit) {
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

  // Emit a portal_opened activity event so the contractor's notification
  // trigger fires for contractors who have opted into portal_opened alerts.
  await projectRef.collection("activity").add({
    type: "portal_opened",
    actor: "client",
    authorId: request.auth?.uid ?? null,
    authorName: project.client_email ?? null,
    visibleTo: "contractor",
    payload: { platform, firstVisit },
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

module.exports = { activatePortal };
