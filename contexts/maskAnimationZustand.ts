// zustandStore.ts
import type { SkImage } from "@shopify/react-native-skia";
import { Appearance } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { create } from "zustand";

export type ColorSchemeName = "light" | "dark";

type ColorSchemeState = {
  active: boolean;
  ref: any | null;
  colorScheme: ColorSchemeName;
  statusBarStyle: ColorSchemeName;
  curtainOverlay: SkImage | null;
  circleOverlay: SkImage | null;
  circleRadius: SharedValue<number> | null;
  curtainWidth: SharedValue<number> | null;
  circleCoordX: SharedValue<number> | null;
  circleCoordY: SharedValue<number> | null;
  setActive: (active: boolean) => void;
  setRef: (ref: any) => void;
  setColorScheme: (scheme: ColorSchemeName) => void;
  setCurtainOverlay: (image: SkImage | null) => void;
  setCircleOverlay: (image: SkImage | null) => void;
  resetOverlays: () => void;
  updateColorScheme: (colorScheme: ColorSchemeName) => void;
  setCurtainWidth: (width: SharedValue<number>) => void;
  setCircleRadius: (radius: SharedValue<number>) => void;
  setCircleCoordX: (x: SharedValue<number>) => void;
  setCircleCoordY: (y: SharedValue<number>) => void;
};

export const useMaskAnimationStore = create<ColorSchemeState>((set) => ({
  active: false,
  ref: null,
  colorScheme: Appearance.getColorScheme() ?? "light",
  statusBarStyle: Appearance.getColorScheme() === "light" ? "dark" : "light",
  curtainOverlay: null,
  circleOverlay: null,
  circleRadius: null,
  curtainWidth: null,
  circleCoordX: null,
  circleCoordY: null,
  setActive: (active) => set({ active }),
  setRef: (ref) => set({ ref }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setCurtainOverlay: (curtainOverlay) => set({ curtainOverlay }),
  setCircleOverlay: (circleOverlay) => set({ circleOverlay }),
  resetOverlays: () => set({ curtainOverlay: null, circleOverlay: null }),
  updateColorScheme: (colorScheme) =>
    set({
      colorScheme,
      statusBarStyle: colorScheme === "light" ? "dark" : "light",
    }),
  setCurtainWidth: (curtainWidth) => set({ curtainWidth }),
  setCircleRadius: (circleRadius) => set({ circleRadius }),
  setCircleCoordX: (circleCoordX) => set({ circleCoordX }),
  setCircleCoordY: (circleCoordY) => set({ circleCoordY }),
}));
