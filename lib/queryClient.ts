// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 실패 시 재시도 횟수 (기본 3번인데 보통 줄임)
      refetchOnWindowFocus: false, // 창 포커스 돌아올 때 자동 refetch 방지
      refetchOnReconnect: true, // 네트워크 재연결 시 refetch
      staleTime: 1000 * 60 * 1, // 1분 동안 fresh 상태
      gcTime: 1000 * 60 * 5, // 5분 동안 캐시에 유지 (garbage collection time)
    },
    mutations: {
      retry: 0, // 보통 mutation은 재시도 안 하게 둠
    },
  },
});
