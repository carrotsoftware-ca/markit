const admin = require("firebase-admin");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { v4: uuidv4 } = require("uuid");

const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

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

module.exports = { sendPortalInvite };
