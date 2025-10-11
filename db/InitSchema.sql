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

create policy "Chat room members can read chat rooms"
  on public.chat_rooms
  for select
  using (
    exists (
      select 1 from public.chat_room_members where chat_room_members.room_id = chat_rooms.room_id and chat_room_members.user_id = auth.jwt()->>'sub'
    )
  );


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
  entered_at timestamptz default now(),
  last_seen timestamptz default now()
);

create index idx_users_in_room_user_id on public.users_in_room(user_id);

alter table users_in_room
  add constraint users_in_room_unique unique (user_id, room_id);

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


-- 메시지 테이블에 file_id 직접 저장하는 개선된 스키마

-- 1. messages 테이블에 file_id 컬럼 추가
ALTER TABLE public.messages 
ADD COLUMN file_id uuid REFERENCES public.uploaded_files(file_id) ON DELETE SET NULL;

-- 2. file_id 인덱스 추가 (성능 최적화)
CREATE INDEX idx_messages_file_id ON public.messages(file_id);

-- 3. 복합 인덱스 추가 (room_id + sent_at + file_id)
CREATE INDEX idx_messages_room_sent_file ON public.messages(room_id, sent_at, file_id);

-- 4. 기존 message_files 테이블은 점진적으로 마이그레이션 후 제거 가능
-- (하위 호환성을 위해 당분간 유지 가능)

-- 5. 개선된 쿼리 예시:
-- 파일 정보가 필요한 경우:
/*
SELECT 
  m.*,
  uf.file_name,
  uf.file_size,
  uf.mime_type,
  uf.public_url
FROM messages m
LEFT JOIN uploaded_files uf ON m.file_id = uf.file_id
WHERE m.room_id = ?
ORDER BY m.sent_at ASC;
*/

-- 파일 정보가 불필요한 경우 (텍스트 메시지만):
/*
SELECT *
FROM messages
WHERE room_id = ? AND file_id IS NULL
ORDER BY sent_at ASC;
*/

-- 파일 메시지만:
/*
SELECT 
  m.*,
  uf.*
FROM messages m
INNER JOIN uploaded_files uf ON m.file_id = uf.file_id
WHERE m.room_id = ?
ORDER BY m.sent_at ASC;
*/
-- 2025-08-31 04:08:16
-- RPC Function - Updated to handle both direct and group chat rooms
create or replace function public.get_user_chat_rooms(p_user_id text)
returns table (
  room_id uuid,
  room_name text,
  other_user_id text,
  other_user_name text,
  other_user_avatar text,
  last_message_content text,
  last_message_type text,
  last_message_sent_at timestamptz
)
language sql
as $$
  with member_rooms as (
    select crm.room_id
    from public.chat_room_members crm
    where crm.user_id = p_user_id
  ),
  last_messages as (
    select distinct on (m.room_id)
      m.room_id,
      m.content,
      m.message_type,
      m.sent_at
    from public.messages m
    join member_rooms mr on mr.room_id = m.room_id
    order by m.room_id, m.sent_at desc
  ),
  -- Direct chat rooms: get the other user
  direct_other_users as (
    select
      crm.room_id,
      u.user_id,
      u.name,
      u.avatar
    from public.chat_room_members crm
    join public.users u on u.user_id = crm.user_id
    where crm.room_id in (select room_id from member_rooms)
      and crm.user_id <> p_user_id
      and crm.room_id in (
        select room_id 
        from public.chat_rooms 
        where type = 'direct'
      )
  ),
  -- Group chat rooms: get room info (no specific other user)
  group_rooms as (
    select
      cr.room_id,
      cr.name,
      null::text as user_id,
      null::text as user_name,
      null::text as avatar
    from public.chat_rooms cr
    where cr.room_id in (select room_id from member_rooms)
      and cr.type = 'group'
  )
  select
    cr.room_id,
    cr.name as room_name,
    coalesce(dou.user_id, gr.user_id) as other_user_id,
    coalesce(dou.name, gr.user_name) as other_user_name,
    coalesce(dou.avatar, gr.avatar) as other_user_avatar,
    lm.content as last_message_content,
    lm.message_type as last_message_type,
    lm.sent_at as last_message_sent_at
  from public.chat_rooms cr
  join member_rooms mr on cr.room_id = mr.room_id
  left join direct_other_users dou on dou.room_id = cr.room_id
  left join group_rooms gr on gr.room_id = cr.room_id
  left join last_messages lm on lm.room_id = cr.room_id
  order by lm.sent_at desc nulls last;
$$;


