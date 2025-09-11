import { useBottomSheetStore } from "@/zustand/useBottomSheetStore";
import { globalSheetRef } from "@/app/_layout";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useCallback } from "react";
import { useColorScheme } from "nativewind";

export function GlobalBottomSheet() {
  const { bottomSheetContent } = useBottomSheetStore(); // store의 content를 구독
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleStyle = {
    backgroundColor: isDark ? "#333" : "#eee",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 }, // 위쪽으로 그림자
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 6, // Android
  };

  const handleIndicatorStyle = {
    backgroundColor: isDark ? "#888" : "#aaa",
    width: 40,
    height: 5,
    borderRadius: 3,
  };

  // backdrop renders
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1} // -1 means the backdrop does not disappear
        appearsOnIndex={0} // index 0 means the backdrop appears from index 0
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={globalSheetRef}
      snapPoints={["50%"]}
      backdropComponent={renderBackdrop}
      handleStyle={handleStyle}
      handleIndicatorStyle={handleIndicatorStyle}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      keyboardBehavior="interactive" // Dynamic Sizing with Keyboard is enabled
      keyboardBlurBehavior="restore" // When the keyboard is closed, the sheet returns to its original position
    >
      {bottomSheetContent}
    </BottomSheetModal>
  );
}
