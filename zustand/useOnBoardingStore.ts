/*
2025-09-02 07:10:29

Zustand Store for OnBoarding control by global showOnBoarding state.



*/

import {
  ONBOARDING_FLAG_ROOT_LAYOUT,
  ONBOARDING_STATE_DEFAULT,
} from "@/constants/constants";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OnBoardingState = {
  showOnBoarding: boolean;
  setShowOnBoarding: (show: boolean) => void;
};

export const useOnBoardingStore = create<OnBoardingState>()(
  persist(
    (set) => ({
      showOnBoarding: ONBOARDING_STATE_DEFAULT,
      setShowOnBoarding: (show: boolean) => set({ showOnBoarding: show }),
    }),
    {
      name: ONBOARDING_FLAG_ROOT_LAYOUT,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
