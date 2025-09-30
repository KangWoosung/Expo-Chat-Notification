/*
2025-07-12 22:59:10


*/

import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { useAuth, useUser } from "@clerk/clerk-expo";
// import { Subscription } from "expo-modules-core";
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
import { usePathname } from "expo-router";

interface PushTokenContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  isLoading: boolean;
  isCachedToken: boolean; // 캐시된 토큰인지 여부
}

const PushTokenContext = createContext<PushTokenContextType | undefined>(
  undefined
);

export const usePushToken = () => {
  const context = useContext(PushTokenContext);
  if (context === undefined) {
    throw new Error("usePushToken must be used within a PushTokenProvider");
  }
  return context;
};

interface PushTokenProviderProps {
  children: ReactNode;
}

export const PushTokenProvider: React.FC<PushTokenProviderProps> = ({
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
  const pathname = usePathname();

  const { supabase } = useSupabase();

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeNotifications = async () => {
      try {
        setIsLoading(true);

        // 토큰 가져오기 (캐시 여부 확인 포함)
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

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        // Handle the notification response here
      });

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    const updatePushToken = async () => {
      // If the push token is not available, the user is not authenticated,
      // or the loading state is true, or the cached token is true,
      // skip the DB update
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

    console.log("----------PushTokenProvider-----------");
    console.log("pathname", pathname);
    console.log("expoPushToken", expoPushToken);
    console.log("user?.id", user?.id);
    console.log("isSignedIn", isSignedIn);
    console.log("isCachedToken", isCachedToken);
    console.log("isLoading", isLoading);

    updatePushToken();
  }, [expoPushToken, user?.id, isCachedToken, isLoading]);

  return (
    <PushTokenContext.Provider
      value={{ expoPushToken, notification, error, isLoading, isCachedToken }}
    >
      {children}
    </PushTokenContext.Provider>
  );
};
