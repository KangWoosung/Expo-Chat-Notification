import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import tailwindColors from "@/utils/tailwindColors";
import { useUser } from "@clerk/clerk-expo";
import AllUserChats from "@/components/chatList/AllUserChats";
import { useColorScheme } from "nativewind";
import ExistingChatRooms from "@/components/chatList/ExistingChatRooms";
import PresentationIndex from "@/app/(stack)/presentation";

const ChatsIndex = () => {
  const { user: currentUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!currentUser)
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground dark:text-foreground-dark">
          User information is not found. Please login to continue
        </Text>
      </View>
    );
  return (
    <View
      className="flex-1 w-full items-center justify-start border 
    bg-background dark:bg-background-dark"
    >
      {error && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground dark:text-foreground-dark">
            Error: {error}
          </Text>
        </View>
      )}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tailwindColors.primary.DEFAULT}
          />
        </View>
      ) : (
        <>
          <ExistingChatRooms />
          <AllUserChats
            currentUser={currentUser}
            setError={setError}
            isDark={isDark}
          />
          <PresentationIndex />
        </>
      )}
    </View>
  );
};

export default ChatsIndex;
