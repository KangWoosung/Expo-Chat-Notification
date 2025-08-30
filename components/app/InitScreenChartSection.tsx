/*
2025-08-30 08:34:19

data format for chartkitpiechart
[
  {
    name: "Used",
    amount: 0,
    color: "rgb(255, 75, 75)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
]

data format for giftedpiechart
[
  {
    value: 10,
    color: "rgb(254, 249, 99)",
    text: "Used",
  },
  {
    value: 90,
    color: "rgb(194, 178, 2)",
    text: "Available",
  },
]



*/

import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import {
  FILE_UPLOAD_COUNT_LIMIT,
  FILE_UPLOAD_LIMIT,
} from "@/constants/usageLimits";
import ChartKitPieChart, {
  defaultChartConfig,
} from "@/components/charts/ChartKitPieChart";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import GiftedPieChart from "../charts/GiftedPieChart";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Ionicons } from "@expo/vector-icons";
import BadgeWithIcon from "../ui/BadgeWithIcon";
import { useColorScheme } from "nativewind";

const DEFAULT_GIFTED_STORAGE_USAGE_CHART_DATA = [
  {
    value: 10,
    color: "rgb(255, 35, 35)",
    text: "Used",
  },
  {
    value: 90,
    color: "rgb(148, 78, 21)",
    text: "Available",
  },
];

const DEFAULT_GIFTED_FILE_USAGE_CHART_DATA = [
  {
    value: 10,
    color: "rgb(255, 35, 35)",
    text: "Used",
  },
  {
    value: 90,
    color: "rgb(148, 78, 21)",
    text: "Available",
  },
];

