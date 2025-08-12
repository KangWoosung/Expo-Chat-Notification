import { View, Text } from "react-native";
import React from "react";
import { usePushToken } from "@/contexts/PushTokenProvider";
import { ThemedText } from "@/components/ThemedText";

const index = () => {
  const { expoPushToken, notification, error, isLoading, isCachedToken } =
    usePushToken();

  return (
    <View
      className="flex-1 items-center justify-center gap-4
    bg-background dark:bg-background-dark"
    >
      <Text className="text-foreground dark:text-foreground-dark">
        index......
      </Text>

      {isLoading ? (
        <Text className="text-foreground dark:text-foreground-dark">
          Loading...
        </Text>
      ) : error ? (
        <Text className="text-foreground dark:text-foreground-dark">
          Error: {error.message}
        </Text>
      ) : (
        <>
          <Text className="text-foreground dark:text-foreground-dark">
            Token: {expoPushToken?.substring(0, 20)}...
          </Text>
          <Text className="text-foreground dark:text-foreground-dark">
            Cache Status: {isCachedToken ? "Cached" : "Fresh"}
          </Text>
          {notification && (
            <Text className="text-foreground dark:text-foreground-dark">
              Latest: {notification.request.content.title}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

export default index;
