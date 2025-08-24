/*
2025-08-21 05:56:30




*/

import { View, Text } from "react-native";
import React from "react";
import { Pie, PolarChart } from "victory-native";

export type ChartDataType = {
  label: string;
  value: number;
  color: string;
};

const VictoryNativePieChart = ({
  chartData,
}: {
  chartData: ChartDataType[];
}) => {
  return (
    <View className="flex items-center justify-center w-full h-[200px] p-lg gap-y-sm bg-red-500">
      <PolarChart
        data={chartData}
        labelKey={"label"}
        valueKey={"value"}
        colorKey={"color"}
      >
        <Pie.Chart innerRadius={100} startAngle={0} />
      </PolarChart>
      <View className="flex-row items-center gap-x-sm">
        <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
          {chartData[0].label}
        </Text>
        <Text className="text-lg font-bold text-foreground dark:text-foreground-dark">
          {chartData[0].value}
        </Text>
      </View>
    </View>
  );
};

export default VictoryNativePieChart;
