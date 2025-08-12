import {
  emailLoginStep1Schema,
  emailLoginStep1Type,
} from "@/zod-schemas/emailLoginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

type EmailStep1Props = {
  inputName: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  emailInputRef: React.RefObject<TextInput>;
};

const EmailStep1 = ({
  label,
  inputName,
  placeholder,
  defaultValue,
  emailInputRef,
}: EmailStep1Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<emailLoginStep1Type>({
    resolver: zodResolver(emailLoginStep1Schema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <View style={styles.formGroup}>
      {label && <Text>{label}</Text>}
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
              placeholder={placeholder}
              defaultValue={defaultValue}
              ref={emailInputRef}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            {error && <Text style={styles.msg}>{error.message}</Text>}
          </View>
        )}
      />
    </View>
  );
};

export default EmailStep1;

const styles = StyleSheet.create({
  formGroup: {
    width: "100%",
    marginBottom: 10,
  },
  msg: {
    color: "#ff8566",
    marginTop: 5,
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
