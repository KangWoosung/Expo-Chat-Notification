/*
GetUserChatRoomsRowType 의 타입으로 데이터를 모두 바꿔주자.


*/
import { Database } from "@/db/supabase/supabase";

type GetUserChatRoomsRowType =
  Database["public"]["Functions"]["get_user_chat_rooms"]["Returns"][0];

// GetUserChatRoomsRowType에 맞는 더미 메시지 데이터 생성 예시
export const dummyUserChatRooms: GetUserChatRoomsRowType[] = [
  {
    room_id: "room-001",
    room_name: "철수 & 영희",
    other_user_id: "user-002",
    other_user_name: "이영희",
    other_user_avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    last_message_content: "안녕하세요, 영희님!",
    last_message_type: "text",
    last_message_sent_at: "2025-08-10T10:01:00.000Z",
  },
  {
    room_id: "room-002",
    room_name: "철수 & 민수",
    other_user_id: "user-003",
    other_user_name: "박민수",
    other_user_avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    last_message_content: "민수님, 오늘 회의 가능하신가요?",
    last_message_type: "text",
    last_message_sent_at: "2025-08-10T10:01:20.000Z",
  },
  {
    room_id: "room-003",
    room_name: "철수 & 지은",
    other_user_id: "user-004",
    other_user_name: "최지은",
    other_user_avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    last_message_content: "지은님, 자료 전달드렸어요.",
    last_message_type: "text",
    last_message_sent_at: "2025-08-10T10:02:00.000Z",
  },
  {
    room_id: "room-004",
    room_name: "영희 & 민수",
    other_user_id: "user-003",
    other_user_name: "박민수",
    other_user_avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    last_message_content: "영희님, 내일 일정 확인 부탁드려요.",
    last_message_type: "text",
    last_message_sent_at: "2025-08-10T10:03:00.000Z",
  },
  {
    room_id: "room-005",
    room_name: "영희 & 지은",
    other_user_id: "user-004",
    other_user_name: "최지은",
    other_user_avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    last_message_content: "회의록 공유드립니다.",
    last_message_type: "text",
    last_message_sent_at: "2025-08-10T10:04:00.000Z",
  },
];
