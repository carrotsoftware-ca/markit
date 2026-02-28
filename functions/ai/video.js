const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const { getSignedUrl, parseGeminiJson, updateFileDoc } = require("./utils");

const PROMPT = `
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

/**
 * Analyses a video file with Gemini and writes the results back to the
 * corresponding Firestore file doc.
 *
 * @param {object} event  - Cloud Storage onObjectFinalized event
 * @param {string} projectId
 * @param {string} fileId
 */
async function handleVideo(event, projectId, fileId) {
  const db = admin.firestore();
  const { contentType } = event.data;
  const filePath = event.data.name;

  // Mark as processing so the client can show a spinner immediately
  await updateFileDoc(db, projectId, fileId, {
    aiStatus: "processing",
  });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const bucket = admin.storage().bucket(event.data.bucket);
  const signedUrl = await getSignedUrl(bucket, filePath);

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: contentType,
        fileUri: signedUrl,
      },
    },
    { text: PROMPT },
  ]);

  const parsed = parseGeminiJson(result.response.text());

  await updateFileDoc(db, projectId, fileId, {
    aiStatus: "analysed",
    transcript: parsed.transcript ?? "",
    categories: parsed.categories ?? [],
    summary: parsed.summary ?? "",
    analysedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Emit a system event so the activity feed shows the AI result
  await db
    .collection("projects")
    .doc(projectId)
    .collection("activity")
    .add({
      type: "video_analysed",
      actor: "system",
      authorId: null,
      authorName: null,
      visibleTo: "all",
      payload: {
        fileId,
        categories: parsed.categories ?? [],
        summary: parsed.summary ?? "",
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

module.exports = { handleVideo };
