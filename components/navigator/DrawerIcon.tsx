import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";

type DrawerIconProps = {
  color?: string;
  size?: number;
};

const DrawerIcon = ({ color = "black", size = 24 }: DrawerIconProps) => {
  const navigation = useNavigation();

  const handlePress = () => {
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch (error) {
      console.warn("Failed to open drawer:", error);
    }
  };

  return (
    <Pressable className="p-sm ml-sm pr-sm" onPress={handlePress}>
      <Ionicons name="menu" size={size} color={color} />
    </Pressable>
  );
};

export default DrawerIcon;
