import AuthHeader from "@/components/auth/AuthHeader";
import AuthLogo from "@/components/auth/AuthLogo";
import { useEmailSignUpZustand } from "@/contexts/EmailLoginContext";
import {
  emailSignUpStep2Schema,
  emailSignUpStep2Type,
} from "@/zod-schemas/emailLoginSchema";

import { useSignUp } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
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

const EmailSignupStep2 = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { email: emailSignUp, setEmail: setEmailSignUp } =
    useEmailSignUpZustand();

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
  } = useForm<emailSignUpStep2Type>({
    resolver: zodResolver(emailSignUpStep2Schema),
    defaultValues: {
      email: emailSignUp,
      password: "",
      name: "",
      verification_code: "",
    },
  });

  // Monitoring RHF form state
  useEffect(() => {
    // console.log("================================================");
    // console.log("emailSignUp:", emailSignUp);
    // console.log("폼 유효성:", isValid);
    // console.log("폼 오류:", errors);
    // console.log("제출 시도 횟수:", submitCount);
    // console.log("제출 중:", isSubmitting);
    // console.log("제출 성공:", isSubmitSuccessful);
  }, [isValid, errors, submitCount, isSubmitting, isSubmitSuccessful]);

  // Handle submission of sign-up form
  const handleSignUp = async (data: emailSignUpStep2Type) => {
    if (!isLoaded) return;

    // Destructure the form data
    const { password, name, email } = data;

    // Start sign-up process using email and password provided
    try {
      setIsLoading(true);
      // 3 params are required for signup, otherwise it will throw an error
      await signUp.create({
        emailAddress: email,
        password,
        username: name,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const handleVerificationCode = async (data: emailSignUpStep2Type) => {
    if (!isLoaded) return;
    const { email, verification_code, password, name } = data;

    try {
      setIsLoading(true);
      if (!verification_code) {
        console.log("verification_code is empty");
        throw new Error("verification_code is empty");
      }
      console.log("onVerifyPress.....", verification_code);
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification_code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      // Redirect is not necessary but it's a little bit faster.
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        // @ts-ignore
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError("verification_code", {
        message: err?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        title="Enter your name and password to continue"
        description="Please enter your name and password to continue."
      />

      <View className="w-full gap-5 my-5">
        {/* Sign in Email */}
        <Text className="text-lg font-bold px-2 py-1 text-foreground">
          {emailSignUp}
        </Text>

        {!pendingVerification ? (
          <>
            <Controller
              control={control}
              name="name"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View>
                  {/* Name Input */}
                  <TextInput
                    placeholder="Enter your name"
                    defaultValue=""
                    onChangeText={(text: string) => {
                      onChange(text);
                    }}
                    value={value || ""}
                    onBlur={onBlur}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="default"
                    autoCapitalize="none"
                    className="w-full border border-input-border rounded-lg px-4 py-3 text-base text-foreground bg-input"
                    accessibilityLabel="이름 입력"
                    accessibilityRole="keyboardkey"
                  />
                  {error && (
                    <Text className="text-error mt-1">{error.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View>
                  {/* Password Input */}
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

            <Controller
              control={control}
              name="password_confirm"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View>
                  {/* Password Confirm Input */}
                  <TextInput
                    placeholder="Enter your password again"
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
                    accessibilityLabel="비밀번호 재입력"
                    accessibilityRole="keyboardkey"
                  />
                  {error && (
                    <Text className="text-error mt-1">{error.message}</Text>
                  )}
                </View>
              )}
            />
          </>
        ) : (
          <>
            <Text className="ml-2 text-base font-bold text-muted-foreground">
              Verification Code
            </Text>
            <Controller
              control={control}
              name="verification_code"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View>
                  {/* Verification Code Input */}
                  <TextInput
                    placeholder="Check your email for the verification code"
                    defaultValue=""
                    onChangeText={(text: string) => {
                      onChange(text);
                    }}
                    onBlur={onBlur}
                    value={value || ""}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    className="w-full border border-input-border rounded-lg px-4 py-3 text-base text-foreground bg-input"
                    accessibilityLabel="인증 코드 입력"
                    accessibilityRole="keyboardkey"
                  />
                  {error && (
                    <Text className="text-error mt-1">{error.message}</Text>
                  )}
                </View>
              )}
            />
          </>
        )}
      </View>

      {/* Continue Button */}
      <Pressable
        onPress={
          !pendingVerification
            ? handleSubmit(handleSignUp)
            : handleSubmit(handleVerificationCode)
        }
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
    </View>
  );
};

export default EmailSignupStep2;
