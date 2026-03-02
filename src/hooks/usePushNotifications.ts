import { updateUser } from "@/src/services/user";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

// expo-notifications requires a development build — it is not available in Expo Go.
// Guard every call so the hook silently no-ops in Expo Go and on web.
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
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
  const router = useRouter();

  useEffect(() => {
    if (!userId || !SUPPORTED || !Device.isDevice) return;

    // Suppress notifications while the app is in the foreground — the user is
    // already looking at the app, so we don't need a banner.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
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
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        projectId?: string;
        type?: string;
      };
      if (!data?.projectId) return;

      // Route message notifications to the chat screen; everything else to
      // the project dashboard so the contractor can see what changed.
      if (data.type === "message") {
        router.push({
          pathname: "/(contractor)/projects/[projectId]/chat" as any,
          params: { projectId: data.projectId },
        });
      } else {
        router.push({
          pathname: "/(contractor)/projects/[projectId]" as any,
          params: { projectId: data.projectId },
        });
      }
    });

    return () => {
      cancelled = true;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);
}
