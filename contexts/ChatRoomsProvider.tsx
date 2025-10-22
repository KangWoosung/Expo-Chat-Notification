/*
2025-10-14 07:18:49

Robust ChatRooms Provider with React Query + Zustand

전략:
1. React Query로 데이터 fetch (retry, cache, auto-refetch)
2. 데이터를 Zustand에 동기화
3. Realtime 업데이트 → Optimistic Zustand 업데이트 + React Query invalidate (검증)
4. 앱 포그라운드 복귀 시 자동 재동기화
5. 네트워크 재연결 시 자동 재동기화
6. 채팅룸 포커스 시 명시적 refetch
7. 주기적 백그라운드 검증 (선택적)

*/
// contexts/ChatRoomsProvider.tsx

import React, { useEffect, useRef, useCallback } from "react";
import { useSupabase } from "./SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useChatRoomsStore } from "@/zustand/useChatRoomsStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppState, AppStateStatus } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

// Query Keys
export const chatRoomsQueryKeys = {
  all: ["chatRooms"] as const,
  user: (userId: string) => [...chatRoomsQueryKeys.all, userId] as const,
  unreadCounts: (userId: string) =>
    [...chatRoomsQueryKeys.all, userId, "unreadCounts"] as const,
};

export function ChatRoomsProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  const {
    setChatRooms,
    setUnreadCounts,
    incrementUnreadCount,
    setLoading,
    setError,
    markSynced,
  } = useChatRoomsStore();

  // 🎯 동기화 함수 (React Query → Zustand)
  const syncToZustand = useCallback(
    (
      rooms: any[] | undefined,
      counts: { room_id: string; unread_count: number }[] | undefined
    ) => {
      if (rooms) {
        setChatRooms(rooms);
      }

      if (counts) {
        const countsMap = counts.reduce(
          (acc, item) => {
            acc[item.room_id] = item.unread_count;
            return acc;
          },
          {} as { [key: string]: number }
        );
        setUnreadCounts(countsMap);
      }

      markSynced();
      console.log("✅ Synced to Zustand at", new Date().toISOString());
    },
    [setChatRooms, setUnreadCounts, markSynced]
  );

  // 📊 React Query: Chat Rooms 목록
  const chatRoomsQuery = useQuery({
    queryKey: chatRoomsQueryKeys.user(user?.id || ""),
    queryFn: async () => {
      if (!supabase || !user?.id) throw new Error("No supabase or user");

      console.log("🔄 Fetching chat rooms...");
      const { data, error } = await supabase.rpc("get_user_chat_rooms", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!supabase && !!user?.id,
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true, // 포커스 시 자동 refetch
    refetchOnReconnect: true, // 재연결 시 자동 refetch
  });

  // 📊 React Query: Unread Counts
  const unreadCountsQuery = useQuery({
    queryKey: chatRoomsQueryKeys.unreadCounts(user?.id || ""),
    queryFn: async () => {
      if (!supabase || !user?.id) throw new Error("No supabase or user");

      console.log("🔄 Fetching unread counts...");
      const { data, error } = await supabase.rpc("get_user_unread_counts", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!supabase && !!user?.id,
    staleTime: 30 * 1000, // 30초 (unread는 자주 변경되므로 짧게)
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // 🔄 React Query 데이터를 Zustand에 동기화
  useEffect(() => {
    syncToZustand(chatRoomsQuery.data, unreadCountsQuery.data);
  }, [chatRoomsQuery.data, unreadCountsQuery.data, syncToZustand]);

  // 🔄 로딩/에러 상태 동기화
  useEffect(() => {
    setLoading(chatRoomsQuery.isLoading || unreadCountsQuery.isLoading);
    setError(
      (chatRoomsQuery.error as Error) || (unreadCountsQuery.error as Error)
    );
  }, [
    chatRoomsQuery.isLoading,
    unreadCountsQuery.isLoading,
    chatRoomsQuery.error,
    unreadCountsQuery.error,
    setLoading,
    setError,
  ]);

  // 📱 앱 포그라운드/백그라운드 감지 → 자동 재동기화
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("📱 App came to foreground → Refetching data");
          queryClient.invalidateQueries({
            queryKey: chatRoomsQueryKeys.all,
          });
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [queryClient]);

  // 🌐 네트워크 재연결 감지 → 자동 재동기화
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("🌐 Network reconnected → Refetching data");
        queryClient.invalidateQueries({
          queryKey: chatRoomsQueryKeys.all,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // 🔴 Realtime 구독: 새 메시지 & 읽음 처리
  useEffect(() => {
    if (!supabase || !user?.id) return;

    console.log("🔴 Setting up realtime subscriptions...");

    // 1️⃣ 새 메시지 구독 (Optimistic Update + Validation)
    const messagesChannel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=neq.${user.id}`,
        },
        (payload) => {
          const message = payload.new;
          if (message.sender_id !== user.id) {
            console.log("📨 New message received, incrementing count");

            // Optimistic: Zustand에 즉시 반영
            incrementUnreadCount(message.room_id);

            // Validation: React Query invalidate → 서버에서 실제 값 가져와 검증
            setTimeout(() => {
              queryClient.invalidateQueries({
                queryKey: chatRoomsQueryKeys.unreadCounts(user.id),
              });
            }, 500); // 500ms 후 검증 (DB 반영 대기)
          }
        }
      )
      .subscribe();

    // 2️⃣ 읽음 처리 구독 (Immediate Refetch)
    const readsChannel = supabase
      .channel("last-read-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "last_read_messages",
          filter: `user_id=eq.${user.id}`, // 서버 필터링 추가
        },
        async (payload: any) => {
          if (payload.new?.user_id === user.id) {
            console.log("✅ Read status updated, refetching unread counts");

            // 즉시 refetch (읽음 처리는 정확해야 하므로)
            queryClient.invalidateQueries({
              queryKey: chatRoomsQueryKeys.unreadCounts(user.id),
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🔴 Cleaning up realtime subscriptions");
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(readsChannel);
    };
  }, [supabase, user?.id, queryClient, incrementUnreadCount]);

  // 🔄 주기적 검증 (선택적, 장시간 사용 시 drift 방지)
  useEffect(() => {
    if (!user?.id) return;

    // 5분마다 백그라운드 검증
    const interval = setInterval(
      () => {
        console.log("🔄 Periodic validation check");
        queryClient.invalidateQueries({
          queryKey: chatRoomsQueryKeys.unreadCounts(user.id),
        });
      },
      5 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [user?.id, queryClient]);

  return <>{children}</>;
}

// 🎯 채팅룸 포커스 시 사용할 유틸리티 훅
export function useChatRoomFocusSync(roomId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useUser();

  useEffect(() => {
    if (roomId && user?.id) {
      console.log(`🎯 Chat room ${roomId} focused → Refetching unread counts`);

      // 채팅룸에 입장하면 해당 룸의 unread 상태 즉시 동기화
      queryClient.invalidateQueries({
        queryKey: chatRoomsQueryKeys.unreadCounts(user.id),
      });
    }
  }, [roomId, user?.id, queryClient]);
}
