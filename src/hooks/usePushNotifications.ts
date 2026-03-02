import { updateUser } from "@/src/services/user";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

// Show alerts, play sounds and set badge count while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers the device for push notifications, persists the Expo push token
 * to the contractor's Firestore user doc, and wires up foreground + tap
 * notification listeners.
 *
 * Call this once from the root layout when the contractor is signed in.
 *
 * @param userId - The signed-in contractor's Firestore user ID. Pass null/undefined
 *                 when no contractor is logged in — the hook becomes a no-op.
 */
export function usePushNotifications(userId: string | null | undefined) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!userId || Platform.OS === "web") return;

    let cancelled = false;

    async function register() {
      // Expo push notifications require a physical device.
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      // On Android, a notification channel is required for heads-up alerts.
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B00",
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      if (cancelled) return;

      // Persist the token so the Cloud Function can address this device.
      await updateUser(userId, { expoPushToken: tokenData.data }).catch(() => {});
    }

    register();

    // Listen for notifications received while the app is foregrounded.
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // The notification handler above already shows the alert.
        // Add any custom in-app UI handling here if needed.
      },
    );

    // Listen for the user tapping a notification.
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (_response) => {
        // Navigate to the relevant project when a notification is tapped.
        // Deep-link data can be read from:
        //   response.notification.request.content.data
      },
    );

    return () => {
      cancelled = true;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);
}
