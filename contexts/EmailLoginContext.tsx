/*
2025-05-13 17:05:27

email 과 password 를 zustand 컨텍스트로 유지해준다. 

*/

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "expo-zustand-persist";
import { create } from "zustand";

type EmailLoginZustandType = {
  email: string;
  password: string;
  name: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setName: (name: string) => void;
};

type EmailSignUpZustandType = {
  email: string;
  password: string;
  name: string;
  verifyPassword: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setName: (name: string) => void;
  setVerifyPassword: (verifyPassword: string) => void;
  clearStorage: () => void;
};

export const useEmailLoginZustand = create<EmailLoginZustandType>()(
  persist(
    (set) => ({
      email: "",
      password: "",
      name: "",
      setEmail: (email: string) => set({ email: email }),
      setPassword: (password: string) => set({ password: password }),
      setName: (name: string) => set({ name: name }),
    }),
    {
      name: "email-login",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useEmailSignUpZustand = create<EmailSignUpZustandType>()(
  persist(
    (set) => ({
      email: "",
      password: "",
      name: "",
      verifyPassword: "",
      setEmail: (email: string) => set({ email: email }),
      setPassword: (password: string) => set({ password: password }),
      setName: (name: string) => set({ name: name }),
      setVerifyPassword: (verifyPassword: string) =>
        set({ verifyPassword: verifyPassword }),
      clearStorage: () =>
        set({ email: "", password: "", name: "", verifyPassword: "" }),
    }),
    {
      name: "email-signup",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
