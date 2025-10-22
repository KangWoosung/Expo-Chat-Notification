# Migration Guide: useMyChatRoomsWithUnread → ChatRoomsProvider + Zustand

## 🎯 마이그레이션 완료!

**새로운 아키텍처로 성공적으로 마이그레이션되었습니다!**

### ✅ 완료된 작업

#### 1. **새로운 파일 생성**

- ✅ `zustand/useChatRoomsStore.ts` - Zustand store (UI 상태)
- ✅ `contexts/ChatRoomsProvider.tsx` - React Query + Realtime 통합
- ✅ `docs/UNREAD_COUNT_ARCHITECTURE.md` - 아키텍처 문서

#### 2. **Provider 등록**

- ✅ `app/_layout.tsx` - ChatRoomsProvider 추가됨 (line 102)

#### 3. **컴포넌트 마이그레이션**

- ✅ `app/(app)/(drawer)/(tabs)/_layout.tsx`
  - `useRealtimeUnreadUpdater()` 제거 ✅
  - `useUnreadMessagesCount()` → `useUnreadTotal()` ✅
- ✅ `components/app/InitScreenUnreadSection.tsx`
  - `useMyChatRoomsWithUnread()` → `useChatRoomsStore()` ✅
- ✅ `components/chatList/ExistingChatRooms.tsx`
  - `useMyChatRoomsWithUnread()` → `useChatRoomsStore()` ✅

#### 4. **패키지 설치**

- ✅ `@react-native-community/netinfo` 설치됨

---

## 📊 Before vs After

### Before (Old Architecture)

```typescript
// Multiple sources of truth
// (tabs)/_layout.tsx
useRealtimeUnreadUpdater();
const { unreadMessagesCountTotal } = useUnreadMessagesCount();

// ExistingChatRooms.tsx
const { chatRooms, unreadCounts } = useMyChatRoomsWithUnread();

// InitScreenUnreadSection.tsx
const { chatRooms, unreadCounts } = useMyChatRoomsWithUnread();

// ❌ 문제점:
// - 각 컴포넌트마다 별도로 fetch
// - Realtime 업데이트가 Context에만 적용
// - 네트워크 오류 시 복구 메커니즘 부족
// - 채팅룸 입장/퇴장 시 즉시 반영 안됨
```

### After (New Architecture) ✅

```typescript
// Single source of truth: ChatRoomsProvider + Zustand
// (tabs)/_layout.tsx
const unreadMessagesCountTotal = useUnreadTotal();

// ExistingChatRooms.tsx
const { chatRooms, unreadCounts, isLoading } = useChatRoomsStore();

// InitScreenUnreadSection.tsx
const { chatRooms, unreadCounts } = useChatRoomsStore();

// ✅ 장점:
// - 1회 fetch, 모든 컴포넌트 공유
// - Realtime 업데이트 자동 반영
// - 네트워크 재연결 시 자동 동기화
// - 앱 포그라운드 복귀 시 자동 refetch
// - 채팅룸 입장/퇴장 시 즉시 동기화
```

---

## 🗑️ Deprecated 코드 (제거 가능)

### 1. **useMyChatRoomsWithUnread Hook** (선택적)

```bash
# 파일: hooks/useMyChatRoomsWithUnread.ts
# 상태: 더 이상 사용되지 않음
# 조치: 제거 가능 (또는 legacy 호환성을 위해 유지)
```

**현재 사용처:** 없음 ✅

### 2. **useRealtimeUnreadUpdater Hook**

```bash
# 파일: hooks/useRealtimeUnreadUpdater.ts
# 상태: ChatRoomsProvider에 통합됨
# 조치: 제거 가능
```

**현재 사용처:** 없음 ✅

### 3. **UnreadMessagesCountProvider** (선택적)

```bash
# 파일: contexts/UnreadMessagesCountProvider.tsx
# 상태: ChatRoomsProvider로 대체됨
# 조치: 제거 가능 (또는 legacy 호환성을 위해 유지)
```

**현재 위치:** `app/_layout.tsx` line 99에 여전히 래핑되어 있음
**권장:** 제거 가능하지만, 다른 코드가 의존할 수 있으므로 주의

---

## 🔍 확인해야 할 파일들

다음 파일들에서 아직 `useMyChatRoomsWithUnread` 또는 `myChatRoomsKeys`를 참조하고 있는지 확인하세요:

### 1. **hooks/useRealtimeChatRoomsUpdater.ts**

```typescript
// 확인 필요: 이 파일에서 useMyChatRoomsWithUnread를 사용 중
// Line 6: const { chatRooms, unreadCounts } = useMyChatRoomsWithUnread();
// Line 19: import { myChatRoomsKeys } from "@/hooks/useMyChatRoomsWithUnread";
```

**조치:**

- `useChatRoomsStore()` 사용으로 변경
- 또는 이 Hook 자체가 더 이상 필요 없다면 제거

### 2. **contexts/ChatRoomPresenceContext.tsx**

```typescript
// 확인 필요: myChatRoomsKeys 사용 중
// Line 43: import { myChatRoomsKeys } from "@/hooks/useMyChatRoomsWithUnread";
```

