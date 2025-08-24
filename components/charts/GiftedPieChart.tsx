import { View, Text } from "react-native";
import React from "react";
import { PieChart } from "react-native-gifted-charts";
import { FILE_UPLOAD_LIMIT } from "@/constants/usageLimits";

type GiftedPieChartProps = {
  data: any;
  chartConfig: any;
};

const GiftedPieChart = ({ data, chartConfig }: GiftedPieChartProps) => {
  return (
    <View
      className="flex-1 w-full items-center justify-center p-xl "
      style={{ height: 100 }}
    >
      <PieChart donut radius={80} data={data} />
      <View className="flex-row items-center gap-x-sm">
        <Text className="text-lg text-foreground dark:text-foreground-dark">
          {Math.round((data[0].value / 1024 / 1024) * 100) / 100}MB /{" "}
          {FILE_UPLOAD_LIMIT / 1024 / 1024}MB
        </Text>
      </View>
    </View>
  );
};

export default GiftedPieChart;
