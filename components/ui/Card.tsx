/*
2025-08-28 08:13:23





*/

import React from "react";
import { View, Text, ViewProps, TextProps } from "react-native";
import { cn } from "@/lib/utils"; // tailwind className merge 함수 (없으면 그냥 className 쓰면 됨)

const DEFAULT_CARD_CLASSNAME = `rounded-md border border-gray-200 bg-white shadow-sm 
dark:border-gray-700 dark:bg-gray-900`;
const DEFAULT_CARD_HEADER_CLASSNAME = `p-4 border-b border-gray-200 dark:border-gray-700`;
const DEFAULT_CARD_TITLE_CLASSNAME = `flex flex-row items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100`;
const DEFAULT_CARD_CONTENT_CLASSNAME = `p-4`;

type CardProps = ViewProps & {
  className?: string;
};

// Card
export const Card = ({ className, ...props }: CardProps) => {
  return <View className={cn(DEFAULT_CARD_CLASSNAME, className)} {...props} />;
};

type CardHeaderProps = ViewProps & {
  className?: string;
};

// CardHeader
export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <View className={cn(DEFAULT_CARD_HEADER_CLASSNAME, className)} {...props} />
  );
};

type CardTitleProps = ViewProps & {
  className?: string;
};

// CardTitle
export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <View className={cn(DEFAULT_CARD_TITLE_CLASSNAME, className)} {...props}>
      {props.children}
    </View>
  );
};

type CardContentProps = ViewProps & {
  className?: string;
};

// CardContent
export const CardContent = ({ className, ...props }: CardContentProps) => {
  return (
    <View
      className={cn(DEFAULT_CARD_CONTENT_CLASSNAME, className)}
      {...props}
    />
  );
};
