import { updateUser } from "@/src/services/user";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

// expo-notifications requires a development build — it is not available in Expo Go.
// Guard every call so the hook silently no-ops in Expo Go and on web.
const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const SUPPORTED = Platform.OS !== "web" && !IS_EXPO_GO;

/**
 * Registers the device for push notifications, persists the Expo push token
 * to the contractor's Firestore user doc, and wires up foreground + tap
 * notification listeners.
 *
 * Silently no-ops in Expo Go and on web — requires a development/production
 * build with the expo-notifications native module present.
 *
 * @param userId - The signed-in contractor's Firestore user ID. Pass null/undefined
 *                 when no contractor is logged in — the hook becomes a no-op.
 */
export function usePushNotifications(userId: string | null | undefined) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!userId || !SUPPORTED) return;

    // Configure foreground presentation — must be called before any listener
    // or token request, and only when the native module is actually present.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    let cancelled = false;

    async function register() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      // On Android a notification channel is required for heads-up alerts.
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
        // The handler above already shows the alert.
        // Add custom in-app UI handling here if needed.
      },
    );

    // Listen for the user tapping a notification.
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (_response) => {
        // Navigate to the relevant project when a notification is tapped.
        // Deep-link data: response.notification.request.content.data
      },
    );

    return () => {
      cancelled = true;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);
}
