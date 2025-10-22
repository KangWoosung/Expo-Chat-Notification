# Robust Unread Count Architecture

## 📋 개요

이 아키텍처는 React Query + Zustand + Realtime을 결합하여 **신뢰할 수 있는 unread count 관리**를 제공합니다.

### 핵심 질문에 대한 답변

#### Q1: "채팅룸 입장/퇴장 시 unread count 업데이트는 어디서?"

**A:** 3단계 방어선

1. **Realtime 구독** → `last_read_messages` 테이블 변경 감지
2. **React Query Invalidation** → 즉시 서버에서 최신 데이터 fetch
3. **useChatRoomFocusSync 훅** → 채팅룸 화면에서 명시적 동기화

#### Q2: "초기 로딩 또는 Realtime 처리 오류 시 복구 전략은?"

**A:** 다중 복구 메커니즘

1. **Retry Logic** - React Query가 3회까지 자동 재시도 (exponential backoff)
2. **Auto Refetch** - 앱 포그라운드 복귀 시 자동 재동기화
3. **Network Reconnect** - 네트워크 재연결 시 자동 재동기화
4. **Periodic Validation** - 5분마다 백그라운드 검증
5. **Manual Sync** - 필요 시 수동 동기화 가능

#### Q3: "12시간 연속 사용 시 신뢰성은?"

**A:** Long-running Session 대응

- ✅ 주기적 검증 (5분)
- ✅ Optimistic Update + Server Validation
- ✅ 네트워크 오류 자동 감지 및 복구
- ✅ Drift 누적 방지

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ChatRoomsProvider                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Query (Source of Truth)                       │   │
│  │  - Auto retry (3x, exponential backoff)              │   │
│  │  - Auto refetch on focus/reconnect                   │   │
│  │  - Stale time: 30s (unread), 1min (rooms)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Zustand Store (UI State Sync)                       │   │
│  │  - Optimistic updates                                │   │
│  │  - Sync tracking (lastSyncTime)                      │   │
│  │  - Selective subscriptions (performance)             │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↑                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Realtime Subscriptions                              │   │
│  │  1. New message → Optimistic increment               │   │
│  │     + 500ms delayed validation                       │   │
│  │  2. Read status → Immediate refetch                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Lifecycle Listeners                                 │   │
│  │  - App State (foreground/background)                 │   │
│  │  - Network State (reconnect)                         │   │
│  │  - Periodic Validation (5min interval)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Components                              │
│  - (tabs)/_layout.tsx      → useUnreadTotal()               │
│  - InitScreenUnreadSection → useChatRoomsStore()            │
│  - ExistingChatRooms       → useChatRoomsStore()            │
│  - ChatRoom (focused)      → useChatRoomFocusSync(roomId)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 파일 구조

```
zustand/
  └── useChatRoomsStore.ts          # Zustand store (UI state)

contexts/
  └── ChatRoomsProvider.tsx         # Provider (data fetching & sync)

hooks/
  └── useChatRoomFocusSync.ts       # (exported from Provider)

components/
  ├── app/InitScreenUnreadSection.tsx
  ├── chatList/ExistingChatRooms.tsx
  └── ...
```

---

## 🚀 사용법

### 1. Provider 등록 (최상위)

```tsx
// app/_layout.tsx
import { ChatRoomsProvider } from "@/contexts/ChatRoomsProvider";

export default function RootLayout() {
  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <ChatRoomsProvider>
          {" "}
          {/* 👈 추가 */}
          {/* ...나머지 앱 */}
        </ChatRoomsProvider>
      </QueryClientProvider>
    </SupabaseProvider>
  );
}
```

### 2. 컴포넌트에서 사용

#### 2-1. Total Unread Count (헤더, 뱃지 등)

```tsx
// (tabs)/_layout.tsx
import { useUnreadTotal } from "@/zustand/useChatRoomsStore";

function TabLayout() {
  const unreadMessagesCountTotal = useUnreadTotal(); // ✅ 간단!

  return (
    <Tabs.Screen
      headerRight={() => <NotificationBadge count={unreadMessagesCountTotal} />}
    />
  );
}
```

#### 2-2. 채팅룸 목록 + Unread Counts

```tsx
// ExistingChatRooms.tsx
import { useChatRoomsStore } from "@/zustand/useChatRoomsStore";

function ExistingChatRooms() {
  const { chatRooms, unreadCounts, isLoading } = useChatRoomsStore();

  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => (
        <ChatRoomItem
          room={item}
          unreadCount={unreadCounts[item.room_id] || 0}
        />
      )}
    />
  );
}
```

#### 2-3. 특정 룸의 Unread Count

```tsx
import { useUnreadCountForRoom } from "@/zustand/useChatRoomsStore";

function ChatRoomPreview({ roomId }: { roomId: string }) {
  const unreadCount = useUnreadCountForRoom(roomId); // 선택적 구독 (성능 최적화)

  return <Badge count={unreadCount} />;
}
```

#### 2-4. 채팅룸 포커스 시 동기화

