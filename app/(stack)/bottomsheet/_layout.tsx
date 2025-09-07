import React from "react";
import { Stack } from "expo-router";

const BottomSheetLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="CreateGroupChatRoom"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default BottomSheetLayout;
