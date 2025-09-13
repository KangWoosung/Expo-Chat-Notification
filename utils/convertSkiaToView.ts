import { INITIAL_CIRCLE_R } from "@/components/onboarding/OnboardingStage";

// Skia Circle 중심점을 React Native View 왼쪽 모서리로 변환하는 worklet 함수
export const convertSkiaCenterToViewLeft = (skiaCenterX: number): number => {
  "worklet";
  return skiaCenterX - INITIAL_CIRCLE_R; // 중심점에서 반지름만큼 빼기
};

// Skia Circle 중심점을 React Native View 위쪽 모서리로 변환하는 함수
export const convertSkiaCenterToViewTop = (skiaCenterY: number): number => {
  "worklet";
  return skiaCenterY - INITIAL_CIRCLE_R; // 중심점에서 반지름만큼 빼기
};
