"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPortalInvite = exports.generatePortalToken = void 0;
const admin = __importStar(require("firebase-admin"));
const params_1 = require("firebase-functions/params");
const https_1 = require("firebase-functions/v2/https");
const uuid_1 = require("uuid");
const sendgridApiKey = (0, params_1.defineSecret)("SENDGRID_API_KEY");
// ---------------------------------------------------------------------------
// generatePortalToken
// Creates a UUID portal token for a project (idempotent — reuses existing).
// Returns { token, portalUrl }.
// ---------------------------------------------------------------------------
exports.generatePortalToken = (0, https_1.onCall)(async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const { projectId } = request.data;
    if (!projectId) {
        throw new https_1.HttpsError("invalid-argument", "projectId is required.");
    }
    const db = admin.firestore();
    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
        throw new https_1.HttpsError("not-found", "Project not found.");
    }
    const project = projectSnap.data();
    // Only the project owner can generate a token
    if (project.ownerId !== request.auth.uid) {
        throw new https_1.HttpsError("permission-denied", "Not your project.");
    }
    // Reuse existing token if present; otherwise generate a new one
    const token = (_a = project.portalToken) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)();
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
exports.sendPortalInvite = (0, https_1.onCall)({ secrets: [sendgridApiKey] }, async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const { projectId } = request.data;
    if (!projectId) {
        throw new https_1.HttpsError("invalid-argument", "projectId is required.");
    }
    const db = admin.firestore();
    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
        throw new https_1.HttpsError("not-found", "Project not found.");
    }
    const project = projectSnap.data();
    if (project.ownerId !== request.auth.uid) {
        throw new https_1.HttpsError("permission-denied", "Not your project.");
    }
    if (!project.client_email) {
        throw new https_1.HttpsError("failed-precondition", "Project has no client email address.");
    }
    // Ensure token exists
    const token = (_a = project.portalToken) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)();
    if (!project.portalToken) {
        await projectRef.update({ portalToken: token, portalActive: true });
    }
    const portalUrl = `https://markit.app/portal/${token}`;
    const contractorName = (_b = (await admin.auth().getUser(request.auth.uid)).displayName) !== null && _b !== void 0 ? _b : "Your contractor";
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
//# sourceMappingURL=portal.js.map