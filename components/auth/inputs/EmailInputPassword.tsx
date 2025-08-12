import { emailLoginStep2Type } from "@/zod-schemas/emailLoginSchema";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";

import { TextInput, View } from "react-native";

type EmailInputPasswordProps = {
  control: Control<emailLoginStep2Type>;
  name: string;
  placeholder: string;
  error: FieldErrors<emailLoginStep2Type>;
};

const EmailInputPassword = ({
  control,
  name,
  placeholder,
  error,
}: EmailInputPasswordProps) => {
  return (
    <View>
      <Controller
        control={control}
        name={name as "password"}
        render={({ field }) => (
          <TextInput {...field} placeholder={placeholder} />
        )}
      />
    </View>
  );
};

export default EmailInputPassword;
