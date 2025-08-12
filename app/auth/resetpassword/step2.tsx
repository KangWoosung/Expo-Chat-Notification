import AuthHeader from "@/components/auth/AuthHeader";
import AuthLogo from "@/components/auth/AuthLogo";
import { useEmailSignUpZustand } from "@/contexts/EmailLoginContext";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EmailResetPasswordStep2 = () => {
  const { email: emailSignUp, setEmail: setEmailSignUp } =
    useEmailSignUpZustand();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background px-5 gap-6"
      style={{
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom,
      }}
    >
      {/* App Logo for login page */}
      <AuthLogo />
      {/* Heading Container */}
      <AuthHeader
        title="Password Reset succeeded "
        description="Your password has been reset successfully. Please use the new password to login."
      />

      {/* Sign in Email */}
      <Text className="text-lg font-bold px-2 py-1 text-foreground">
        {emailSignUp}
      </Text>

      {/* Continue Button */}
      <Pressable
        className="items-center bg-primary py-3 rounded-lg"
        onPress={() => {
          // @ts-ignore
          router.push("/auth/signin");
        }}
        accessibilityRole="button"
        accessibilityLabel="Go to Login"
      >
        <Text className="text-white text-base font-bold">Go to Login</Text>
      </Pressable>
    </View>
  );
};

export default EmailResetPasswordStep2;
