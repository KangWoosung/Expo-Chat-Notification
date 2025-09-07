/*
2025-09-02 07:16:09


*/

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_LOCALE } from "@/constants/constants";

type LocaleState = {
  locale: string;
  setLocale: (locale: string) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale: string) => set({ locale: locale }),
    }),
    {
      name: "app-locale",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
