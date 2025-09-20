/*
2025-09-18 14:56:30
Originated from:
https://www.youtube.com/watch?v=9mMDbRX2shw&ab_channel=CodeReact


Usage:
<CustomAnimatedPieChart
  data={[
    { value: 100, color: "red", label: "Red", textColor: "white" },
    { value: 200, color: "blue", label: "Blue", textColor: "white" },
    { value: 300, color: "green", label: "Green", textColor: "white" },
  ]}
  size={100}
  innerRadius={0}
  animationDuration={1000}
  animationType="spring"
  animationDelay={0}
  showPercentage={true}
  labelStyle={{
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Arial",
  }}
  chartType="pie"
  onAnimated={() => {
    console.log("animated");
  }}
/>


*/

import { View, Text, ViewStyle } from "react-native";
import React, { useMemo, useEffect } from "react";
import Svg, { G, Path, Text as SVGText } from "react-native-svg";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { arcPath, polarToCartesian } from "../../utils/arcPathWorklet";

type PieData = {
  value: number;
  color: string;
  label?: string;
  textColor?: string;
};

type PieChartType = "pie" | "donut" | "half-pie";
type AnimationType =
  | "timing"
  | "spring"
  | "bounce"
  | "ease-in-out"
  | "sequential";

type CustomAnimatedPieChartProps = {
  data: PieData[];
  size?: number;
  innerRadius?: number;
  animationDuration?: number;
  style?: ViewStyle;
  onAnimated?: () => void;
  chartType?: PieChartType;
  showPercentage?: boolean;
  labelStyle?: {
    color?: string;
    fontSize?: number;
    fontWeight?:
      | "normal"
      | "bold"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900";
    fontFamily?: string;
  };
  animationType?: AnimationType;
  animationDelay?: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSVGText = Animated.createAnimatedComponent(SVGText);
const TAU = Math.PI * 2;

type SliceComponentProps = {
  slice: { start: number; end: number; data: PieData };
  index: number;
  cx: number;
  cy: number;
  outerRadius: number;
  innerRadius: number;
  chartType: PieChartType;
  progress: SharedValue<number>;
  showPercentage: boolean;
  total: number;
  labelStyle: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
  };
  size: number;
};

const SliceComponent = ({
  slice,
  index,
  cx,
  cy,
  outerRadius,
  innerRadius,
  chartType,
  progress,
  showPercentage,
  total,
  labelStyle,
  size,
}: SliceComponentProps) => {
  const animatedProps = useAnimatedProps(() => {
    const currentEnd = slice.start + (slice.end - slice.start) * progress.value;
    return {
      d: arcPath(
        cx,
        cy,
        outerRadius,
        slice.start,
        currentEnd,
        chartType === "donut" ? innerRadius : 0
      ),
    } as any;
  });

  return (
    <AnimatedPath
      key={`slice-${index}`}
      animatedProps={animatedProps}
      d={`M ${size / 2} ${size / 2} L ${size / 2} ${size / 2}`}
      fill={slice.data.color}
    />
  );
};

type PercentageTextProps = {
  slice: { start: number; end: number; data: PieData };
  index: number;
  cx: number;
  cy: number;
  outerRadius: number;
  innerRadius: number;
  chartType: PieChartType;
  progress: SharedValue<number>;
  total: number;
  labelStyle: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
  };
};

const PercentageText = ({
  slice,
  index,
  cx,
  cy,
  outerRadius,
  innerRadius,
  chartType,
  progress,
  total,
  labelStyle,
}: PercentageTextProps) => {
  const midAngle = (slice.start + slice.end) / 2;
  const radius =
    chartType === "donut" ? (outerRadius + innerRadius) / 2 : outerRadius * 0.6;
  const { x, y } = polarToCartesian(cx, cy, radius, midAngle);
  const percentage =
    total > 0 ? `${((slice.data.value / total) * 100).toFixed(0)}%` : "0%";
  const baseFontSize = labelStyle.fontSize ?? 12;

  const animatedTextProps = useAnimatedProps(() => {
    const scale = interpolate(progress.value, [0, 1], [0.5, 1]);
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
      fontSize: baseFontSize * scale,
      x,
      y,
      fill: slice.data.textColor || labelStyle.color,
      fontWeight: labelStyle.fontWeight,
      fontFamily: labelStyle.fontFamily,
    };
  });

  return (
    <AnimatedSVGText
      key={`percentage-${index}`}
      textAnchor="middle"
      alignmentBaseline="middle"
      animatedProps={animatedTextProps}
    >
      {percentage}
    </AnimatedSVGText>
  );
};

