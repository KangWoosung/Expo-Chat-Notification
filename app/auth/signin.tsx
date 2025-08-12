import AuthHeader from "@/components/auth/AuthHeader";
import AuthLogo from "@/components/auth/AuthLogo";
import SocialLoginButton, {
  SSO_PROVIDERS,
} from "@/components/auth/SocialLoginButton";
import Divider from "@/components/utils/Divider";
import { useEmailLoginZustand } from "@/contexts/EmailLoginContext";

import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import {
  emailLoginStep1Schema,
  emailLoginStep1Type,
} from "@/zod-schemas/emailLoginSchema";

import { useAuth } from "@clerk/clerk-expo";
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

const Signin = () => {
  useWarmUpBrowser();
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const { email, setEmail } = useEmailLoginZustand();
  const [isLoading, setIsLoading] = useState(false);

  //   console.log("pathname", pathname);
  const router = useRouter();

  const handlePress = (data: emailLoginStep1Type) => {
    setIsLoading(true);
    // Store value to zustand
    setEmail(data.email);
    console.log("data.email", data.email);
    console.log("Zustand email", email);

    setIsLoading(false);
    // @ts-ignore
    router.push("/auth/emailsignin/step1");
  };

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isValid,
      submitCount,
      isSubmitting,
      isSubmitSuccessful,
    },
    reset,
  } = useForm<emailLoginStep1Type>({
    resolver: zodResolver(emailLoginStep1Schema),
    defaultValues: {
      email: "",
    },
  });

  // 폼 상태 모니터링
  useEffect(() => {
    // console.log("====auth/signin.tsx======");
    // console.log("폼 유효성:", isValid);
    // console.log("폼 오류:", errors);
    // console.log("제출 시도 횟수:", submitCount);
    // console.log("제출 중:", isSubmitting);
    // console.log("제출 성공:", isSubmitSuccessful);
    return () => {
      console.log("====auth/signin.tsx unmounted======");
    };
  }, [isValid, errors, submitCount, isSubmitting, isSubmitSuccessful]);

  // useEffect(() => {
  //   console.log("isSignedIn", isSignedIn);
  // }, [isSignedIn, router]);

  return (
    <View
      className="flex-1 bg-background dark:bg-background-dark px-5 gap-6"
      style={{
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom,
      }}
    >
      {/* App Logo for login page */}
      <AuthLogo />

      {/* Heading Container */}
      <AuthHeader
        title="Sign in to your account"
        description="Welcome back!! Please select a social provider or fill up your email address to continue."
      />

      {/* Social Login Buttons */}
      <View className="flex-row mt-5 gap-2.5">
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
              onChangeText={onChange}
              value={value || ""}
              onBlur={onBlur}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full rounded-lg px-4 py-3 
              border border-input-border dark:border-input-border-dark 
              bg-background dark:bg-background-dark
              text-base text-foreground dark:text-foreground-dark
              focus:border-primary dark:focus:border-primary-dark
              focus:ring-0 dark:focus:ring-0
              "
            />
            {error && <Text className="text-error mt-1">{error.message}</Text>}
          </View>
        )}
      />

      {/* Continue Button */}
      <Pressable
        onPress={handleSubmit(handlePress)}
        className="items-center bg-primary dark:bg-primary-dark py-3 rounded-lg"
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

export default Signin;
