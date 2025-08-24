import { View, Text, ScrollView, Dimensions } from "react-native";
import React, { useState } from "react";
import { BarChart } from "react-native-gifted-charts";

// Make sure LinearGradient is imported from expo-linear-gradient
import { LinearGradient } from "expo-linear-gradient";
import { TWPalette } from "@/constants/TWPalette";

// Make basic pallet of colors
const colorThemes = {
  blue: { name: "blue", primary: 500, accent: 600 },
  purple: { name: "purple", primary: 500, accent: 600 },
  emerald: { name: "emerald", primary: 500, accent: 600 },
  orange: { name: "orange", primary: 500, accent: 600 },
  red: { name: "red", primary: 500, accent: 600 },
  pink: { name: "pink", primary: 500, accent: 600 },
  rose: { name: "rose", primary: 500, accent: 600 },
  sky: { name: "sky", primary: 500, accent: 600 },
} as const;

// Set chart config
const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
};

// Set data for chart
const data = [
  { value: 20, label: "Swim" },
  { value: 45, label: "Bike" },
  { value: 28, label: "Run" },
];

const GiftedBarChart = () => {
  const [colorTheme, setColorTheme] =
    useState<keyof typeof colorThemes>("blue");

  const theme = colorThemes[colorTheme];
  const themeColor = TWPalette[theme.name];

  // Set background gradient colors with current theme
  const bgColors = [
    TWPalette[colorThemes[colorTheme].name][100],
    "#ffffff",
    TWPalette[colorThemes[colorTheme].name][100],
  ] as const;

  const screenData = Dimensions.get("window");

  return (
    <LinearGradient
      className="flex-1 w-full h-full bg-red-200"
      colors={bgColors}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <BarChart
          data={data}
          noOfSections={4}
          barBorderRadius={10}
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisLabelTextStyle={{
            fontSize: 12,
            fontWeight: "bold",
            color: TWPalette[theme.name][500],
          }}
          width={screenData.width}
          height={220}
          showGradient={true}
          gradientColor={TWPalette[theme.name][500]}
          frontColor={TWPalette[theme.name][300]}
        />
      </ScrollView>
    </LinearGradient>
  );
};

export default GiftedBarChart;
