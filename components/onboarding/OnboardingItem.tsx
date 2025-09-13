import React from "react";
import { View, Dimensions } from "react-native";
import { OnboardingItemType } from "@/app/onboarding/data";
import OnboardingDefaultItem from "./OnboardingDefaultItem";
import OnboardingFirsrPage from "./OnboardingFirsrPage";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

type OnboardingItemProps = {
  item: OnboardingItemType;
  index: number;
};

function OnboardingItem({ item, index }: OnboardingItemProps) {
  return (
    <View
      className="flex-1 items-center justify-center border-0 border-blue-500"
      style={[{ width: WIDTH, height: HEIGHT }]}
    >
      {index === 0 ? (
        <OnboardingFirsrPage />
      ) : (
        <OnboardingDefaultItem item={item} index={index} />
      )}
    </View>
  );
}

export default OnboardingItem;
