// import { deleteUserById } from "@/serveractions/deleteUserById";
import { useClerk, useUser } from "@clerk/clerk-expo";
import React from "react";
import { Text, View } from "react-native";

const Signoff = () => {
  const { signOut } = useClerk();
  const { user } = useUser();

  const deleteUserById = async (userId: string) => {
    // const { error } = await supabase.from("users").delete().eq("id", userId);
    // if (error) {
    //   console.error("Error deleting user:", error);
    // }
  };

  const handleSignoff = async () => {
    if (!user) return;

    try {
      await deleteUserById(user.id);
      await signOut();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <View>
      <Text>Signoff</Text>
    </View>
  );
};

export default Signoff;
