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
