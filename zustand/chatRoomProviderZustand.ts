import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "expo-zustand-persist";
import { create } from "zustand";

type ChatRoomProviderZustandType = {
  chatRoomId: string | null;
  chatRoomName: string;
  setChatRoomId: (id: string) => void;
  setChatRoomName: (name: string) => void;
  clearStorage: () => void;
};

const useChatRoomProviderZustand = create<ChatRoomProviderZustandType>()(
  persist(
    (set) => ({
      chatRoomId: null,
      chatRoomName: "",
      setChatRoomId: (id: string) => set({ chatRoomId: id }),
      setChatRoomName: (name: string) => set({ chatRoomName: name }),
      clearStorage: () => set({ chatRoomId: null, chatRoomName: "" }),
    }),
    {
      name: "chat-room-provider",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useChatRoomProviderZustand;
