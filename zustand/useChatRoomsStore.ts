/*
2025-10-14 07:16:19

Robust Unread Count Management with Zustand

전략:
1. React Query의 데이터를 Zustand에 동기화 (Single Source of Truth)
2. Realtime 업데이트는 optimistic, 즉시 React Query invalidate로 검증
3. 포커스 이벤트, 채팅룸 진입/퇴장 시 명시적 동기화
4. 주기적 검증으로 drift 방지

*/
// zustand/useChatRoomsStore.ts

import { create } from "zustand";
import { Database } from "@/db/supabase/supabase";

type ChatRoom =
  Database["public"]["Functions"]["get_user_chat_rooms"]["Returns"][0];

interface UnreadCountMap {
  [roomId: string]: number;
}

interface ChatRoomsState {
  // 📊 상태
  chatRooms: ChatRoom[];
  unreadCounts: UnreadCountMap;
  totalUnreadCount: number;
  isLoading: boolean;
  error: Error | null;
  lastSyncTime: number | null; // 마지막 동기화 시간
  isSyncing: boolean; // 동기화 진행 중

  // 🎬 액션
  setChatRooms: (rooms: ChatRoom[]) => void;
  setUnreadCounts: (counts: UnreadCountMap) => void;
  updateUnreadCount: (roomId: string, count: number) => void;
  incrementUnreadCount: (roomId: string) => void;
  resetUnreadCount: (roomId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;

  // 🔄 동기화 관련
  setSyncing: (syncing: boolean) => void;
  markSynced: () => void;
  needsSync: () => boolean;
}

const SYNC_THRESHOLD_MS = 5 * 60 * 1000; // 5분 이상 지나면 재동기화 권장

export const useChatRoomsStore = create<ChatRoomsState>()((set, get) => ({
  // 초기 상태
  chatRooms: [],
  unreadCounts: {},
  totalUnreadCount: 0,
  isLoading: false,
  error: null,
  lastSyncTime: null,
  isSyncing: false,

  // 채팅룸 목록 설정
  setChatRooms: (rooms) => set({ chatRooms: rooms }),

  // Unread counts 일괄 설정 (자동으로 total 계산)
  setUnreadCounts: (counts) => {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    set({ unreadCounts: counts, totalUnreadCount: total });
  },

  // 특정 룸의 unread count 업데이트
  updateUnreadCount: (roomId, count) => {
    const newCounts = { ...get().unreadCounts, [roomId]: count };
    const total = Object.values(newCounts).reduce((sum, c) => sum + c, 0);
    set({ unreadCounts: newCounts, totalUnreadCount: total });
  },

  // 특정 룸의 unread count 증가 (새 메시지 도착) - Optimistic
  incrementUnreadCount: (roomId) => {
    const currentCount = get().unreadCounts[roomId] || 0;
    get().updateUnreadCount(roomId, currentCount + 1);
  },

  // 특정 룸의 unread count 리셋 (읽음 처리) - Optimistic
  resetUnreadCount: (roomId) => {
    get().updateUnreadCount(roomId, 0);
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // 동기화 상태 관리
  setSyncing: (syncing) => set({ isSyncing: syncing }),

  markSynced: () => set({ lastSyncTime: Date.now() }),

  // 동기화 필요 여부 확인
  needsSync: () => {
    const { lastSyncTime } = get();
    if (!lastSyncTime) return true;
    return Date.now() - lastSyncTime > SYNC_THRESHOLD_MS;
  },
}));

// 🎯 Selector Hooks (성능 최적화)
export const useUnreadTotal = () =>
  useChatRoomsStore((state) => state.totalUnreadCount);

export const useUnreadCountForRoom = (roomId: string) =>
  useChatRoomsStore((state) => state.unreadCounts[roomId] || 0);

export const useChatRoomsList = () =>
  useChatRoomsStore((state) => state.chatRooms);
