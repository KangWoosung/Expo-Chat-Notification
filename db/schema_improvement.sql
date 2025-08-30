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
