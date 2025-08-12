import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SocialLoginButton, { SSO_PROVIDERS } from "../SocialLoginButton";

WebBrowser.maybeCompleteAuthSession();

const SignInComponent = () => {
  useWarmUpBrowser();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/awesome-rocket-cloud-logo-design_95982-801.jpg")}
          style={styles.logo}
        />
      </View>
      <View style={styles.headingContainer}>
        <Text style={styles.label}>Sign in to your account</Text>
        <Text style={styles.description}>
          Welcome back!! Please select a social provider or fill up your email
          address to continue.
        </Text>
      </View>

      <View style={styles.socialButtonsContainer}>
        {SSO_PROVIDERS.map((provider) => (
          <SocialLoginButton key={provider} strategy={provider} />
        ))}
      </View>

      {/* Divider with "or" */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      {/* Email Signin Component */}
    </View>
  );
};

export default SignInComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    gap: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  headingContainer: {
    width: "100%",
    gap: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  socialButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    width: "50%",
    marginTop: 20,
    gap: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB", // gray-200
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#6B7280", // gray-500
    fontSize: 14,
  },
});