const InitScreenChartSection = () => {
  const [storageUsageChartData, setStorageUsageChartData] = useState(
    DEFAULT_GIFTED_STORAGE_USAGE_CHART_DATA
  );
  const [fileUsageChartData, setFileUsageChartData] = useState(
    DEFAULT_GIFTED_FILE_USAGE_CHART_DATA
  );
  const [storageUsageGlosary, setStorageUsageGlosary] = useState("");
  const [fileUsageGlosary, setFileUsageGlosary] = useState("");
  const [fileUsage, setFileUsage] = useState(0);
  const { data: storageUsageData } = useStorageUsage();
  const [storageAmpleState, setStorageAmpleState] = useState("green");
  const [fileAmpleState, setFileAmpleState] = useState("green");
  const storageUsage = storageUsageData;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const updatedStorageUsageData = DEFAULT_GIFTED_STORAGE_USAGE_CHART_DATA.map(
      (item) => {
        if (item.text === "Used") {
          return {
            ...item,
            amount:
              Math.round(
                ((storageUsage?.storageUsage || 0) * 100) / 1024 / 1024
              ) / 100,
          };
        }
        if (item.text === "Available") {
          return {
            ...item,
            amount:
              Math.round(
                ((FILE_UPLOAD_LIMIT - (storageUsage?.storageUsage || 0)) *
                  100) /
                  1024 /
                  1024
              ) / 100,
          };
        }
        return item;
      }
    );
    console.log("updatedStorageUsageData", updatedStorageUsageData);
    setStorageUsageChartData(updatedStorageUsageData);

    const updatedFileUsageData = DEFAULT_GIFTED_FILE_USAGE_CHART_DATA.map(
      (item) => {
        if (item.text === "Used") {
          return {
            ...item,
            value: storageUsage?.fileCountUsage || 0,
          };
        }
        if (item.text === "Available") {
          return {
            ...item,
            value:
              FILE_UPLOAD_COUNT_LIMIT - (storageUsage?.fileCountUsage || 0),
          };
        }
        return item;
      }
    );
    console.log("updatedFileUsageData", updatedFileUsageData);
    const storageUsagePercentage = Math.round(
      ((storageUsage?.storageUsage || 0) * 100) / FILE_UPLOAD_LIMIT
    );
    console.log("storageUsagePercentage", storageUsagePercentage);
    if (storageUsagePercentage > 80) {
      setStorageAmpleState("red");
    } else if (storageUsagePercentage > 60) {
      setStorageAmpleState("yellow");
    } else {
      setStorageAmpleState("green");
    }
    console.log("storageAmpleState", storageAmpleState);
    setFileUsageChartData(updatedFileUsageData);

    setStorageUsageGlosary(
      `${
        Math.round(((storageUsage?.storageUsage || 0) / 1024 / 1024) * 100) /
        100
      }MB / ${Math.round((FILE_UPLOAD_LIMIT / 1024 / 1024) * 100) / 100}MB`
    );

    // File usage
    const fileUsage = storageUsage?.fileCountUsage || 0;
    const fileUsagePercentage = (fileUsage / FILE_UPLOAD_COUNT_LIMIT) * 100;
    console.log("fileUsagePercentage", fileUsagePercentage);
    if (fileUsagePercentage > 80) {
      setFileAmpleState("red");
    } else if (fileUsagePercentage > 60) {
      setFileAmpleState("yellow");
    } else {
      setFileAmpleState("green");
    }
    const fileUsageGlosary = `${fileUsage}/${FILE_UPLOAD_COUNT_LIMIT} (${fileUsagePercentage}%)`;
    setFileUsageGlosary(fileUsageGlosary);
    setFileUsage(fileUsage); // TODO: Add fileUsage state if needed
  }, [storageUsage]);

  return (
    <View className="flex flex-row flex-wrap w-full gap-md p-sm pt-xl border-0 border-red-500">
      <Card
        className="flex items-center justify-center gap-4 w-[48%]
      bg-card dark:bg-card-dark border-border col-span-1
      "
      >
        <CardHeader className="w-full py-sm">
          <CardTitle
            className="text-card-foreground dark:text-card-foreground-dark
          border-0 border-blue-500"
          >
            <View className="items-center justify-center">
              <Ionicons
                name="chatbox-ellipses-outline"
                size={20}
                color={isDark ? "white" : "black"}
              />
            </View>
            <Text
              className="flex flex-1 text-heading-4 font-semibold
            text-foreground-secondary dark:text-foreground-secondaryDark"
            >
              Storage Usage
            </Text>
            <View className="flex items-center justify-center">
              <BadgeWithIcon
                className={`bg-${storageAmpleState}-600 border-0 ml-auto`}
                dot
                dotSize={14}
                label={"0"}
                textClassName="text-md font-medium text-foreground dark:text-foreground-dark"
              >
                {}
              </BadgeWithIcon>
            </View>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-sm pt-0 pb-xs">
          {storageUsageChartData && (
            <GiftedPieChart
              data={storageUsageChartData}
              config={{
                gradientCenterColor: "rgb(208, 173, 147)",
              }}
            />
          )}
          <View
            className="flex-row items-center gap-x-sm justify-center text-center -mt-md
          border-0 border-green-500"
          >
            <Text className="text-foreground dark:text-foreground-dark">
              {storageUsageGlosary}
            </Text>
          </View>
        </CardContent>
      </Card>

      <Card
        className="flex items-center justify-center gap-4 w-[48%]
        bg-card dark:bg-card-dark border-border col-span-1
      "
      >
        <CardHeader className="w-full py-sm">
          <CardTitle
            className="text-card-foreground dark:text-card-foreground-dark
          border-0 border-blue-500"
          >
            <View className="items-center justify-center">
              <Ionicons
                name="folder-outline"
                size={20}
                color={isDark ? "white" : "black"}
              />
            </View>
            <Text
              className="flex flex-1 text-heading-4 font-semibold
            text-foreground-secondary dark:text-foreground-secondaryDark"
            >
              Usage by Files
            </Text>
            <View className="flex items-center justify-center">
              <BadgeWithIcon
                className={`bg-${fileAmpleState}-600 border-0 ml-auto`}
                dot
                dotSize={14}
                label={"0"}
                textClassName="text-md font-medium text-foreground dark:text-foreground-dark"
              >
                {}
              </BadgeWithIcon>
            </View>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-sm pt-0 pb-xs ">
          {fileUsageChartData && (
            <GiftedPieChart
              data={fileUsageChartData}
              config={{
                gradientCenterColor: "rgb(208, 173, 147)",
              }}
            />
          )}
          <View
            className="flex-row items-center gap-x-sm justify-center text-center -mt-md
          border-0 border-green-500"
          >
            <Text className="text-foreground dark:text-foreground-dark">
              {fileUsageGlosary}
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default InitScreenChartSection;
