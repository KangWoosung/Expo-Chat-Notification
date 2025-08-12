import AuthLogo from "@/components/auth/AuthLogo";
import { useEmailLoginZustand } from "@/contexts/EmailLoginContext";
import {
  emailResetPasswordStep1Schema,
  emailResetPasswordStep1Type,
} from "@/zod-schemas/emailLoginSchema";
import { useAuth, useSignIn } from "@clerk/clerk-expo";

import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
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

const EmailResetPasswordStep1 = () => {
  const [codeRequested, setCodeRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { email: emailSignUp } = useEmailLoginZustand();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [requestCodeError, setRequestCodeError] = useState<string | null>(null);
  const { signOut } = useAuth(); // 로그아웃을 위한 hook 추가
  const insets = useSafeAreaInsets();

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
    setError,
  } = useForm<emailResetPasswordStep1Type>({
    resolver: zodResolver(emailResetPasswordStep1Schema),
    defaultValues: {
      resetCode: "",
      password: "",
      password_confirm: "",
    },
  });

  // 폼 상태 모니터링
  useEffect(() => {
    console.log("================================================");
    console.log("emailSignUp:", emailSignUp);
    console.log("폼 유효성:", isValid);
    console.log("폼 오류:", errors);
    console.log("제출 시도 횟수:", submitCount);
    console.log("제출 중:", isSubmitting);
    console.log("제출 성공:", isSubmitSuccessful);
  }, [isValid, errors, submitCount, isSubmitting, isSubmitSuccessful]);

  // Send the password reset code to the user's email
  const handleRequestResetCode = async () => {
    if (!isLoaded || !signIn) {
      console.error("Clerk is not loaded yet");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailSignUp,
      });
      setCodeRequested(true);
    } catch (error: any) {
      console.log("Clerk returned an error: ", error);
      setRequestCodeError(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the reset password
  const handleResetPassword = async (data: emailResetPasswordStep1Type) => {
    setIsLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.resetCode,
        password: data.password,
      });
      if (
        result?.status === "complete" &&
        result?.createdSessionId &&
        setActive
      ) {
        console.log("Password reset successful");
        // Make user signed in
        // await setActive({ session: result?.createdSessionId });
        // @ts-ignore
        // router.push("/");

        // Or Make user signed out
        await signOut();
        // @ts-ignore
        router.push("/auth/resetpassword/step2");
      } else {
        console.log("Password reset failed");
        setError("resetCode", {
          message: result?.status || "Password reset failed",
        });
      }
    } catch (error: any) {
      console.log("Clerk returned an error: ", error);

      // 에러 타입에 따른 처리
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0];

        // 코드 관련 에러
        if (clerkError.code === "form_code_incorrect") {
          setError("resetCode", { message: "유효하지 않은 코드입니다." });
        }
        // 기타 에러
        else {
          setError("root", {
            message:
              clerkError.message || "비밀번호 재설정 중 오류가 발생했습니다.",
          });
        }
      } else {
        setError("root", { message: "알 수 없는 오류가 발생했습니다." });
      }
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

      {/* Sign in Email */}
      <Text className="text-lg font-bold px-2 py-1 text-foreground">
        {emailSignUp}
      </Text>

      {!codeRequested ? (
        <>
          <Text className="text-base text-muted-foreground mb-2">
            Press the button below to send the reset code to your email.
          </Text>
          <Pressable
            onPress={handleRequestResetCode}
            className="items-center bg-primary py-3 rounded-lg"
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Send Reset Code"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">
                Send Reset Code
              </Text>
            )}
          </Pressable>

          {requestCodeError && (
            <Text className="text-error mt-1">{requestCodeError}</Text>
          )}
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="resetCode"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View>
                {/* Reset Code Input */}
                <TextInput
                  placeholder="Check your email for the reset code"
                  defaultValue=""
                  onChangeText={(text: string) => {
                    onChange(text);
                  }}
                  value={value || ""}
                  onBlur={onBlur}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  className="w-full border border-input-border rounded-lg px-4 py-3 text-base text-foreground bg-input"
                  accessibilityLabel="리셋 코드 입력"
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
                  placeholder="Enter new password"
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
                  accessibilityLabel="새 비밀번호 입력"
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
                  placeholder="Enter new password again"
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
                  accessibilityLabel="새 비밀번호 재입력"
                  accessibilityRole="keyboardkey"
                />
                {error && (
                  <Text className="text-error mt-1">{error.message}</Text>
                )}
              </View>
            )}
          />

          <Pressable
            onPress={handleSubmit(handleResetPassword)}
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
        </>
      )}
    </View>
  );
};

export default EmailResetPasswordStep1;
