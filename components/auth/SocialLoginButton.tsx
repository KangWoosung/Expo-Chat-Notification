import { REDIRECT_URI, SSO_SCHEME_NAME } from "@/constants/constants";
import { useSSO, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const SSO_PROVIDERS: ("google" | "github" | "apple" | "facebook")[] = [
  "google",
  "github",
];

const SocialLoginButton = ({
  strategy,
}: {
  strategy: (typeof SSO_PROVIDERS)[number];
}) => {
  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const getStrategy = () => {
    return `oauth_${strategy}` as const;
  };

  const buttonText = () => {
    if (isLoading) {
      return "Loading...";
    }
    return strategy.charAt(0).toUpperCase() + strategy.slice(1);
  };

  const buttonIcon = () => {
    return <Ionicons name={`logo-${strategy}`} size={24} color="#222" />;
  };
  const onSocialLoginPress = useCallback(async () => {
    try {
      setIsLoading(true);
      // Start the authentication process by calling `startSSOFlow()`

      const strategy = getStrategy();
      const redirect_Url = AuthSession.makeRedirectUri({
        scheme: SSO_SCHEME_NAME,
        path: REDIRECT_URI,
      });
      console.log("Redirect URI:", redirect_Url);

      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy,
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        await user?.reload();

        if (setActive) {
          console.log("Navigating to app after successful login");
        }
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
        console.log("No session created - additional steps may be required");
        Alert.alert("로그인 실패", "다시 시도해주세요.");
        // router.replace("/(app)");
        return;
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("SSO Login Error:", JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <TouchableOpacity
      className="w-1/2 border border-border bg-input rounded-lg flex-row gap-2.5 justify-between items-center shadow-sm p-2.5"
      onPress={onSocialLoginPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={`${buttonText()}로 로그인`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#222" /> // ActivityIndicator는 Tailwind로 색상 지정 불가, 디자인 시스템에 맞는 색상 변수로 교체 필요시 커스텀 처리
      ) : (
        buttonIcon()
      )}
      {SSO_PROVIDERS.length <= 3 && (
        <Text className="text-body-2 font-medium text-foreground">
          {buttonText()}
        </Text>
      )}
      <View />
    </TouchableOpacity>
  );
};

export default SocialLoginButton;
