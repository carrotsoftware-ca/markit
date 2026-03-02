const crypto = require("crypto");

const admin = require("firebase-admin");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

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

module.exports = { getPortalCustomToken };
