import React from "react";
import { Text, View } from "react-native";

type AuthHeaderProps = {
  title: string;
  description: string;
};

const AuthHeader = ({ title, description }: AuthHeaderProps) => {
  return (
    <View
      className="w-full gap-5"
      // style={styles.headingContainer}
    >
      <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
        {title}
      </Text>
      <Text className="text-secondary dark:text-secondary-dark">
        {description}
      </Text>
    </View>
  );
};

export default AuthHeader;
