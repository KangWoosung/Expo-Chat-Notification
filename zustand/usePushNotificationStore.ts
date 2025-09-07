/*
2025-09-02 07:19:41

Zustand Store for Push Notification control by global pushNotificationEnabled state.


*/

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PushNotificationState = {
  pushNotificationEnabled: boolean;
  setPushNotificationEnabled: (enabled: boolean) => void;
};

export const usePushNotificationStore = create<PushNotificationState>()(
  persist(
    (set) => ({
      pushNotificationEnabled: true,
      setPushNotificationEnabled: (enabled: boolean) =>
        set({ pushNotificationEnabled: enabled }),
    }),
    {
      name: "app-push-notification",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
