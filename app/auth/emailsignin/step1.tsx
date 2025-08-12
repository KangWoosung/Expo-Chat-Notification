import AuthHeader from "@/components/auth/AuthHeader";
import AuthLogo from "@/components/auth/AuthLogo";
import { useEmailLoginZustand } from "@/contexts/EmailLoginContext";
import {
  emailLoginStep2Schema,
  emailLoginStep2Type,
} from "@/zod-schemas/emailLoginSchema";

import { useSignIn } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
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

const EmailSigninStep1 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { email: emailSignUp } = useEmailLoginZustand();

  console.log("EmailSigninStep2");

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
    setError,
  } = useForm<emailLoginStep2Type>({
    resolver: zodResolver(emailLoginStep2Schema),
    defaultValues: {
      email: emailSignUp,
      password: "",
    },
  });

  console.log("emailSignUp", emailSignUp);

  // 폼 상태 모니터링
  useEffect(() => {
    console.log("폼 유효성:", isValid);
    console.log("폼 오류:", errors);
    console.log("제출 시도 횟수:", submitCount);
    console.log("제출 중:", isSubmitting);
    console.log("제출 성공:", isSubmitSuccessful);
  }, [isValid, errors, submitCount, isSubmitting, isSubmitSuccessful]);

  const handleSignIn = (data: emailLoginStep2Type) => {
    console.log("================================================");
    console.log("onSignUpPress", data);
    const { password } = data;
    onSignInPress(password);
  };

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(
    async (password: string) => {
      if (!isLoaded) return;

      // Start the sign-in process using the email and password provided
      try {
        setIsLoading(true);
        console.log("onSignInPress.......", password);
        const signInAttempt = await signIn.create({
          identifier: emailSignUp,
          password,
        });

        // If sign-in process is complete, set the created session as active
        // and redirect the user
        if (signInAttempt.status === "complete") {
          await setActive({ session: signInAttempt.createdSessionId });
          // @ts-ignore
          router.replace("/");
        } else {
          // If the status is not complete, check why. User may need to
          // complete further steps.
          console.error(JSON.stringify(signInAttempt, null, 2));
        }
      } catch (err: any) {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.error(JSON.stringify(err, null, 2));

        // Set the error message for the password field
        setError("password", {
          type: "manual",
          message: err.errors?.[0]?.message || "로그인에 실패했습니다",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, emailSignUp, setError]
  );

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
        title="Enter password to continue"
        description="Please enter your password to continue."
      />

      <View className="w-full gap-5 my-5">
        {/* Sign in Email */}
        <Text className="text-lg font-bold px-2 py-1 text-foreground">
          {emailSignUp}
        </Text>

        <Controller
          control={control}
          name="password"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View>
              {/* Email Input */}
              <TextInput
                placeholder="Enter your password"
                defaultValue=""
                onChangeText={(text: string) => {
                  onChange(text);
                }}
                value={value || ""}
                onBlur={onBlur}
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                className="w-full border border-input-border rounded-lg px-4 py-3 text-base text-foreground bg-input"
                accessibilityLabel="비밀번호 입력"
                accessibilityRole="keyboardkey"
              />
              {error && (
                <Text className="text-error mt-1">{error.message}</Text>
              )}
            </View>
          )}
        />
      </View>

      {/* Continue Button */}
      <Pressable
        onPress={handleSubmit(handleSignIn)}
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

      {/* @ts-ignore */}
      <Link href="/auth/resetpassword/step1" accessibilityRole="link">
        <Text className="text-foreground text-sm font-light text-center underline">
          Forgot your password?{" "}
          <Text className="text-primary font-bold">You can reset it.</Text>
        </Text>
      </Link>
    </View>
  );
};

export default EmailSigninStep1;
