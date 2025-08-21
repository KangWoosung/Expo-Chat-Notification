import { View, Text } from "react-native";
import React from "react";
import { PieChart } from "react-native-chart-kit";

type ChartKitPieChartProps = {
  data: any;
  pieChartWidth: number;
  pieChartHeight: number;
  chartConfig: any;
};

const defaultChartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

const ChartKitPieChart = ({
  data,
  pieChartWidth,
  pieChartHeight,
  chartConfig = defaultChartConfig,
}: ChartKitPieChartProps) => {
  return (
    <View>
      <PieChart
        data={data}
        width={pieChartWidth}
        height={pieChartHeight}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        center={[10, 50]}
        absolute
      />
    </View>
  );
};

export default ChartKitPieChart;
