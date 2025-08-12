import { Stack } from "expo-router";
import React from "react";

const EmailResetPasswordLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerBackTitle: "go back",
        headerTransparent: true,
      }}
    >
      <Stack.Screen name="step1" />
    </Stack>
  );
};

export default EmailResetPasswordLayout;
