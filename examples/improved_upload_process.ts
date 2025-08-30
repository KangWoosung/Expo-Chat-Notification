// 개선된 파일 업로드 프로세스 예시

export async function improvedSendAttachment({
  roomId,
  file,
}: {
  roomId: string;
  file: File;
}) {
  // 1. 파일을 스토리지에 업로드
  const { data: uploadResult, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. uploaded_files 테이블에 파일 정보 저장
  const { data: fileData, error: fileError } = await supabase
    .from("uploaded_files")
    .insert({
      user_id: userId,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: filePath,
      public_url: publicUrl,
    })
    .select()
    .single();

  if (fileError) throw fileError;

  // 3. 메시지 테이블에 file_id와 함께 직접 저장 (한 번의 INSERT)
  const { data: messageData, error: messageError } = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      sender_id: userId,
      content: publicUrl, // 이미지 URL (호환성 유지)
      message_type: messageType,
      file_id: fileData.file_id, // ✅ 직접 저장!
    })
    .select()
    .single();

  if (messageError) throw messageError;

  // ❌ 기존: message_files 테이블에 별도 INSERT 불필요!
  // const { error: linkError } = await supabase
  //   .from("message_files")
  //   .insert({
  //     message_id: messageData.message_id,
  //     file_id: fileData.file_id,
  //   });

  return messageData;
}

