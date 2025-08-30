/*
https://github.com/indiespirit/react-native-chart-kit

data example:
const data = [
  {
    name: "Seoul",
    population: 21500000,
    color: "rgba(131, 167, 234, 1)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Toronto",
    population: 2800000,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  }
];

Usage example:
  <ChartKitPieChart
    data={chartData}
    accessor={"population"}
    pieChartWidth={200}
    pieChartHeight={200}
    chartConfig={defaultChartConfig}
  />

*/

import { View, Text } from "react-native";
import React from "react";
import { PieChart } from "react-native-chart-kit";

type ChartKitPieChartProps = {
  data: any;
  accessor: string;
  pieChartWidth: number;
  pieChartHeight: number;
  chartConfig: any;
  glosary: string;
  hasLegend: boolean;
  center: [number, number];
};

export const defaultChartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: "transparent",
  backgroundGradientTo: "transparent",
  decimalPlaces: 2, // optional, defaults to 2dp
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#ffa726",
  },
};

const ChartKitPieChart = ({
  data,
  accessor,
  pieChartWidth,
  pieChartHeight,
  chartConfig = defaultChartConfig,
  glosary,
  hasLegend = false,
  center = [0, 0],
}: ChartKitPieChartProps) => {
  return (
    <View
      className={`flex items-center justify-center gap-[0px] 
        w-[${pieChartWidth}px]`}
    >
      <PieChart
        data={data}
        width={pieChartWidth}
        height={pieChartHeight}
        chartConfig={chartConfig}
        accessor={accessor}
        backgroundColor={"transparent"}
        paddingLeft={"0"}
        center={center}
        absolute
        hasLegend={hasLegend}
        avoidFalseZero={false}
      />
      <Text className="text-foreground dark:text-foreground-dark">
        {glosary}
      </Text>
    </View>
  );
};

export default ChartKitPieChart;
