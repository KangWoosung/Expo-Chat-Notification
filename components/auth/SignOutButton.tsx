import { useEmailSignUpZustand } from "@/contexts/EmailLoginContext";
import { useClerk } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const { clearStorage } = useEmailSignUpZustand();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Sign out the user
      await signOut();
      // Clear zustand storage
      clearStorage();
      // It will be automatically redirected to the home page
      // because the user session state is managed by Clerk in the global level.
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      // setIsLoading(false);
    }
  };
  return (
    <TouchableOpacity onPress={handleSignOut} style={style.signOutButton}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={style.buttonText}>Sign out</Text>
      )}
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  signOutButton: {
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
