import { useAuth } from "@clerk/clerk-expo";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // Make sure the app is ready before redirecting to auth
  useEffect(() => {
    console.log("auth/_layout.tsx useEffect");
    setIsReady(true);
  }, []);

  // Authentication check and redirect to app if signed in
  useEffect(() => {
    console.log("auth/_layout.tsx isSignedIn", isSignedIn);
    console.log("auth/_layout.tsx pathname", pathname);
    if (isSignedIn) {
      console.log("----auth/_layout.tsx redirecting to (app)----");
      // @ts-ignore
      router.replace("/(app)");
    }
    return () => {
      console.log("====auth/_layout.tsx unmounted======");
    };
  }, [isSignedIn, router]);

  console.log("====auth/_layout.tsx isReady=====", isReady);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="signin"
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signin" />
      {/* <Stack.Screen name="signup" />
      <Stack.Screen name="signout" />
      <Stack.Screen name="signoff" /> */}
    </Stack>
  );
}
