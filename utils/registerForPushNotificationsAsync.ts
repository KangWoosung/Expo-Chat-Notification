/*
2025-07-12 22:59:10

Utility function for registering and caching push_token for push notifications.

1. Set up the notification channel for Android
2. Check if the device is a physical device
3. Check if the user has granted permission to receive push notifications
4. Get the project ID from the Expo config
5. Get the push_token from the Expo Push Notification
6. Cache the push_token
7. Return the push_token and whether it is cached

*/
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const PUSH_TOKEN_KEY = "expo_push_token";
const PUSH_TOKEN_TIMESTAMP_KEY = "expo_push_token_timestamp";
const TOKEN_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function registerForPushNotificationsAsync(): Promise<{
  token: string;
  isCached: boolean;
}> {
  // Check if there is a cached token
  const cachedToken = await getCachedPushToken();
  if (cachedToken) {
    return { token: cachedToken, isCached: true };
  }

  // Check if the device is a physical device
  if (!Device.isDevice) {
    throw new Error("Must use physical device for push notifications");
  }

  // Set up the notification channel for Android
  await setupAndroidNotificationChannel();

  // Check if the user has granted permission to receive push notifications
  await requestNotificationPermissions();

  // Get the project ID from the Expo config
  const projectId = getProjectId();

  // Get the push token for the project
  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    // Cache the new token
    await cachePushToken(pushTokenString);

    console.log(pushTokenString);
    return { token: pushTokenString, isCached: false };
  } catch (e: unknown) {
    throw new Error(`${e}`);
  }
}

/**
 * Get the cached push token.
 * @returns The cached token if it is valid, otherwise null
 */
async function getCachedPushToken(): Promise<string | null> {
  try {
    const cachedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    const tokenTimestamp = await AsyncStorage.getItem(PUSH_TOKEN_TIMESTAMP_KEY);

    if (!cachedToken || !tokenTimestamp) {
      return null;
    }

    const now = Date.now();
    const tokenAge = now - parseInt(tokenTimestamp);

    if (tokenAge < TOKEN_CACHE_DURATION) {
      console.log("Using cached push token");
      return cachedToken;
    }

    return null;
  } catch (error) {
    console.log("Failed to get cached token:", error);
    return null;
  }
}

/**
 * Cache the push token in local storage.
 * @param token The push token to cache
 */
async function cachePushToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    await AsyncStorage.setItem(PUSH_TOKEN_TIMESTAMP_KEY, Date.now().toString());
    console.log("New push token cached");
  } catch (error) {
    console.log("Failed to cache push token:", error);
  }
}

/**
 * Set up the notification channel for Android.
 */
async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

/**
 * Check if the user has granted permission to receive push notifications and request it.
 */
async function requestNotificationPermissions(): Promise<void> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error(
      "Permission not granted to get push token for push notification!"
    );
  }
}

/**
 * Get the Expo project ID.
 */
function getProjectId(): string {
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error("Project ID not found");
  }

  return projectId;
}
