import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const EmailInputVerificationCode = () => {
  return (
    <View>
      <View>
        {/* Email Input */}
        <TextInput
          placeholder="Enter your verification code"
          defaultValue=""
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {/* {error && <Text style={styles.msg}>{error.message}</Text>} */}
      </View>
    </View>
  );
};

export default EmailInputVerificationCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827", // gray-900
  },
  errorInput: {
    borderColor: "#ff8566",
    borderWidth: 1,
  },
});