```tsx
// app/(stack)/chat_room/index.tsx
import { useChatRoomFocusSync } from "@/contexts/ChatRoomsProvider";
import { useLocalSearchParams } from "expo-router";

function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams();

  // 이 채팅룸에 포커스 시 자동으로 unread count 동기화
  useChatRoomFocusSync(roomId as string);

  return <ChatRoomView />;
}
```

---

## 🛡️ 신뢰성 보장 메커니즘

### 1. **Optimistic Update + Validation**

```typescript
// 새 메시지 도착 시
Realtime Event → Zustand 즉시 업데이트 (Optimistic)
              → 500ms 후 React Query invalidate (Validation)
```

### 2. **자동 복구 시나리오**

| 시나리오                   | 감지                    | 복구 동작                        |
| -------------------------- | ----------------------- | -------------------------------- |
| 앱 백그라운드 → 포그라운드 | AppState listener       | 자동 refetch                     |
| 네트워크 단절 → 재연결     | NetInfo listener        | 자동 refetch                     |
| 초기 로딩 실패             | React Query error       | 3회 재시도 (exponential backoff) |
| Realtime 구독 끊김         | Supabase channel status | 자동 재구독                      |
| 데이터 drift (장시간 사용) | 5분 interval            | 백그라운드 검증                  |
| 채팅룸 입장/퇴장           | useChatRoomFocusSync    | 명시적 refetch                   |

### 3. **성능 최적화**

- **Selector 기반 구독**: 필요한 데이터만 구독 → 불필요한 리렌더링 방지
- **React Query 캐싱**: 중복 fetch 방지
- **Debounced Validation**: Optimistic update 후 검증에 500ms 딜레이

---

## 🔧 설정 변경

### Sync 주기 조정

```typescript
// zustand/useChatRoomsStore.ts
const SYNC_THRESHOLD_MS = 5 * 60 * 1000; // 5분 → 원하는 값으로 변경

// contexts/ChatRoomsProvider.tsx
const interval = setInterval(
  () => {
    // 주기적 검증
  },
  5 * 60 * 1000
); // 5분 → 원하는 값으로 변경
```

### Stale Time 조정

```typescript
// contexts/ChatRoomsProvider.tsx
const unreadCountsQuery = useQuery({
  // ...
  staleTime: 30 * 1000, // 30초 → 원하는 값으로 변경
});
```

---

## 🧪 테스트 시나리오

### 정상 동작 검증

1. ✅ 다른 사용자가 메시지 전송 → 즉시 unread count 증가
2. ✅ 채팅룸 입장 → unread count 0으로 변경
3. ✅ 채팅룸 퇴장 → 다시 메시지 오면 unread count 증가

### 에러 복구 검증

1. ✅ 앱 백그라운드 → 포그라운드 복귀 시 최신 데이터 반영
2. ✅ 비행기 모드 ON → OFF 시 자동 동기화
3. ✅ 초기 로딩 실패 (서버 오류) → 자동 재시도
4. ✅ 12시간 연속 사용 → 주기적 검증으로 정확도 유지

---

## 🚨 주의사항

### 제거해야 할 기존 코드

1. **UnreadMessagesCountProvider** (deprecated)
   - `contexts/UnreadMessagesCountProvider.tsx` 제거 가능
   - 또는 레거시 호환성 위해 내부적으로 ChatRoomsProvider 사용하도록 리팩토링

2. **useMyChatRoomsWithUnread** (부분적으로 deprecated)
   - 직접 사용 대신 `useChatRoomsStore()` 사용 권장
   - 하지만 ChatRoomsProvider 내부에서 React Query 로직 재사용 가능

3. **useRealtimeUnreadUpdater** (deprecated)
   - ChatRoomsProvider에 통합됨
   - 별도 호출 불필요

---

## 📊 성능 지표

### 기대 효과

- 🚀 **중복 fetch 제거**: 여러 컴포넌트에서 동일한 데이터 사용 시 1회만 fetch
- ⚡ **리렌더링 최적화**: Selector 기반 구독으로 변경된 부분만 업데이트
- 🛡️ **신뢰성 향상**: 다중 복구 메커니즘으로 데이터 정확도 보장
- 📡 **서버 부하 감소**: React Query 캐싱 + 적절한 staleTime

---

## 🤔 FAQ

**Q: 기존 코드를 즉시 모두 마이그레이션해야 하나요?**
A: 아니요. 단계적 마이그레이션 가능:

1. ChatRoomsProvider만 추가
2. 새로운 컴포넌트는 Zustand store 사용
3. 기존 컴포넌트는 점진적으로 마이그레이션

**Q: React Query 없이도 사용 가능한가요?**
A: 가능은 하지만 비권장. React Query의 자동 retry, refetch 기능이 신뢰성의 핵심입니다.

**Q: Realtime 구독이 끊기면 어떻게 되나요?**
A: Supabase는 자동으로 재구독을 시도하며, 앱 포그라운드 복귀 시에도 자동으로 최신 데이터를 fetch합니다.

**Q: 서버 비용이 증가하지 않나요?**
A: React Query 캐싱 덕분에 오히려 감소합니다. 동일한 데이터를 여러 번 fetch하지 않습니다.

---

## 📚 참고 자료

- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Supabase Realtime 가이드](https://supabase.com/docs/guides/realtime)
