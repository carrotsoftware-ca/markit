const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// ---------------------------------------------------------------------------
// notificationMeta
// Human-readable title + body for each ActivityEventType that can be
// delivered as a push notification.  Only types listed here are sent.
// ---------------------------------------------------------------------------
function notificationMeta(type, payload) {
  switch (type) {
    case "message":
      return {
        title: "New message",
        body: payload.text ? String(payload.text).slice(0, 100) : "Your client sent a message.",
      };
    case "file_uploaded":
      return {
        title: "File uploaded",
        body: payload.filename ? `${payload.filename} was added.` : "A new file was added.",
      };
    case "portal_opened":
      return {
        title: "Portal opened",
        body: payload.firstVisit
          ? "Your client opened their portal for the first time! 🎉"
          : "Your client viewed their portal.",
      };
    case "portal_file_uploaded":
      return {
        title: "Client uploaded a file",
        body: payload.filename
          ? `${payload.filename} was added by your client.`
          : "Your client added a file.",
      };
    case "portal_file_deleted":
      return {
        title: "Client deleted a file",
        body: payload.filename
          ? `${payload.filename} was removed by your client.`
          : "Your client removed a file.",
      };
    default:
      return null; // Don't send a push for this type
  }
}

// ---------------------------------------------------------------------------
// sendPushNotification
// Triggered whenever a new activity doc is created in:
//   projects/{projectId}/activity/{activityId}
//
// Looks up the project owner, checks their notificationTypes preference and
// expoPushToken, then delivers an Expo push notification if all conditions
// are met.
// ---------------------------------------------------------------------------
exports.sendPushNotification = onDocumentCreated(
  "projects/{projectId}/activity/{activityId}",
  async (event) => {
    const activity = event.data?.data();
    if (!activity) return;

    const { projectId } = event.params;
    const { type, payload = {}, visibleTo, authorId } = activity;

    // Only notify for contractor-visible events.
    if (visibleTo !== "contractor" && visibleTo !== "all") return;

    const meta = notificationMeta(type, payload);
    if (!meta) return;

    const db = admin.firestore();

    // Fetch the project to find the owner.
    const projectSnap = await db.collection("projects").doc(projectId).get();
    if (!projectSnap.exists) return;

    const { ownerId } = projectSnap.data();
    if (!ownerId) return;

    // Don't notify the contractor about their own actions.
    if (authorId && authorId === ownerId) return;

    // Check the project's notification preferences before fetching the user.
    const { notificationTypes = [] } = projectSnap.data();
    if (!notificationTypes.includes(type)) return;

    // Fetch the owner's user doc to get their push token.
    const userSnap = await db.collection("users").doc(ownerId).get();
    if (!userSnap.exists) return;

    const { expoPushToken } = userSnap.data();
    if (!expoPushToken) return;

    // Deliver via Expo Push API.
    const message = {
      to: expoPushToken,
      sound: "default",
      title: meta.title,
      body: meta.body,
      data: { projectId, type, payload },
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(
        `[sendPushNotification] Expo push failed for project ${projectId}:`,
        await response.text(),
      );
    }
  },
);
