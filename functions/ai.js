const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

/**
 * Triggered when a file is uploaded to Cloud Storage.
 *
 * Expected upload path:
 *   projects/{projectId}/videos/{filename}
 *
 * On completion, writes to:
 *   Firestore: projects/{projectId}/videos/{videoId}
 *     - status: "analysed" | "error"
 *     - transcript: string
 *     - categories: string[]
 *     - summary: string
 *     - analysedAt: Timestamp
 */
exports.analyseProjectVideo = onObjectFinalized({ secrets: ["GEMINI_API_KEY"] }, async (event) => {
  const filePath = event.data.name; // e.g. projects/abc123/videos/walkthrough.mp4
  const contentType = event.data.contentType ?? "";

  // Only process video uploads under projects/{projectId}/videos/
  if (!contentType.startsWith("video/")) return;
  const match = filePath.match(/^projects\/([^/]+)\/videos\/(.+)$/);
  if (!match) return;

  const projectId = match[1];
  const fileName = match[2];
  // Use the filename (without extension) as the Firestore doc ID
  const videoId = fileName.replace(/\.[^.]+$/, "");

  const db = admin.firestore();
  const videoRef = db.collection("projects").doc(projectId).collection("videos").doc(videoId);

  try {
    // Mark as processing so the client can show a spinner
    await videoRef.set(
      {
        fileName,
        filePath,
        status: "processing",
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // ── Gemini ────────────────────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build a signed URL so Gemini can fetch the video directly
    const bucket = admin.storage().bucket(event.data.bucket);
    const [signedUrl] = await bucket.file(filePath).getSignedUrl({
      action: "read",
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const prompt = `
You are an expert home-renovation analyst. The following video is a homeowner 
walking through their property and describing renovation work they want done.

Your task:
1. Transcribe what the homeowner says (be concise, not verbatim).
2. Identify and list the renovation categories mentioned 
  (e.g. Kitchen, Bathroom, Flooring, Painting, Plumbing, Electrical, 
  Roofing, Windows & Doors, Landscaping, General Repairs, etc.).
3. Write a short summary (2–4 sentences) a contractor can read at a glance.

Return ONLY valid JSON in this exact shape — no markdown, no extra text:
{
  "transcript": "<concise transcript>",
  "categories": ["<category1>", "<category2>"],
  "summary": "<contractor-facing summary>"
}
`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: contentType,
          fileUri: signedUrl,
        },
      },
      { text: prompt },
    ]);

    const raw = result.response.text().trim();

    // Strip possible markdown code fences Gemini sometimes adds
    const jsonText = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonText);

    await videoRef.set(
      {
        status: "analysed",
        transcript: parsed.transcript ?? "",
        categories: parsed.categories ?? [],
        summary: parsed.summary ?? "",
        analysedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("analyseProjectVideo error:", err);
    await videoRef.set(
      {
        status: "error",
        error: err.message ?? "Unknown error",
      },
      { merge: true },
    );
  }
});
