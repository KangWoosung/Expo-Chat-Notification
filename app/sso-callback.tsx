import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

const SSOCallback = () => {
  const { isSignedIn, isLoaded } = useAuth();

  // Backup Redirection Code for sub-root layout redirections.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // @ts-ignore
      router.replace("/(app)");
    } else {
      console.log("SSOCallback not signed in");
    }
  }, [isLoaded, isSignedIn]);

  return <View />;
};

export default SSOCallback;
