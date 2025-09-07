import Constants from "expo-constants";

export const SSO_SCHEME_NAME =
  Constants.expoConfig?.android?.package || "com.gunymedian.notification_try07";
export const REDIRECT_URI = "sso-callback";

export const APP_NAME = "Expo Notification";

export const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/notification-try01.appspot.com/o/default-avatar.png?alt=media&token=00000000-0000-0000-0000-000000000000";

export const DEFAULT_LOCALE = "en-US";

export const ONBOARDING_FLAG = "onBoardingDisabled";
export const ONBOARDING_STATE_DEFAULT = true;
export const ONBOARDING_INDEX_DEFAULT = 0;

export const THEME_STORAGE_KEY = "themeMode"; // 테마 모드 키
export const MASK_ANIMATE_DURATION = 1500;

export const HEADER_ICON_SIZE = 24;
export const HEADER_ICON_SIZE_SM = 20;
export const THEME_TOGGLER_BUTTON_SIZE = 24;

export const MESSAGES_PER_PAGE = 10;

export const FILE_DELETED_CONTENT_TEXT = "파일이 삭제되었습니다";

// Pagination
export const DEFAULT_PAGE_LIMIT = 20;

// UI
export const CHAT_ROOM_AVATAR_SIZE = 40;

// Animation
export const ANIMATION_DELAY = 300;
export const ANIMATION_DURATION = 300;

// OnBoarding
export const ONBOARDING_FLAG_ROOT_LAYOUT = "onBoardingStatus";
export const ONBOARDING_STATE_DEFAULT_ROOT_LAYOUT = true;
export const ONBOARDING_INDEX_DEFAULT_ROOT_LAYOUT = 0;
