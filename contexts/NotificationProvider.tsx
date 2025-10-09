/*
2025-10-03 12:53:40
Just added deepLink handling to previouse PushTokenProvider.tsx

*/
// /app/contexts/NotificationProvider.tsx
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSupabase } from "./SupabaseProvider";
// import { usePathname, useRouter } from "expo-router";
import * as Linking from "expo-linking";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  isLoading: boolean;
  isCachedToken: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCachedToken, setIsCachedToken] = useState<boolean>(false);

  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { supabase } = useSupabase();
  // const pathname = usePathname();
  // const router = useRouter();

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    /** Initialize Push Token */
    const initializeNotifications = async () => {
      try {
        setIsLoading(true);

        // Get the push token (including cache status)
        const { token, isCached } = await registerForPushNotificationsAsync();

        if (isMounted) {
          console.log("Expo push_token", token);
          setExpoPushToken(token);
          setIsCachedToken(isCached);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.log("Error in initializeNotifications", err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeNotifications();

    /** Receive notifications in the foreground
     *  Notifications.addNotificationReceivedListener registers a listener
     *  for notifications received in the foreground,
     *  and returns an object to remove the listener.
     */
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    /** Receive notifications in the background
     *  and catch Tap event on the notification.
     *  Notifications.addNotificationResponseReceivedListener registers a listener
     *  for notifications received in the background,
     *  and returns an object to remove the listener.
     */
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(data, null, 2)
        );

        // Handle the deepLink
        if (data?.deepLink) {
          console.log("Navigating to deepLink:", data.deepLink);
          // @ts-ignore
          // router.push(data.deepLink); // expo-router routing
          Linking.openURL(data.deepLink);
        }
      });

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  /** Update the push_token in the Supabase users table */
  useEffect(() => {
    const updatePushToken = async () => {
      if (!expoPushToken || !user?.id || isLoading || isCachedToken) {
        if (isCachedToken) {
          console.log("Skipping DB update for cached token");
        }
        return;
      }

      try {
        const { error } = await supabase!
          .from("users")
          .update({
            push_token: expoPushToken,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user!.id);

        if (error) {
          console.error("Failed to update push token:", error);
        } else {
          console.log("Push token updated successfully");
        }
      } catch (error) {
        console.error("Error updating push token:", error);
      }
    };

    console.log("----------NotificationProvider-----------");
    // console.log("pathname", pathname);
    console.log("expoPushToken", expoPushToken);
    console.log("user?.id", user?.id);
    console.log("isSignedIn", isSignedIn);
    console.log("isCachedToken", isCachedToken);
    console.log("isLoading", isLoading);

    updatePushToken();
  }, [expoPushToken, user?.id, isCachedToken, isLoading]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error, isLoading, isCachedToken }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
