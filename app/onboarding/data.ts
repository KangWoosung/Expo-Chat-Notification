// /app/onboarding/data.js
/*

    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659793.png",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659794.png",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659898.png",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659792.png",


*/
export const onboardingData = [
  {
    title: `EXPO\nNOTIFICATION`,
    description: `Stay informed. Stay connected.\n Smart notifications,\n powered by Expo.`,
    imageUrl: require("../../assets/images/3659793.png"),
    baseColor: "#BABEFA", // 회색빛 파랑
  },
  {
    title: `EXPO\nNOTIFICATION`,
    description: `Delivering real-time alerts right to your pocket.\n Simple. Reliable. Instant notifications.`,
    imageUrl: require("../../assets/images/3659898.png"),
    baseColor: "#9FD4FA", // 하늘색
  },
  {
    title: `EXPO\nNOTIFICATION`,
    description: `Powering instant connections, everywhere you go.\n Seamless notifications for a connected world.`,
    imageUrl: require("../../assets/images/3659794.png"),
    baseColor: "#9d81cc", // 보라
  },
  {
    title: `EXPO\nNOTIFICATION`,
    description: `Stay informed. Stay connected.\n Smart notifications,\n powered by Expo.`,
    imageUrl: require("../../assets/images/3659792.png"),
    baseColor: "#7e9ea3", // 라이트 블루
  },
];

export default onboardingData;

export type OnboardingItemType = (typeof onboardingData)[number];
