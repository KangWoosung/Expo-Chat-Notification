import { View, Text } from "react-native";
import React from "react";
import { PieChart } from "react-native-gifted-charts";
import { FILE_UPLOAD_LIMIT } from "@/constants/usageLimits";
import { useColorScheme } from "nativewind";
import tailwindColors from "@/utils/tailwindColors";

type GiftedPieChartProps = {
  data?: any | undefined;
};

const PieTooltipDefaults = {
  tooltipWidth: undefined, // takes the width of the tooltip text
  persistTooltip: false,
  tooltipDuration: 1000,
  tooltipVerticalShift: 30,
  tooltipHorizontalShift: 20,
  showValuesAsTooltipText: true,
  tooltipTextNoOfLines: 3,
  tooltipBackgroundColor: "rgba(20,20,20,0.8)",
  tooltipBorderRadius: 4,
};

const defaultChartData = [
  { value: 54, color: "#177AD5", text: "54%" },
  { value: 40, color: "#79D2DE", text: "30%" },
  { value: 20, color: "#ED6665", text: "26%" },
];

type PieChartDataType = {
  value: number;
  color: string;
  text: string;
};

const defaultPieChartConfig = {
  radius: 66,
  initialAngle: 0,
  isThreeD: false,
  showGradient: true,
  gradientCenterColor: "white",
  onPress: (item: any) => console.log("item", item),
  focusOnPress: true,
  extraRadius: 10,
  inwardExtraLengthForFocused: 20,
  sectionAutoFocus: true,
  focusedPieIndex: 0,
  onLabelPress: (item: any) => console.log("item", item),
  tiltAngle: "0deg",
  shadow: true,
  shadowColor: "black",
  shadowWidth: 4,
  strokeWidth: 8,
  strokeColor: "white",
  backgroundColor: "transparent",
  showText: false,
  textColor: "white",
  textSize: 16,
  fontStyle: "normal" as const,
  fontWeight: "normal",
  font: "Arial",
  showTextBackground: false,
  textBackgroundRadius: 10,
  showValuesAsLabels: false,
  showTooltip: true,
  showValuesAsTooltipText: true,
  centerLabelComponent: () => void 0,
  semiCircle: false,
  labelsPosition: "outward" as const,
  pieInnerComponent: () => void 0,
  pieInnerComponentHeight: 10,
  pieInnerComponentWidth: 10,
  paddingHorizontal: 0,
  paddingVertical: 0,
  showExternalLabels: false,
  labelLineConfig: {},
  externalLabelComponent: () => void 0,
  edgesPressable: true,
  donut: true,
};

type PieChartConfigType = {
  radius: number;
  initialAngle: number;
  isThreeD: boolean;
  showGradient: boolean;
  gradientCenterColor: string;
};

type GiftedPieChartPropsType = {
  data?: PieChartDataType[];
  config?: PieChartConfigType | any;
};

const GiftedPieChart = ({
  data = defaultChartData as PieChartDataType[],
  config = defaultPieChartConfig as PieChartConfigType,
}: GiftedPieChartPropsType) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const updatedConfig = {
    ...defaultPieChartConfig,
    ...config,
  };

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];
  const strokeColorTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "blank"];

  return (
    <View
      className="flex w-full items-center justify-center p-sm py-0
      w-full max-w-full max-h-full object-contain
      border-0 border-yellow-500"
      style={{ width: 160, height: 160 }}
    >
      <PieChart
        data={data}
        radius={updatedConfig.radius}
        initialAngle={updatedConfig.initialAngle}
        isThreeD={updatedConfig.isThreeD}
        showGradient={updatedConfig.showGradient}
        gradientCenterColor={updatedConfig.gradientCenterColor}
        onPress={(item: any) => console.log("item", item)}
        focusOnPress={true}
        toggleFocusOnPress={true}
        extraRadius={updatedConfig.extraRadius}
        inwardExtraLengthForFocused={updatedConfig.inwardExtraLengthForFocused}
        sectionAutoFocus={updatedConfig.sectionAutoFocus}
        focusedPieIndex={updatedConfig.focusedPieIndex}
        onLabelPress={(item: any) => console.log("item", item)}
        tiltAngle={updatedConfig.tiltAngle}
        shadow={updatedConfig.shadow}
        shadowColor={updatedConfig.shadowColor}
        shadowWidth={updatedConfig.shadowWidth}
        strokeWidth={updatedConfig.strokeWidth}
        strokeColor={strokeColorTheme}
        backgroundColor={updatedConfig.backgroundColor}
        showText={updatedConfig.showText}
        textColor={updatedConfig.textColor}
        textSize={updatedConfig.textSize}
        fontStyle={updatedConfig.fontStyle}
        fontWeight={updatedConfig.fontWeight}
        font={updatedConfig.font}
        showTextBackground={updatedConfig.showTextBackground}
        textBackgroundRadius={updatedConfig.textBackgroundRadius}
        showValuesAsLabels={updatedConfig.showValuesAsLabels}
        showTooltip={updatedConfig.showTooltip}
        showValuesAsTooltipText={updatedConfig.showValuesAsTooltipText}
        centerLabelComponent={updatedConfig.centerLabelComponent}
        semiCircle={updatedConfig.semiCircle}
        labelsPosition={updatedConfig.labelsPosition}
        pieInnerComponent={updatedConfig.pieInnerComponent}
        pieInnerComponentHeight={updatedConfig.pieInnerComponentHeight}
        pieInnerComponentWidth={updatedConfig.pieInnerComponentWidth}
        paddingHorizontal={updatedConfig.paddingHorizontal}
        paddingVertical={updatedConfig.paddingVertical}
        showExternalLabels={updatedConfig.showExternalLabels}
        labelLineConfig={{}}
        externalLabelComponent={() => void 0}
        edgesPressable={true}
        donut
      />
      {/* <View className="flex-row items-center gap-x-sm">
        <Text className="text-sm text-foreground dark:text-foreground-dark">
          {Math.round((data[0].value / 1024 / 1024) * 100) / 100}MB /{" "}
          {FILE_UPLOAD_LIMIT / 1024 / 1024}MB
        </Text>
      </View> */}
    </View>
  );
};

export default GiftedPieChart;