const CustomAnimatedPieChart = ({
  data,
  size = 100,
  innerRadius = 0,
  animationDuration = 1000,
  style,
  onAnimated,
  chartType = "pie",
  showPercentage = true,
  labelStyle = {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Arial",
  },
  animationType = "timing" as AnimationType,
  animationDelay = 0,
}: CustomAnimatedPieChartProps) => {
  const progress = useSharedValue(0);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2;

  const total = useMemo(() => {
    return data.reduce((acc, item) => acc + Math.max(item.value, 0), 0);
  }, [data]);

  const slices = useMemo(() => {
    const result: {
      start: number;
      end: number;
      data: PieData;
    }[] = [];
    let startAngle = chartType === "half-pie" ? -Math.PI : -Math.PI / 2;
    const circle = chartType === "half-pie" ? Math.PI : TAU;

    for (const item of data) {
      const angle = total > 0 ? (item.value / total) * circle : 0;
      const endAngle = startAngle + angle;
      result.push({
        start: startAngle,
        end: endAngle,
        data: item,
      });
      startAngle = endAngle;
    }
    return result;
  }, [data, total, chartType]);

  useEffect(() => {
    let anim;

    const onFinish = (finished?: boolean) => {
      if (finished && onAnimated) {
        runOnJS(onAnimated)();
      }
    };

    switch (animationType) {
      case "spring":
        anim = withSpring(
          1,
          { stiffness: 100, damping: 15, duration: animationDuration as any },
          onFinish
        );
        break;
      case "timing":
        anim = withTiming(1, { duration: animationDuration }, onFinish);
        break;
      case "bounce":
        anim = withSequence(
          withTiming(1.1, {
            duration: (animationDuration / 2) as any,
            easing: Easing.out(Easing.exp),
          }),
          withTiming(1, {
            duration: (animationDuration / 2) as any,
            easing: Easing.out(Easing.exp),
          }),
          onFinish as any
        );
        break;
      case "sequential":
        anim = withTiming(
          1,
          {
            duration: animationDuration as any,
            easing: Easing.linear,
          },
          onFinish as any
        );
        break;

      default:
        anim = withTiming(
          1,
          { duration: animationDuration as any },
          onFinish as any
        );
        break;
    }

    progress.value = anim;
  }, [animationType, animationDuration, onAnimated, progress]);

  return (
    <View style={style}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, index) => (
            <SliceComponent
              key={`slice-${index}`}
              slice={slice}
              index={index}
              cx={cx}
              cy={cy}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              chartType={chartType}
              progress={progress}
              showPercentage={showPercentage}
              total={total}
              labelStyle={labelStyle}
              size={size}
            />
          ))}
          {showPercentage &&
            slices.map((slice, index) => (
              <PercentageText
                key={`percentage-${index}`}
                slice={slice}
                index={index}
                cx={cx}
                cy={cy}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                chartType={chartType}
                progress={progress}
                total={total}
                labelStyle={labelStyle}
              />
            ))}
        </G>
      </Svg>
      <View className="flex-row items-center justify-center">
        {data.map((item, index) => (
          <View key={index} className="flex-row items-center justify-center">
            <Text
              style={{
                color: item.textColor,
                fontSize: labelStyle.fontSize,
                fontWeight: labelStyle.fontWeight,
                fontFamily: labelStyle.fontFamily,
              }}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CustomAnimatedPieChart;
