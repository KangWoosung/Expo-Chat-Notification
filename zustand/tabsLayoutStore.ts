/*
2025-08-24 19:42:38

uploaded, incoming 각 카테고리의 파일 목록이,  
setFilesCategory 이벤트에 자동으로 변경되어야 하는데,


*/
// zustand/tabsLayoutStore.ts

import { create } from "zustand";

// files category
export enum FilesCategory {
  UPLOADED = "uploaded",
  INCOMING = "incoming",
}

// chat room create data
export type ChatRoomCreateData = {
  roomName: string;
  participants: string[];
  isPrivate?: boolean;
};

export interface TabsLayoutState {
  // 📊 카운트 관련 (정적 상태로 시작)
  notificationCount: number;
  chatNotificationCount: number;

  // 📁 파일 카테고리 관리
  filesCategory: FilesCategory;

  // 🔄 로딩 상태들
  isCreatingChatRoom: boolean;
  isLoadingNotifications: boolean;

  // 🎬 액션 메서드들
  setNotificationCount: (count: number) => void;
  setChatNotificationCount: (count: number) => void;
  setFilesCategory: (category: FilesCategory) => void;
  createChatRoom: (data: ChatRoomCreateData) => Promise<string | null>;

  // 🔧 유틸리티 메서드들
  resetCounts: () => void;
  incrementNotificationCount: () => void;
  decrementNotificationCount: () => void;
}

const initialState = {
  // 카운트는 0부터 시작
  notificationCount: 99,
  chatNotificationCount: 0,

  // 파일 카테고리는 'uploaded'가 기본값 (타입과 일치시킴)
  filesCategory: "uploaded" as FilesCategory,

  // 로딩 상태들은 false
  isCreatingChatRoom: false,
  isLoadingNotifications: false,
};

// 일단 persist 없이 기본 스토어로 시작 (나중에 필요시 추가)
export const useTabsLayoutStore = create<TabsLayoutState>()((set, get) => ({
  // 📊 초기 상태
  ...initialState,

  // 🎬 기본 액션들
  setNotificationCount: (count: number) => set({ notificationCount: count }),

  setChatNotificationCount: (count: number) =>
    set({ chatNotificationCount: count }),

  setFilesCategory: (category: FilesCategory) => {
    console.log("=== Zustand: setFilesCategory called with:", category);
    set({ filesCategory: category });
  },

  // 🚀 비즈니스 로직 메서드들
  createChatRoom: async (data: ChatRoomCreateData) => {
    set({ isCreatingChatRoom: true });
    try {
      // TODO: 실제 채팅방 생성 로직 구현
      console.log("Creating chat room:", data);

      // 임시로 랜덤 ID 반환
      const roomId = `room_${Date.now()}`;
      return roomId;
    } catch (error) {
      console.error("Failed to create chat room:", error);
      return null;
    } finally {
      set({ isCreatingChatRoom: false });
    }
  },

  // 🔧 유틸리티 메서드들
  resetCounts: () =>
    set({
      notificationCount: 0,
      chatNotificationCount: 0,
    }),

  incrementNotificationCount: () =>
    set((state) => ({
      notificationCount: state.notificationCount + 1,
    })),

  decrementNotificationCount: () =>
    set((state) => ({
      notificationCount: Math.max(0, state.notificationCount - 1),
    })),
}));