--2025-09-07 17:13:47
-- RPC Function
-- Create a function for transaction handling in the database
CREATE OR REPLACE FUNCTION public.create_group_chat_room(
  p_name text,
  p_created_by text,
  p_member_ids text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_room_id uuid;
  member_id text;
BEGIN
  -- Input validation
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Group chat name cannot be empty';
  END IF;
  
  IF array_length(p_member_ids, 1) IS NULL OR array_length(p_member_ids, 1) = 0 THEN
    RAISE EXCEPTION 'At least one member must be invited';
  END IF;

  -- Check if the selected users actually exist
  IF EXISTS (
    SELECT 1 FROM unnest(p_member_ids) AS selected_member_id
    WHERE selected_member_id NOT IN (SELECT user_id FROM public.users)
  ) THEN
    RAISE EXCEPTION 'One or more selected users do not exist';
  END IF;

  -- Create the chat room
  INSERT INTO public.chat_rooms (name, created_by, type)
  VALUES (trim(p_name), p_created_by, 'group')
  RETURNING room_id INTO new_room_id;
  
  -- Add the creator as owner
  INSERT INTO public.chat_room_members (room_id, user_id, invited_by, role)
  VALUES (new_room_id, p_created_by, p_created_by, 'owner');
  
  -- Add the selected members as members (remove duplicates)
  INSERT INTO public.chat_room_members (room_id, user_id, invited_by, role)
  SELECT DISTINCT 
    new_room_id, 
    selected_user_id, 
    p_created_by, 
    'member'
  FROM unnest(p_member_ids) AS selected_user_id
  WHERE selected_user_id != p_created_by
  ON CONFLICT (room_id, user_id) DO NOTHING;
  
  RETURN new_room_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create group chat room: %', SQLERRM;
END;
$$;


-- 2025-10-02 11:28:49
-- Trigger Function
create or replace function queue_notification_if_offline()
returns trigger
security definer  -- 여기 추가
set search_path = public  -- 보안상 search_path 고정 권장
as $$
declare
  participants text[];
  online_users text[];
  target_users text[];
  target_user text;
  sender_name text;
  sender_avatar text;
  message_preview text;
  payload jsonb;
  target_push_token text;
begin
  -- Member list in the room (excluding the sender)
  select array_agg(user_id) into participants
  from chat_room_members
  where room_id = NEW.room_id
    and user_id <> NEW.sender_id;

  -- Currently online users
  select array_agg(user_id) into online_users
  from users_in_room
  where room_id = NEW.room_id
    and last_seen > now() - interval '30 seconds';

  -- Only offline users are filtered
  target_users := array(
    select unnest(participants)
    except
    select unnest(coalesce(online_users, '{}'))
  );

  -- 4. Get sender name
  select name into sender_name
  from users
  where user_id = NEW.sender_id
  limit 1;

  -- 5. Get sender avatar
  select avatar into sender_avatar
  from users
  where user_id = NEW.sender_id
  limit 1;

  -- 6. Message preview (limited to 50 characters)
  message_preview := left(NEW.content, 50);

  -- 7. Insert notification for each offline user
  foreach target_user in array target_users
  loop
    -- (a) Get push token
    select push_token into target_push_token
    from users
    where user_id = target_user
    limit 1;

    -- (b) skip if push_token is null
    -- if push_token is null then
    --   continue;
    -- end if;

    -- (c) expo notification payload configuration
    payload := jsonb_build_object(
      'to', target_push_token,                  -- Expo push token required
      'sound', 'default',
      'title', 'New Message from ' || sender_name,
      'body', message_preview,
      'data', jsonb_build_object(
        'room_id', NEW.room_id,
        'message_id', NEW.message_id,
        'sender_id', NEW.sender_id,
        'sender_avatar', sender_avatar,
        'target_user_id', target_user,
        'sender_name', sender_name,
        'messagePreview', message_preview,
        'deepLink', format('notification_try07://chat_room/id/%s', NEW.room_id)
      )
    );

    insert into notification_pending (user_id, expo_payload)
    values (target_user, payload);
  end loop;

  return new;
end;
$$ language plpgsql;

-- Create trigger
drop trigger if exists queue_notification_if_offline_trigger on messages;

create trigger queue_notification_if_offline_trigger
after insert on messages
for each row 
execute procedure queue_notification_if_offline();



-- 2025-10-03 06:45:26
-- last_read_messages table

-- Record the user's read position for each room
CREATE TABLE last_read_messages (
  room_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  last_read_message_id UUID,
  last_read_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (room_id, user_id)
);
  
ALTER TABLE last_read_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE last_read_messages Change user_id TEXT NOT NULL;

CREATE POLICY "Can insert own last_read_messages"
  ON last_read_messages
  FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Can update own last_read_messages"
  ON last_read_messages
  FOR UPDATE
  USING (auth.jwt()->>'sub' = user_id)
  WITH CHECK (true);

CREATE POLICY "Room members can read each others' last_read_messages"
  ON last_read_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM chat_room_members crm
      WHERE crm.room_id = last_read_messages.room_id
        AND crm.user_id = auth.jwt()->>'sub'
    )
  );
  

