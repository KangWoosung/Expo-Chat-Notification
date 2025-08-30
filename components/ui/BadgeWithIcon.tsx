import {
  View,
  Text,
  GestureResponderEvent,
  ViewProps,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

type BadgeWithIconProps = {
  /** 뱃지 라벨 (숫자/문자). dot=true면 무시됨 */
  label?: string | number;
  /** Ionicons 아이콘 이름 (예: "notifications", "checkmark") */
  iconName?: keyof typeof Ionicons.glyphMap | string;
  /** 아이콘 위치 */
  iconPosition?: "left" | "right" | "only";
  /** 아이콘 크기/색 */
  iconSize?: number;
  iconColor?: string;
  /** tailwind */
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  /** 점 뱃지 모드 */
  dot?: boolean;
  dotSize?: number; // default 10
  /** 100이상일 때 99+ 같이 보여주기 */
  maxCount?: number; // default 99
  /** 클릭 가능 여부 */
  pressable?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  ref?: React.RefObject<View>;
} & Omit<ViewProps, "style">;

const DEFAULT_BADGE_WITH_ICON_CLASSNAME = `flex-row items-center justify-center 
px-2 py-0.5 
    rounded-full border-2
  bg-primary/90 dark:bg-primary 
  `;
const DEFAULT_BADGE_WITH_ICON_TEXT_CLASSNAME = "text-white text-sm font-medium";

const BadgeWithIcon = ({
  label,
  iconName,
  iconPosition = "left",
  iconSize = 12,
  iconColor,
  className = DEFAULT_BADGE_WITH_ICON_CLASSNAME,
  textClassName = DEFAULT_BADGE_WITH_ICON_TEXT_CLASSNAME,
  style,
  dot = false,
  dotSize = 12,
  maxCount = 99,
  pressable = false,
  onPress,
  accessibilityLabel,
  ref,
  ...rest
}: BadgeWithIconProps) => {
  // dot 모드: 작은 점만 렌더
  if (dot) {
    const DotWrapper = pressable ? Pressable : View;
    return (
      <DotWrapper
        ref={ref as any}
        onPress={onPress}
        accessibilityRole={pressable ? "button" : undefined}
        accessibilityLabel={accessibilityLabel ?? "dot badge"}
        className={cn(DEFAULT_BADGE_WITH_ICON_CLASSNAME, className)}
        style={{ width: dotSize, height: dotSize }}
        {...rest}
      />
    );
  }

  // 숫자 제한 (예: 99+)
  const display =
    typeof label === "number" && maxCount != null && label > maxCount
      ? `${maxCount}+`
      : label;

  const Wrapper = pressable ? Pressable : View;

  const iconNode = iconName ? (
    <Ionicons
      name={iconName as any}
      size={iconSize}
      color={iconColor}
      // 아이콘은 NativeWind가 직접 먹지 않으므로 여긴 className 안 써도 됨
      style={{
        marginRight: iconPosition === "left" ? 4 : 0,
        marginLeft: iconPosition === "right" ? 4 : 0,
      }}
    />
  ) : null;

  return (
    <Wrapper
      ref={ref as any}
      onPress={onPress}
      accessibilityRole={pressable ? "button" : undefined}
      accessibilityLabel={
        accessibilityLabel ??
        (typeof display === "string" ? display : String(display ?? ""))
      }
      className={cn(DEFAULT_BADGE_WITH_ICON_CLASSNAME, className)}
      hitSlop={pressable ? 6 : undefined}
      style={style}
      {...rest}
    >
      {iconNode && iconPosition === "left" ? iconNode : null}
      {iconPosition !== "only" && (
        <Text
          className={cn(DEFAULT_BADGE_WITH_ICON_TEXT_CLASSNAME, textClassName)}
        >
          {display}
        </Text>
      )}
      {iconNode && iconPosition === "right" ? iconNode : null}
    </Wrapper>
  );
};

export default BadgeWithIcon;