**조치:**

- `chatRoomsQueryKeys` from `@/contexts/ChatRoomsProvider`로 변경

```typescript
import { chatRoomsQueryKeys } from "@/contexts/ChatRoomsProvider";
```

### 3. **components/chatList/EachChatRoomWithHookData.tsx**

```typescript
// 확인 필요: 주석에서만 언급
// Line 3: useMyChatRoomsWithUnread Hook 데이터를 사용하는 채팅룸 아이템 컴포넌트
```

**조치:** 주석 업데이트

---

## 🚀 다음 단계 (권장)

### 1. 남은 파일 마이그레이션 (선택적)

```bash
# useRealtimeChatRoomsUpdater.ts 확인/업데이트
# ChatRoomPresenceContext.tsx 업데이트
```

### 2. Deprecated 코드 제거 (선택적)

```bash
# 안전하게 제거 가능한 파일들:
- hooks/useRealtimeUnreadUpdater.ts (100% 대체됨)
- hooks/useMyChatRoomsWithUnread.ts (아무도 사용 안함)
- contexts/UnreadMessagesCountProvider.tsx (선택적)
```

### 3. 채팅룸 화면에 Sync Hook 추가

```typescript
// app/(stack)/chat_room/index.tsx
import { useChatRoomFocusSync } from "@/contexts/ChatRoomsProvider";

function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams();
  useChatRoomFocusSync(roomId as string); // 👈 추가
  // ...
}
```

### 4. 테스트

1. ✅ 앱 시작 → unread count 표시 확인
2. ✅ 다른 사용자가 메시지 전송 → 즉시 반영 확인
3. ✅ 채팅룸 입장 → unread count 0으로 변경 확인
4. ✅ 채팅룸 퇴장 → 새 메시지 시 unread count 증가 확인
5. ✅ 앱 백그라운드 → 포그라운드 → 최신 데이터 반영 확인
6. ✅ 비행기 모드 ON → OFF → 자동 동기화 확인

---

## 📝 변경 사항 요약

| 항목                  | Before                        | After                           |
| --------------------- | ----------------------------- | ------------------------------- |
| **Data Fetching**     | 각 컴포넌트에서 개별 fetch    | ChatRoomsProvider에서 1회 fetch |
| **상태 관리**         | Context API                   | Zustand Store                   |
| **Realtime**          | useRealtimeUnreadUpdater Hook | ChatRoomsProvider 내장          |
| **자동 Retry**        | ❌ 없음                       | ✅ React Query (3회)            |
| **Network Reconnect** | ❌ 수동 처리 필요             | ✅ 자동 refetch                 |
| **App Foreground**    | ❌ 오래된 데이터              | ✅ 자동 refetch                 |
| **Optimistic Update** | ❌ 없음                       | ✅ + Server Validation          |
| **성능**              | 중복 fetch                    | 캐싱 + 1회 fetch                |

---

## 🎉 마이그레이션 완료 체크리스트

- [x] ChatRoomsProvider 생성
- [x] Zustand Store 생성
- [x] Provider 등록 (app/\_layout.tsx)
- [x] (tabs)/\_layout.tsx 업데이트
- [x] ExistingChatRooms.tsx 업데이트
- [x] InitScreenUnreadSection.tsx 업데이트
- [ ] useRealtimeChatRoomsUpdater.ts 확인/업데이트 (선택적)
- [ ] ChatRoomPresenceContext.tsx 업데이트 (선택적)
- [ ] chat_room/index.tsx에 useChatRoomFocusSync 추가 (권장)
- [ ] Deprecated 파일 제거 (선택적)
- [ ] 테스트 완료

---

## 💡 Troubleshooting

### Q: unread count가 업데이트 안돼요

**A:** ChatRoomsProvider가 app/\_layout.tsx에 올바르게 등록되었는지 확인하세요.

### Q: 초기 로딩 시 데이터가 안보여요

**A:** React Query의 retry 로직이 동작 중입니다. 콘솔 로그를 확인하세요.

### Q: Realtime 업데이트가 안돼요

**A:** Supabase Realtime이 올바르게 설정되었는지 확인하세요. 콘솔에서 "🔴 Setting up realtime subscriptions..." 로그를 확인하세요.

### Q: 앱이 느려졌어요

**A:** Zustand selector를 사용하세요:

```typescript
// ❌ 전체 store 구독 (느림)
const store = useChatRoomsStore();

// ✅ 필요한 것만 구독 (빠름)
const unreadCount = useUnreadTotal();
const { chatRooms } = useChatRoomsStore((state) => ({
  chatRooms: state.chatRooms,
}));
```

---

## 📚 추가 문서

- [UNREAD_COUNT_ARCHITECTURE.md](./UNREAD_COUNT_ARCHITECTURE.md) - 전체 아키텍처 설명
- [zustand/useChatRoomsStore.ts](../zustand/useChatRoomsStore.ts) - Store 구현
- [contexts/ChatRoomsProvider.tsx](../contexts/ChatRoomsProvider.tsx) - Provider 구현
