const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { extractFileIds } = require("./utils");
const { handleVideo } = require("./video");
const { handleImage } = require("./image");

/**
 * Triggered whenever a file is finalised in Cloud Storage.
 *
 * Storage path written by uploadProjectFile:
 *   projects/{projectId}/{fileId}
 *
 * Routes to the appropriate handler based on MIME type.
 * New file types can be added here without touching existing handlers.
 */
exports.analyseProjectFile = onObjectFinalized({ secrets: ["GEMINI_API_KEY"] }, async (event) => {
  const filePath = event.data.name;
  const contentType = event.data.contentType ?? "";

  // Only process files under projects/{projectId}/{fileId}
  const ids = extractFileIds(filePath);
  if (!ids) return;

  const { projectId, fileId } = ids;

  try {
    if (contentType.startsWith("video/")) {
      return await handleVideo(event, projectId, fileId);
    }

    if (contentType.startsWith("image/")) {
      return await handleImage(event, projectId, fileId);
    }

    // All other types (PDFs, documents, etc.) — no AI processing yet
  } catch (err) {
    console.error(`analyseProjectFile error [${contentType}] ${filePath}:`, err);

    // Best-effort: mark the file doc so the UI can surface the error
    try {
      const admin = require("firebase-admin");
      const { updateFileDoc } = require("./utils");
      await updateFileDoc(admin.firestore(), projectId, fileId, {
        aiStatus: "error",
        aiError: err.message ?? "Unknown error",
      });
    } catch {
      // firestore write failed too — nothing more we can do
    }
  }
});
