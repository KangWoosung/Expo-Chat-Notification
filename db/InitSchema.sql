-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- users table
create table public.users (
  user_id text primary key default auth.jwt()->>'sub',
  name text not null,
  email text not null,
  avatar text,
  push_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_users_email on public.users(email);

alter table public.users enable row level security;

-- ✅ 누구나 읽기 가능 (auth 여부 무관)
create policy "Anyone can read users (even anon)"
  on public.users
  for select
  using (true);

-- ✅ 본인만 수정/삭제 가능
create policy "Users can modify their own data"
  on public.users
  for all
  using ((auth.jwt()->>'sub') = (user_id)::text)
  with check ((auth.jwt()->>'sub') = (user_id)::text);



-- chat_rooms table
create table public.chat_rooms (
  room_id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by text references public.users(user_id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.chat_rooms enable row level security;

create policy "Only creator can manage room"
  on public.chat_rooms
  for all
  using ((auth.jwt()->>'sub') = (created_by)::text)
  with check ((auth.jwt()->>'sub') = (created_by)::text);



-- chat_room_members table
create table public.chat_room_members (
  room_id uuid references public.chat_rooms(room_id) on delete cascade,
  user_id text references public.users(user_id) on delete cascade,
  invited_by text references public.users(user_id),
  joined_at timestamptz default now(),
  role text default 'member', -- owner, admin, member
  primary key (room_id, user_id)
);

create index idx_members_user_id on public.chat_room_members(user_id);

alter table public.chat_room_members enable row level security;

-- General Policy
create policy "Members can manage their membership"
  on public.chat_room_members
  for all
  using ((auth.jwt()->>'sub') = (user_id)::text)
  with check ((auth.jwt()->>'sub') = (user_id)::text);

-- 2025-08-12 02:20:00

DROP policy IF EXISTS "Members can see each other" ON public.chat_room_members;

DROP policy IF EXISTS "chat_room_comembers can see each other" ON public.chat_room_members;

CREATE POLICY "chat_room_comembers can see each other" 
	ON public.chat_room_members
	AS PERMISSIVE 
	FOR SELECT
	TO authenticated
	USING (true)
	;


-- enum type definition
create type public.message_enum_type as enum ('text', 'file', 'image', 'video');

-- messages table
create table public.messages (
  message_id uuid primary key default gen_random_uuid(),
  room_id uuid references public.chat_rooms(room_id) on delete cascade,
  sender_id text references public.users(user_id) on delete cascade,
  content text not null,
  sent_at timestamptz default now(),
  message_type public.message_enum_type not null default 'text'
);

create index idx_messages_room_id on public.messages(room_id);

alter table public.messages enable row level security;

create policy "Members can read messages"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.chat_room_members
      where chat_room_members.room_id = messages.room_id
      and chat_room_members.user_id = auth.jwt()->>'sub'
    )
  );

create policy "Sender can insert message"
  on public.messages
  for insert
  with check ((auth.jwt()->>'sub') = (sender_id)::text);



-- message_reads table
create table public.message_reads (
  message_id uuid references public.messages(message_id) on delete cascade,
  user_id text references public.users(user_id),
  read_at timestamptz,
  primary key (message_id, user_id)
);

alter table public.message_reads enable row level security;

create policy "User can track their own reads"
  on public.message_reads
  for all
  using ((auth.jwt()->>'sub') = (user_id)::text)
  with check ((auth.jwt()->>'sub') = (user_id)::text);



-- users_in_room table
create table public.users_in_room (
  uuid uuid primary key default gen_random_uuid(),
  room_id uuid references public.chat_rooms(room_id) on delete cascade,
  user_id text references public.users(user_id),
  entered_at timestamptz default now()
);

create index idx_users_in_room_user_id on public.users_in_room(user_id);

alter table public.users_in_room enable row level security;

create policy "User can manage their presence"
  on public.users_in_room
  for all
  using ((auth.jwt()->>'sub') = (user_id)::text)
  with check ((auth.jwt()->>'sub') = (user_id)::text);



-- notification_pending table
create table public.notification_pending (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(user_id),
  expo_payload jsonb not null,
  created_at timestamptz default now()
);

alter table public.notification_pending enable row level security;

create policy "User can access their notifications"
  on public.notification_pending
  for all
  using ((auth.jwt()->>'sub') = (user_id)::text)
  with check ((auth.jwt()->>'sub') = (user_id)::text);

-- 시스템 레벨 접근 (서비스 계정용)
CREATE POLICY "System can manage all notifications" 
	ON notification_pending
  FOR ALL 
  USING (
     (auth.jwt()->>'sub') = 'service'
  );


-- 2025-08-10 22:30:00
-- 방 생성자(초대자)가 다른 사용자를 초대할 수 있도록 하는 정책 추가
create policy "Room creator can invite members"
  on public.chat_room_members
  for insert
  with check (
    (auth.jwt()->>'sub') = (invited_by)::text
    and exists (
      select 1 from public.chat_rooms
      where chat_rooms.room_id = chat_room_members.room_id
      and chat_rooms.created_by = (auth.jwt()->>'sub')::text
    )
  );

-- 2025-08-11 22:26:09
-- 1) 컬럼 추가 (한 번만)
ALTER TABLE public.chat_rooms
  ADD COLUMN type text DEFAULT 'group',
  ADD COLUMN participants_hash text;

-- 2) unique index (direct 타입에만)
CREATE UNIQUE INDEX idx_chat_rooms_participants_hash_direct
  ON public.chat_rooms(participants_hash)
  WHERE type = 'direct';

