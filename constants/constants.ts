import Constants from "expo-constants";

export const SSO_SCHEME_NAME =
  Constants.expoConfig?.android?.package || "com.gunymedian.notification_try07";
export const REDIRECT_URI = "sso-callback";

export const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/notification-try01.appspot.com/o/default-avatar.png?alt=media&token=00000000-0000-0000-0000-000000000000";

export const ONBOARDING_FLAG = "onBoardingDisabled";
export const ONBOARDING_STATE_DEFAULT = true;
export const ONBOARDING_INDEX_DEFAULT = 0;

export const THEME_STORAGE_KEY = "themeMode"; // 테마 모드 키
export const MASK_ANIMATE_DURATION = 1500;

export const HEADER_ICON_SIZE = 24;
export const HEADER_ICON_SIZE_SM = 20;
export const THEME_TOGGLER_BUTTON_SIZE = 24;

export const MESSAGES_PER_PAGE = 10;
