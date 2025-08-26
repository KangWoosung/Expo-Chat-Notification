import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";

const AppLayout = () => {
  // login redirection code comes here
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Make sure the app is ready before redirecting to auth
  useEffect(() => {
    console.log("======AppLayout useEffect=======");
    setIsReady(true);
  }, []);

  // Authentication check and redirect to auth if not signed in
  useEffect(() => {
    if (isReady && !isSignedIn) {
      console.log("App redirecting to auth");
      // @ts-ignore
      router.replace("/auth");
    }
  }, [isReady, isSignedIn, router]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="(drawer)"
    >
      <Stack.Screen name="(drawer)" />
    </Stack>
  );
};

export default AppLayout;