-- drop unnecessary message_read table
DROP TABLE IF EXISTS message_reads;


-- 2025-10-03 06:52:29
-- RPC Function get_unread_count
-- Get unread user count per message for each message
create or replace function get_unread_count(message_uuid uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_sent_at timestamptz;
  v_unread_count integer;
begin
  -- get room_id, sent_at of the message
  select room_id, sent_at
  into v_room_id, v_sent_at
  from messages
  where message_id = message_uuid;

  if v_room_id is null then
    return 0; -- if message is not found, return 0
  end if;

  -- calculate unread user count
  select count(*)
  into v_unread_count
  from chat_room_members crm
  left join last_read_messages lrm
    on lrm.room_id = crm.room_id
   and lrm.user_id::text = crm.user_id
  where crm.room_id = v_room_id
    and (
      lrm.last_read_at is null
      or lrm.last_read_at < v_sent_at
    );

  return v_unread_count;
end;
$$;

-- 2025-10-06 00:13:56
-- RPC Function : get_user_unread_counts(user_id)
-- Return unread message count per chat room for a given user
create or replace function get_user_unread_counts(p_user_id text)
returns table (
  room_id uuid,
  unread_count integer
)
language sql
security definer
set search_path = public
as $$
  select
    crm.room_id,
    count(distinct m.message_id) as unread_count
  from chat_room_members crm
  left join last_read_messages lrm
    on lrm.room_id = crm.room_id
   and lrm.user_id::text = crm.user_id
  left join messages m
    on m.room_id = crm.room_id
   and (
        lrm.last_read_at is null
        or m.sent_at > lrm.last_read_at
      )
  where crm.user_id = p_user_id
  group by crm.room_id
  order by crm.room_id;
$$;


-- 2025-10-10 06:04:48
-- Schemas for Realtime...
-- Realtime publication Schemas --
-- chat_rooms table
alter publication supabase_realtime add table chat_rooms;
create policy "enable realtime for chat_rooms"
on chat_rooms
for select
using (auth.jwt()->>'sub' is not null);

-- chat_room_members table
alter publication supabase_realtime add table chat_room_members;
create policy "enable realtime for chat_room_members"
on chat_room_members
for select
using (auth.jwt()->>'sub' is not null);

-- last_read_messages table
alter publication supabase_realtime add table last_read_messages;
create policy "enable realtime for last_read_messages"
on last_read_messages
for select
using (auth.jwt()->>'sub' is not null);

-- messages table
alter publication supabase_realtime add table messages;
create policy "enable realtime for messages"
on messages
for select
using (auth.jwt()->>'sub' is not null);

-- user_storage_usage table
alter publication supabase_realtime add table user_storage_usage;
create policy "enable realtime for user_storage_usage"
on user_storage_usage
for select
using (auth.jwt()->>'sub' is not null);

-- users_in_room table
alter publication supabase_realtime add table users_in_room;
create policy "enable realtime for users_in_room"
on users_in_room 
for select
using (auth.jwt()->>'sub' is not null);


-- 2025-10-12 06:33:54
-- RPC Function : get_room_messages_unread_counts
-- Get unread message count per message for a given room and limit and offset
CREATE OR REPLACE FUNCTION get_room_messages_unread_counts(
  p_room_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(message_id uuid, unread_count bigint)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.message_id,
    COUNT(crm.user_id) FILTER (
      WHERE crm.user_id IS DISTINCT FROM m.sender_id::text
        AND (lrm.last_read_at IS NULL OR lrm.last_read_at < m.sent_at)
    ) AS unread_count
  FROM chat_room_members crm
  JOIN (
    SELECT message_id, room_id, sent_at, sender_id
    FROM messages
    WHERE room_id = p_room_id
    ORDER BY sent_at DESC
    LIMIT p_limit OFFSET p_offset
  ) AS m
  ON m.room_id = crm.room_id
  LEFT JOIN last_read_messages lrm
    ON lrm.room_id = crm.room_id
   AND lrm.user_id = crm.user_id
  WHERE crm.room_id = p_room_id
  GROUP BY m.message_id;
$$;


