import { View, Platform } from "react-native";
import React from "react";
import Checkbox from "@react-native-community/checkbox";

type CommunityCheckboxProps = {
  selectedDataArray: any[];
  currentDataKey: any;
  handleSelectData: (userId: string) => void;
  isDark: boolean;
  disabled?: boolean; // 새로 추가
};

const CommunityCheckbox = ({
  selectedDataArray,
  currentDataKey,
  handleSelectData,
  isDark,
  disabled = false,
}: CommunityCheckboxProps) => {
  return (
    <View className="flex-row items-center gap-x-sm">
      <Checkbox
        value={selectedDataArray.includes(currentDataKey)} // 현재 선택 상태
        onValueChange={() => handleSelectData(currentDataKey)} // 토글 함수
        disabled={disabled}
        style={{
          transform: [{ scale: Platform.OS === "ios" ? 1.25 : 1.5 }],
        }}
        tintColor={isDark ? "#6b7280" : "#d1d5db"} // 비선택 상태 테두리 색상
        onCheckColor={isDark ? "#ffffff" : "#000000"} // 체크마크 색상
        onTintColor={isDark ? "#3b82f6" : "#2563eb"} // 선택 상태 배경 색상
      />
    </View>
  );
};

export default CommunityCheckbox;
