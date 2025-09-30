/**
 * 통합된 쿼리 키 관리 시스템
 * 모든 React Query 쿼리 키를 중앙에서 관리하여 일관성과 캐시 무효화 효율성 확보
 *
 * 2025-10-01 08:10:13
 *
 * Usage:
 * import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
 * import { queryKeys } from "@/lib/queryKeys"
 *
 * function useMessages(roomId: string) {
 *   return useQuery({
 *     queryKey: queryKeys.messages.room(roomId),
 *     queryFn: () => fetchMessages(roomId),
 *   })
 * }
 */

export const queryKeys = {
  // 사용자 관련
  users: {
    all: ["users"] as const,
    allUsers: (pageStart: number, pageEnd: number) =>
      [...queryKeys.users.all, "allUsers", pageStart, pageEnd] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    search: (keyword: string) =>
      [...queryKeys.users.all, "search", keyword] as const,
  },

  // 채팅방 관련
  chatRooms: {
    all: ["chatRooms"] as const,
    mine: (userId: string) =>
      [...queryKeys.chatRooms.all, "mine", userId] as const,
    detail: (roomId: string, currentUserId?: string) =>
      [...queryKeys.chatRooms.all, "detail", roomId, currentUserId] as const,
    group: (roomId: string) =>
      [...queryKeys.chatRooms.all, "group", roomId] as const,
  },

  // 채팅방 멤버 관련
  chatRoomMembers: {
    all: ["chatRoomMembers"] as const,
    listByRoom: (roomId: string) =>
      [...queryKeys.chatRoomMembers.all, "room", roomId] as const,
    listByUser: (userId: string) =>
      [...queryKeys.chatRoomMembers.all, "user", userId] as const,
  },

  // 메시지 관련
  messages: {
    all: ["messages"] as const,
    room: (roomId: string) =>
      [...queryKeys.messages.all, "room", roomId] as const,
    improved: (roomId: string, includeFileInfo: boolean) =>
      [
        ...queryKeys.messages.room(roomId),
        "improved",
        includeFileInfo,
      ] as const,
    detail: (messageId: string) =>
      [...queryKeys.messages.all, "detail", messageId] as const,
    latest: (roomId: string) =>
      [...queryKeys.messages.all, "latest", roomId] as const,
  },

  // 파일 관련
  files: {
    all: ["files"] as const,
    uploaded: (userId: string) =>
      [...queryKeys.files.all, "uploaded", userId] as const,
    incoming: (userId: string) =>
      [...queryKeys.files.all, "incoming", userId] as const,
    byId: (fileId: string) => [...queryKeys.files.all, "byId", fileId] as const,
  },

  // 스토리지 사용량 관련
  storage: {
    all: ["storage"] as const,
    usage: (userId: string) =>
      [...queryKeys.storage.all, "usage", userId] as const,
  },

  // 읽지 않은 메시지 관련
  unread: {
    all: ["unread"] as const,
    count: (userId: string) =>
      [...queryKeys.unread.all, "count", userId] as const,
  },

  // 방에 있는 사용자 (실시간 접속) 관련
  usersInRoom: {
    all: ["usersInRoom"] as const,
    list: (roomId: string) =>
      [...queryKeys.usersInRoom.all, "room", roomId] as const,
  },
} as const;

// 기존 호환성을 위한 별칭들
export const improvedMessagesKeys = {
  room: (roomId: string) => queryKeys.messages.improved(roomId, true),
};

export const uploadedFilesKeys = {
  all: queryKeys.files.all,
  user: (userId: string) => queryKeys.files.uploaded(userId),
};

export const incomingFilesKeys = {
  all: ["incomingFiles"] as const,
  user: (userId: string) => queryKeys.files.incoming(userId),
};

export const fileByIdKeys = {
  all: ["fileById"] as const,
  file: (fileId: string) => queryKeys.files.byId(fileId),
};

export const chatRoomMessagesKeys = {
  all: ["chatRoomMessages"] as const,
  room: (roomId: string) => queryKeys.messages.room(roomId),
};

export const storageUsageKeys = {
  all: queryKeys.storage.all,
  user: (userId: string) => queryKeys.storage.usage(userId),
};
