/*
2025-09-02 05:59:50

Zustand Store for Animation control by AccessibilityInfo and global reduceMotionEnabled state.

*/

// /zustand/useAnimationStore.ts
import { create } from "zustand";
import { AccessibilityInfo } from "react-native";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AnimationState = {
  reduceMotionEnabled: boolean;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  initAccessibility: () => void;
};

export const useAnimationStore = create<AnimationState>()(
  persist(
    (set) => ({
      reduceMotionEnabled: false,
      animationsEnabled: true,
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      initAccessibility: async () => {
        // get initial Accessibility setting value
        const isReduceMotionEnabled =
          await AccessibilityInfo.isReduceMotionEnabled();
        set({
          reduceMotionEnabled: isReduceMotionEnabled,
          animationsEnabled: !isReduceMotionEnabled,
        });

        // register listener for system setting change
        AccessibilityInfo.addEventListener(
          "reduceMotionChanged",
          (isEnabled) => {
            set({
              reduceMotionEnabled: isEnabled,
              animationsEnabled: !isEnabled,
            });
          }
        );
      },
    }),
    {
      name: "app-animation",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
