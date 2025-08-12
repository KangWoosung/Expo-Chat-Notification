import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useAuth } from "@clerk/clerk-expo";

import AuthHeader from "@/components/auth/AuthHeader";
import AuthLogo from "@/components/auth/AuthLogo";
import SocialLoginButton, {
  SSO_PROVIDERS,
} from "@/components/auth/SocialLoginButton";
import Divider from "@/components/utils/Divider";
import { useEmailSignUpZustand } from "@/contexts/EmailLoginContext";
import {
  emailLoginStep1Schema,
  emailLoginStep1Type,
} from "@/zod-schemas/emailLoginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
WebBrowser.maybeCompleteAuthSession();

const Signup = () => {
  useWarmUpBrowser();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const { email: emailSignUp, setEmail: setEmailSignUp } =
    useEmailSignUpZustand();
  const [isLoading, setIsLoading] = useState(false);

  //   console.log("pathname", pathname);
  const router = useRouter();

  const { control, handleSubmit } = useForm<emailLoginStep1Type>({
    resolver: zodResolver(emailLoginStep1Schema),
    defaultValues: {
      email: "",
    },
  });

  const handlePress = (data: emailLoginStep1Type) => {
    try {
      setIsLoading(true);
      // Store value to zustand
      setEmailSignUp(data.email);

      // @ts-ignore
      router.push("/auth/emailsignup/step1");
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("isSignedIn", isSignedIn);
  }, [isSignedIn, router]);

  return (
    <View
      className="flex-1 bg-background px-5 gap-6
      dark:bg-background-dark"
      style={{
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom,
      }}
    >
      {/* App Logo for login page */}
      <AuthLogo />

      {/* Heading Container */}
      <AuthHeader
        title="Create your account"
        description="Welcome!! Please select a social provider or fill up your email address to continue."
      />

      {/* Social Login Buttons */}
      <View className="flex-row mt-5 gap-2.5 w-full">
        {SSO_PROVIDERS.map((provider) => (
          <SocialLoginButton key={provider} strategy={provider} />
        ))}
      </View>

      {/* Divider with "or" */}
      <Divider text="or" />

      {/* Email Signin Component */}
      {/* Email Input */}
      <Controller
        control={control}
        name="email"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <View>
            {/* Email Input */}
            <TextInput
              placeholder="Enter your email"
              defaultValue=""
              onChangeText={(text: string) => {
                onChange(text);
              }}
              value={value || ""}
              onBlur={onBlur}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full border border-input-border rounded-lg px-4 py-3 text-base text-foreground"
            />
            {error && <Text className="text-error mt-1">{error.message}</Text>}
          </View>
        )}
      />

      {/* Continue Button */}
      <Pressable
        onPress={handleSubmit(handlePress)}
        className="items-center bg-primary py-3 rounded-lg"
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white text-base font-bold">Continue</Text>
        )}
      </Pressable>

      {/* Link to SignUp */}
      {(pathname === "/auth" || pathname === "/auth/signin") && (
        <Link href="/auth/signup" accessibilityRole="link">
          <Text className="text-foreground text-sm font-light text-center underline">
            Don&apos;t have an account?{" "}
            <Text className="text-primary font-bold">Sign up</Text>
          </Text>
        </Link>
      )}
    </View>
  );
};

export default Signup;
