import React from "react";
import { Image, StyleSheet, View } from "react-native";

const AuthLogo = () => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require("@/assets/images/awesome-rocket-cloud-logo-design_95982-801.jpg")}
        style={styles.logo}
      />
    </View>
  );
};

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
});

export default AuthLogo;
