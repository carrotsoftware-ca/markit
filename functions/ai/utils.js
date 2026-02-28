/**
 * Shared utilities for all AI file-analysis handlers.
 */

/**
 * Parses the storage path and returns { projectId, fileId }.
 *
 * Matches paths written by uploadProjectFile:
 *   projects/{projectId}/{fileId}
 *
 * Returns null if the path doesn't match — the caller should return early.
 */
function extractFileIds(filePath) {
  const match = filePath.match(/^projects\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { projectId: match[1], fileId: match[2] };
}

/**
 * Returns a short-lived signed URL for a Storage file so Gemini can fetch it.
 * Expires in 10 minutes — enough time for any Gemini processing job.
 */
async function getSignedUrl(bucket, filePath) {
  const [url] = await bucket.file(filePath).getSignedUrl({
    action: "read",
    expires: Date.now() + 10 * 60 * 1000,
  });
  return url;
}

/**
 * Strips markdown code fences Gemini occasionally wraps around JSON,
 * then parses and returns the object.
 * Throws if the text is not valid JSON.
 */
function parseGeminiJson(rawText) {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "");
  return JSON.parse(cleaned);
}

/**
 * Merges `data` into the Firestore file doc at
 *   projects/{projectId}/files/{fileId}
 */
async function updateFileDoc(db, projectId, fileId, data) {
  await db
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .doc(fileId)
    .set(data, { merge: true });
}

module.exports = { extractFileIds, getSignedUrl, parseGeminiJson, updateFileDoc };
