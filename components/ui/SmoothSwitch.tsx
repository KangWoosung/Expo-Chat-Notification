/*
2025-09-02 07:24:22


*/

import { Pressable, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const DEFAULT_SWITCH_CLASSNAME = `flex-row justify-center items-center w-10 h-5 
    rounded-full bg-gray-200 dark:bg-gray-700`;

type SmoothSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
  className?: string;
};

export default function SmoothSwitch({
  value,
  onValueChange,
  accessibilityLabel,
  className,
}: SmoothSwitchProps) {
  const offset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(offset.value) }],
  }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      style={styles.track}
      className={`${DEFAULT_SWITCH_CLASSNAME} ${className}`}
      onPress={() => {
        onValueChange(!value);
        offset.value = offset.value === 0 ? 20 : 0;
      }}
    >
      <Animated.View
        style={[styles.thumb, animatedStyle]}
        className="w-4 h-4 rounded-full bg-white dark:bg-gray-900"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    justifyContent: "center",
    padding: 4,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
});
