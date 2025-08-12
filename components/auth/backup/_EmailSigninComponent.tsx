import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { Link, usePathname, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmailStep1 from "./_EmailStep1";

const EmailSigninComponent = () => {
  useWarmUpBrowser();
  const insets = useSafeAreaInsets();
  const emailInputRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const pathname = usePathname();

  //   console.log("pathname", pathname);
  const router = useRouter();

  const handlePress = () => {
    router.push("/auth/emailsignin/step1");
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <EmailStep1
        inputName="email"
        label="Email"
        placeholder="Enter your email"
        emailInputRef={emailInputRef}
      />

      {/* Continue Button */}
      <Pressable onPress={handlePress} style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      {/* Link to SignUp */}
      {(pathname === "/auth" || pathname === "/auth/signin") && (
        <Link href="/auth/signup">
          {/* @ts-ignore */}
          <Text style={styles.linkText}>
            Don&apos;t have an account? Sign up
          </Text>
        </Link>
      )}
    </View>
  );
};

export default EmailSigninComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  linkText: {
    color: "#222",
    fontSize: 14,
    fontWeight: "200",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