-- 3) 함수: find_or_create_direct_room(a_user_id text, b_user_id text) RETURNS uuid
CREATE OR REPLACE FUNCTION public.find_or_create_direct_room(a text, b text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- 주의: 누가 소유하느냐에 따라 권한이 달라짐
AS $$
DECLARE
  phash text;
  rid uuid;
BEGIN
  -- canonical participants hash (sorted)
  phash := md5(LEAST(a,b) || '|' || GREATEST(a,b));

  -- try to insert a new direct room; unique index prevents duplicates
  INSERT INTO public.chat_rooms (name, created_by, type, participants_hash)
  VALUES ('Direct Chat', a, 'direct', phash)
  ON CONFLICT (participants_hash) WHERE (type = 'direct')
  DO NOTHING
  RETURNING room_id INTO rid;

  -- if not inserted (conflict), fetch existing
  IF rid IS NULL THEN
    SELECT room_id INTO rid
    FROM public.chat_rooms
    WHERE participants_hash = phash AND type = 'direct'
    LIMIT 1;
  END IF;

  -- ensure members exist (insert on conflict do nothing)
  INSERT INTO public.chat_room_members (room_id, user_id, invited_by, role)
  VALUES (rid, a, a, 'owner')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  INSERT INTO public.chat_room_members (room_id, user_id, invited_by, role)
  VALUES (rid, b, a, 'member')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  RETURN rid;
END;
$$;


-- 2025-08-14 02:09:22
--
-- 유저별 스토리지 사용량 관리
create table user_storage_usage (
    user_id text primary key references users(user_id) on delete cascade,
    total_file_size bigint default 0, -- 총 업로드한 파일 용량 (bytes)
    total_file_count int default 0,   -- 업로드한 파일 개수
    message_upload_count int default 0, -- 메시지 업로드 횟수
    last_reset_at timestamptz default now() -- 사용량 리셋 시점
);

-- 업로드된 파일 메타데이터
create table uploaded_files (
    file_id uuid primary key default gen_random_uuid(),
    user_id text references users(user_id) on delete cascade,
    file_name text not null,
    file_size bigint not null,
    mime_type text,
    storage_path text not null,  -- Supabase Storage 버킷 경로
    public_url text,             -- 접근 가능한 URL
    created_at timestamptz default now()
);

-- 메시지와 파일 연결 (1:N 가능)
create table message_files (
    message_id uuid references messages(message_id) on delete cascade,
    file_id uuid references uploaded_files(file_id) on delete cascade,
    primary key (message_id, file_id)
);

--
-- increment 트리거 함수 생성
CREATE OR REPLACE FUNCTION increment_user_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_storage_usage (user_id, total_file_size, total_file_count)
  VALUES (NEW.user_id, NEW.file_size, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_file_size = user_storage_usage.total_file_size + EXCLUDED.total_file_size,
    total_file_count = user_storage_usage.total_file_count + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- decrement 트리거 함수 생성
CREATE OR REPLACE FUNCTION decrement_user_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- 업로드한 사용자의 total_file_size 감소
  UPDATE user_storage_usage
  SET total_file_size = total_file_size - OLD.file_size,
		  total_file_count = total_file_count - 1
  WHERE user_id = OLD.user_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 업로드 시
CREATE TRIGGER trg_increment_user_storage_usage
AFTER INSERT ON uploaded_files
FOR EACH ROW
EXECUTE FUNCTION increment_user_storage_usage();

-- TRIGGER 삭제 시
CREATE TRIGGER trg_decrement_user_storage_usage
AFTER DELETE ON uploaded_files
FOR EACH ROW
EXECUTE FUNCTION decrement_user_storage_usage();

-- Fix RLS policies for uploaded_files and message_files tables

-- 1. Enable RLS for uploaded_files table
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS for message_files table  
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;

-- 3. Policy for uploaded_files - 업로더가 자신의 파일을 관리할 수 있음
CREATE POLICY "Users can manage their uploaded files"
  ON public.uploaded_files
  FOR ALL
  USING ((auth.jwt()->>'sub') = (user_id)::text)
  WITH CHECK ((auth.jwt()->>'sub') = (user_id)::text);

-- 4. Policy for uploaded_files - 채팅방 멤버들이 서로의 파일을 볼 수 있음
CREATE POLICY "Chat room members can view shared files"
  ON public.uploaded_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.message_files mf
      JOIN public.messages m ON mf.message_id = m.message_id
      JOIN public.chat_room_members crm ON m.room_id = crm.room_id
      WHERE mf.file_id = uploaded_files.file_id
        AND crm.user_id = auth.jwt()->>'sub'
    )
  );

-- 5. Policy for message_files - 메시지 관련 파일 연결 관리
CREATE POLICY "Users can manage message file connections"
  ON public.message_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM public.messages m
      WHERE m.message_id = message_files.message_id
        AND m.sender_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.messages m
      WHERE m.message_id = message_files.message_id
        AND m.sender_id = auth.jwt()->>'sub'
    )
  );

-- 6. Policy for message_files - 채팅방 멤버들이 메시지-파일 연결을 볼 수 있음
CREATE POLICY "Chat room members can view message file connections"
  ON public.message_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.messages m
      JOIN public.chat_room_members crm ON m.room_id = crm.room_id
      WHERE m.message_id = message_files.message_id
        AND crm.user_id = auth.jwt()->>'sub'
    )
  );

-- 7. Policy for uploaded_files - 업로더 본인만 파일 삭제 가능
CREATE POLICY "Only file owner can delete uploaded files"
  ON public.uploaded_files
  FOR DELETE
  USING ((auth.jwt()->>'sub') = (user_id)::text);

-- 8. Policy for message_files - 메시지 작성자만 메시지-파일 연결 삭제 가능
CREATE POLICY "Only message sender can delete message file connections"
  ON public.message_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.messages m
      WHERE m.message_id = message_files.message_id
        AND m.sender_id = auth.jwt()->>'sub'
    )
  );
