// 채팅 앱 초기 더미 데이터 (initSchema 기반)

// import { v4 as uuidv4 } from "uuid";
import { Tables } from "@/db/supabase/supabase";

type Message = Tables<"messages">;

// 유저 더미 데이터
export const dummyUsers = [
  {
    user_id: "user-001",
    name: "김철수",
    email: "chulsoo@example.com",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    push_token: "ExponentPushToken[xxxxxxxxxxxxxx]",
    created_at: "2025-08-10T10:00:00.000Z",
    updated_at: "2025-08-10T10:00:00.000Z",
  },
  {
    user_id: "user-002",
    name: "이영희",
    email: "younghee@example.com",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    push_token: "ExponentPushToken[xxxxxxxxxxxxxx]",
    created_at: "2025-08-10T10:00:00.000Z",
    updated_at: "2025-08-10T10:00:00.000Z",
  },
  {
    user_id: "user-003",
    name: "박민수",
    email: "minsoo@example.com",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    push_token: "ExponentPushToken[xxxxxxxxxxxxxx]",
    created_at: "2025-08-10T10:00:00.000Z",
    updated_at: "2025-08-10T10:00:00.000Z",
  },
  {
    user_id: "user-004",
    name: "최지은",
    email: "jieun@example.com",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    push_token: "ExponentPushToken[xxxxxxxxxxxxxx]",
    created_at: "2025-08-10T10:00:00.000Z",
    updated_at: "2025-08-10T10:00:00.000Z",
  },
];

// 채팅방 더미 데이터
export const dummyChatRooms = [
  {
    room_id: "room-001",
    name: "Direct Chat",
    created_by: "user-001",
    created_at: "2025-08-10T10:00:00.000Z",
  },
  {
    room_id: "room-002",
    name: "Direct Chat",
    created_by: "user-002",
    created_at: "2025-08-10T10:05:00.000Z",
  },
  {
    room_id: "room-003",
    name: "Group Chat",
    created_by: "user-003",
    created_at: "2025-08-10T11:00:00.000Z",
  },
];

// 채팅방 멤버 더미 데이터
export const dummyChatRoomMembers = [
  // room-001: user-001, user-002 (1:1)
  {
    room_id: "room-001",
    user_id: "user-001",
    invited_by: "user-001",
    joined_at: "2025-08-10T10:00:10.000Z",
    role: "owner",
  },
  {
    room_id: "room-001",
    user_id: "user-002",
    invited_by: "user-001",
    joined_at: "2025-08-10T10:00:20.000Z",
    role: "member",
  },
  // room-002: user-002, user-003 (1:1)
  {
    room_id: "room-002",
    user_id: "user-002",
    invited_by: "user-002",
    joined_at: "2025-08-10T10:05:10.000Z",
    role: "owner",
  },
  {
    room_id: "room-002",
    user_id: "user-003",
    invited_by: "user-002",
    joined_at: "2025-08-10T10:05:20.000Z",
    role: "member",
  },
  // room-003: user-001, user-002, user-003, user-004 (그룹)
  {
    room_id: "room-003",
    user_id: "user-001",
    invited_by: "user-003",
    joined_at: "2025-08-10T11:00:10.000Z",
    role: "member",
  },
  {
    room_id: "room-003",
    user_id: "user-002",
    invited_by: "user-003",
    joined_at: "2025-08-10T11:00:20.000Z",
    role: "member",
  },
  {
    room_id: "room-003",
    user_id: "user-003",
    invited_by: "user-003",
    joined_at: "2025-08-10T11:00:00.000Z",
    role: "owner",
  },
  {
    room_id: "room-003",
    user_id: "user-004",
    invited_by: "user-003",
    joined_at: "2025-08-10T11:00:30.000Z",
    role: "member",
  },
];

// 메시지 더미 데이터
export const dummyMessages: Message[] = [
  // room-001
  {
    message_id: "msg-001",
    room_id: "room-001",
    sender_id: "user-001",
    content: "안녕하세요, 영희님!",
    sent_at: "2025-08-10T10:01:00.000Z",
    message_type: "text",
  },
  {
    message_id: "msg-002",
    room_id: "room-001",
    sender_id: "user-002",
    content: "안녕하세요, 철수님! 잘 지내시죠?",
    sent_at: "2025-08-10T10:01:10.000Z",
    message_type: "text",
  },
  // room-002
  {
    message_id: "msg-003",
    room_id: "room-002",
    sender_id: "user-002",
    content: "민수님, 오늘 회의 가능하신가요?",
    sent_at: "2025-08-10T10:06:00.000Z",
    message_type: "text",
  },
  {
    message_id: "msg-004",
    room_id: "room-002",
    sender_id: "user-003",
    content: "네, 가능합니다!",
    sent_at: "2025-08-10T10:06:10.000Z",
    message_type: "text",
  },
  // room-003 (group)
  {
    message_id: "msg-005",
    room_id: "room-003",
    sender_id: "user-003",
    content: "모두 안녕하세요! 그룹 채팅방에 오신 걸 환영합니다.",
    sent_at: "2025-08-10T11:01:00.000Z",
    message_type: "text",
  },
  {
    message_id: "msg-006",
    room_id: "room-003",
    sender_id: "user-001",
    content: "안녕하세요!",
    sent_at: "2025-08-10T11:01:10.000Z",
    message_type: "text",
  },
  {
    message_id: "msg-007",
    room_id: "room-003",
    sender_id: "user-002",
    content: "반갑습니다~",
    sent_at: "2025-08-10T11:01:20.000Z",
    message_type: "text",
  },
  {
    message_id: "msg-008",
    room_id: "room-003",
    sender_id: "user_312BJDPu1sXChmhpAODdTkeYhwv",
    content: "안녕하세요! ..................",
    sent_at: "2025-08-10T11:01:20.000Z",
    message_type: "text",
  },
];
