import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import tailwindColors from "@/utils/tailwindColors";

const ChatRoomLoading = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background-blank dark:bg-background-dark">
      <ActivityIndicator
        size="large"
        color={tailwindColors.foreground.primary}
      />
    </View>
  );
};

export default ChatRoomLoading;
