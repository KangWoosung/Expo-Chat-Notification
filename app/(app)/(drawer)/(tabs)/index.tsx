import { View, Text } from "react-native";
import React from "react";
import { usePushToken } from "@/contexts/PushTokenProvider";
import { useUser } from "@clerk/clerk-expo";

const Index = () => {
  const { expoPushToken, notification, error, isLoading, isCachedToken } =
    usePushToken();
  const { user: currentUser } = useUser();

  console.log("====Index=====");

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
      <Text className="text-foreground dark:text-foreground-dark">
        {JSON.stringify(currentUser?.id)}
      </Text>
      <Text className="text-foreground dark:text-foreground-dark">
        이모네....
      </Text>
    </View>
  );
};

export default Index;
