// useBottomSheetStore.ts
import { create } from "zustand";

type SheetContent = null | React.ReactNode;

interface SheetState {
  bottomSheetContent: SheetContent;
  setBottomSheetContent: (c: SheetContent) => void;
}

export const useBottomSheetStore = create<SheetState>((set) => ({
  bottomSheetContent: null,
  setBottomSheetContent: (c) => set({ bottomSheetContent: c }),
}));
