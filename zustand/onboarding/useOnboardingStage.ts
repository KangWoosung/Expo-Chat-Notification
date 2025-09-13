/*
2025-09-12 10:26:30
온보딩 전역 상태 관리 스토어
scrollX, currentIndex, 애니메이션 상태 등을 관리
*/

import { create } from "zustand";
import { useSharedValue, SharedValue } from "react-native-reanimated";
import { Dimensions } from "react-native";
import { onboardingData } from "@/app/onboarding/data";

const { width: WIDTH } = Dimensions.get("window");

interface OnboardingStageState {
  // Shared Values
  scrollX: SharedValue<number>;
  flatListIndex: SharedValue<number>;
  circleAnimatePosX: SharedValue<number>;

  // Animation States
  titleAnimationFinished: boolean;
  stageAnimationFinished: boolean;
  stageAnimationStart: boolean;

  // Current Index (computed from scrollX)
  currentIndex: number;

  // Actions
  setTitleAnimationFinished: (finished: boolean) => void;
  setStageAnimationFinished: (finished: boolean) => void;
  setStageAnimationStart: (start: boolean) => void;
  updateCurrentIndex: (index: number) => void;

  // Handlers
  handleNext: () => void;
  handleFinishOnboarding: () => void;

  // FlatList reference handler
  flatListRef: React.RefObject<any> | null;
  setFlatListRef: (ref: React.RefObject<any>) => void;

  // External callback
  onFinishCallback: (() => void) | null;
  setOnFinishCallback: (callback: () => void) => void;
}

export const useOnboardingStage = create<OnboardingStageState>((set, get) => ({
  // Initialize shared values
  scrollX: useSharedValue(0),
  flatListIndex: useSharedValue(0),
  circleAnimatePosX: useSharedValue(0),

  // Animation states
  titleAnimationFinished: false,
  stageAnimationFinished: false,
  stageAnimationStart: false,

  // Current index
  currentIndex: 0,

  // FlatList ref
  flatListRef: null,

  // Actions
  setTitleAnimationFinished: (finished: boolean) => {
    set({ titleAnimationFinished: finished });
  },

  setStageAnimationFinished: (finished: boolean) => {
    set({ stageAnimationFinished: finished });
  },

  setStageAnimationStart: (start: boolean) => {
    set({ stageAnimationStart: start });
  },

  updateCurrentIndex: (index: number) => {
    set({ currentIndex: index });
  },

  setFlatListRef: (ref: React.RefObject<any>) => {
    set({ flatListRef: ref });
  },

  // Handlers
  handleNext: () => {
    const state = get();
    const currentIndex = Math.round(state.scrollX.value / WIDTH);

    if (state.flatListRef?.current) {
      if (currentIndex < onboardingData.length - 1) {
        state.flatListRef.current.scrollToIndex({
          index: currentIndex + 1,
        });
      } else {
        state.handleFinishOnboarding();
      }
    }
  },

  handleFinishOnboarding: () => {
    const state = get();
    console.log("finish onboarding from zustand");

    // 외부 콜백이 설정되어 있으면 호출
    if (state.onFinishCallback) {
      state.onFinishCallback();
    }
  },

  // 외부 콜백 설정
  onFinishCallback: null as (() => void) | null,
  setOnFinishCallback: (callback: () => void) => {
    set({ onFinishCallback: callback });
  },
}));
