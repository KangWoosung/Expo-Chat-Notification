import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

const EmailLoginButton = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push("/auth/emailsignin/step1");
  };

  return (
    <>
      {/* Continue Button */}
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
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

export default EmailLoginButton;
