// /app/onboarding/data.js
/*

    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659793.png",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659794.png",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659898.png",
    imageUrl: "https://cdn-icons-png.flaticon.com/512/3659/3659792.png",


*/
export const onboardingData = [
  {
    title: "Welcome to Music",
    description: "Discover your favorite tunes",
    imageUrl: require("../../assets/images/3659793.png"),
    baseColor: "#6B728E", // 회색빛 파랑
  },
  {
    title: "Create Your Vibe",
    description: "Make your own playlists",
    imageUrl: require("../../assets/images/3659898.png"),
    baseColor: "#9ebcdb", // 하늘색
  },
  {
    title: "Explore Playlists",
    description: "Curated just for you",
    imageUrl: require("../../assets/images/3659794.png"),
    baseColor: "#9d81cc", // 보라
  },
  {
    title: "Enjoy Anytime",
    description: "Music on the go",
    imageUrl: require("../../assets/images/3659792.png"),
    baseColor: "#7e9ea3", // 라이트 블루
  },
];

export default onboardingData;

export type OnboardingItemType = (typeof onboardingData)[number];
