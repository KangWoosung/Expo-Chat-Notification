/**
 * 통합된 쿼리 키 관리 시스템
 * 모든 React Query 쿼리 키를 중앙에서 관리하여 일관성과 캐시 무효화 효율성 확보
 */

export const queryKeys = {
  // 채팅방 관련
  chatRooms: {
    all: ["chatRooms"] as const,
    mine: (userId: string) =>
      [...queryKeys.chatRooms.all, "mine", userId] as const,
    // 그룹 채팅방 관련 쿼리 추가 (필요시)
    group: (roomId: string) =>
      [...queryKeys.chatRooms.all, "group", roomId] as const,
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
  },

  // 사용자 관련
  users: {
    all: ["users"] as const,
    allUsers: (pageStart: number, pageEnd: number) =>
      [...queryKeys.users.all, "allUsers", pageStart, pageEnd] as const,
  },

  // 파일 관련
  files: {
    all: ["files"] as const,
    uploaded: (userId?: string) =>
      [...queryKeys.files.all, "uploaded", userId] as const,
    byId: (fileId: string) => [...queryKeys.files.all, "byId", fileId] as const,
  },

  // 읽지 않은 메시지 관련
  unread: {
    all: ["unread"] as const,
    count: (userId: string) =>
      [...queryKeys.unread.all, "count", userId] as const,
  },
} as const;

// 기존 호환성을 위한 별칭들
export const improvedMessagesKeys = {
  room: (roomId: string) => queryKeys.messages.improved(roomId, true),
};
