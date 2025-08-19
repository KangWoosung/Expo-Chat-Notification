/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./types/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class", // 다크 모드 설정 ('class' 기반으로 다크 모드 전환)
  theme: {
    extend: {
      colors: {
        // 그레이 스케일 기본 색상 (HSL)
        gray: {
          50: "hsl(210, 20%, 98%)", // 가장 밝은 그레이
          100: "hsl(210, 20%, 96%)", // 매우 밝은 그레이
          200: "hsl(210, 20%, 90%)", // 밝은 그레이
          300: "hsl(210, 20%, 82%)", // 중간 밝은 그레이
          400: "hsl(210, 20%, 70%)", // 중간 그레이
          500: "hsl(210, 20%, 55%)", // 기본 그레이
          600: "hsl(210, 20%, 45%)", // 중간 어두운 그레이
          700: "hsl(210, 20%, 35%)", // 어두운 그레이
          800: "hsl(210, 20%, 25%)", // 매우 어두운 그레이
          900: "hsl(210, 20%, 15%)", // 가장 어두운 그레이
          950: "hsl(210, 20%, 8%)", // 거의 검은 그레이
        },

        // 액센트 컬러 (블루-네이비 중간)
        accent: {
          50: "hsl(220, 70%, 95%)", // 가장 밝은 액센트
          100: "hsl(220, 70%, 90%)", // 매우 밝은 액센트
          200: "hsl(220, 70%, 80%)", // 밝은 액센트
          300: "hsl(220, 70%, 70%)", // 중간 밝은 액센트
          400: "hsl(220, 70%, 60%)", // 중간 액센트
          500: "hsl(220, 70%, 50%)", // 기본 액센트
          600: "hsl(220, 70%, 40%)", // 중간 어두운 액센트
          700: "hsl(220, 70%, 30%)", // 어두운 액센트
          800: "hsl(220, 70%, 20%)", // 매우 어두운 액센트
          900: "hsl(220, 70%, 10%)", // 가장 어두운 액센트
          950: "hsl(220, 70%, 5%)", // 거의 검은 액센트
        },

        // 라이트 모드와 다크 모드에 따른 배경 및 전경 색상
        background: {
          DEFAULT: "hsl(210, 20%, 98%)", // 라이트 모드 기본 배경 (gray-50)
          blank: "hsl(0, 0%, 100%)", // 라이트 모드 빈 배경 (흰색)
          dark: "hsl(210, 20%, 8%)", // 다크 모드 기본 배경 (gray-950)
          secondary: "hsl(210, 10.70%, 89.00%)", // 라이트 모드 보조 배경 (gray-100)
          secondaryDark: "hsl(216, 4.70%, 21.00%)", // 다크 모드 보조 배경 (gray-900)
          tertiary: "hsl(210, 20%, 90%)", // 라이트 모드 3차 배경 (gray-200)
          tertiaryDark: "hsl(210, 20%, 25%)", // 다크 모드 3차 배경 (gray-800)
        },
        foreground: {
          DEFAULT: "hsl(210, 20%, 15%)", // 라이트 모드 기본 전경 (gray-900)
          dark: "hsl(210, 20%, 98%)", // 다크 모드 기본 전경 (gray-50)
          secondary: "hsl(210, 20%, 25%)", // 라이트 모드 보조 전경 (gray-800)
          secondaryDark: "hsl(210, 20%, 90%)", // 다크 모드 보조 전경 (gray-200)
          tertiary: "hsl(210, 20%, 35%)", // 라이트 모드 3차 전경 (gray-700)
          tertiaryDark: "hsl(210, 20%, 70%)", // 다크 모드 3차 전경 (gray-400)
        },

        // 버튼 색상 (Primary 및 Secondary)
        primary: {
          DEFAULT: "hsl(221, 57.10%, 48.40%)", // 브랜드 컬러 (accent-500)
          dark: "hsl(220, 70%, 60%)", // 다크 모드 브랜드 컬러 (accent-400)
          hover: "hsl(220, 70%, 40%)", // 호버 상태 (accent-600)
          hoverDark: "hsl(220, 70%, 50%)", // 다크 모드 호버 상태 (accent-500)
          active: "hsl(220, 70%, 30%)", // 활성 상태 (accent-700)
          activeDark: "hsl(220, 70%, 40%)", // 다크 모드 활성 상태 (accent-600)
          disabled: "hsl(210, 20%, 70%)", // 비활성화 상태 (gray-400)
          disabledDark: "hsl(210, 20%, 35%)", // 다크 모드 비활성화 상태 (gray-700)
        },
        secondary: {
          DEFAULT: "hsl(210, 20%, 55%)", // 보조 컬러 (gray-500)
          dark: "hsl(210, 20%, 70%)", // 다크 모드 보조 컬러 (gray-400)
          hover: "hsl(210, 20%, 45%)", // 호버 상태 (gray-600)
          hoverDark: "hsl(210, 20%, 60%)", // 다크 모드 호버 상태 (gray-500)
          active: "hsl(210, 20%, 35%)", // 활성 상태 (gray-700)
          activeDark: "hsl(210, 20%, 50%)", // 다크 모드 활성 상태 (gray-600)
          disabled: "hsl(210, 20%, 82%)", // 비활성화 상태 (gray-300)
          disabledDark: "hsl(210, 20%, 25%)", // 다크 모드 비활성화 상태 (gray-800)
        },

        // 경고 (Warning) 색상
        warning: {
          DEFAULT: "hsl(45, 100%, 60%)", // 경고 컬러 (밝은 노랑)
          dark: "hsl(45, 100%, 50%)", // 다크 모드 경고 컬러 (노랑)
          hover: "hsl(45, 100%, 55%)", // 호버 상태
          hoverDark: "hsl(45, 100%, 45%)", // 다크 모드 호버 상태
          active: "hsl(45, 100%, 50%)", // 활성 상태
          activeDark: "hsl(45, 100%, 40%)", // 다크 모드 활성 상태
        },

        // 에러 색상
        error: {
          DEFAULT: "hsl(0, 70%, 60%)", // 에러 컬러 (빨강)
          dark: "hsl(0, 70%, 50%)", // 다크 모드 에러 컬러
          hover: "hsl(0, 70%, 55%)", // 호버 상태
          hoverDark: "hsl(0, 70%, 45%)", // 다크 모드 호버 상태
          active: "hsl(0, 70%, 50%)", // 활성 상태
          activeDark: "hsl(0, 70%, 40%)", // 다크 모드 활성 상태
        },

        // 성공 색상
        success: {
          DEFAULT: "hsl(142, 70%, 50%)", // 성공 컬러 (초록)
          dark: "hsl(142, 70%, 40%)", // 다크 모드 성공 컬러
          hover: "hsl(142, 70%, 45%)", // 호버 상태
          hoverDark: "hsl(142, 70%, 35%)", // 다크 모드 호버 상태
          active: "hsl(142, 70%, 40%)", // 활성 상태
          activeDark: "hsl(142, 70%, 30%)", // 다크 모드 활성 상태
        },

        // 정보 색상
        info: {
          DEFAULT: "hsl(220, 70%, 50%)", // 정보 컬러 (액센트와 동일)
          dark: "hsl(220, 70%, 60%)", // 다크 모드 정보 컬러
          hover: "hsl(220, 70%, 45%)", // 호버 상태
          hoverDark: "hsl(220, 70%, 55%)", // 다크 모드 호버 상태
          active: "hsl(220, 70%, 40%)", // 활성 상태
          activeDark: "hsl(220, 70%, 50%)", // 다크 모드 활성 상태
        },

        // 추가 유틸리티 색상
        border: {
          DEFAULT: "hsl(210, 20%, 82%)", // 라이트 모드 테두리 (gray-300)
          dark: "hsl(198, 20.30%, 25.10%)", // 다크 모드 테두리 (gray-800)
        },

        input: {
          DEFAULT: "hsl(0, 0%, 100%)", // 라이트 모드 입력 배경 (흰색)
          dark: "hsl(210, 20%, 15%)", // 다크 모드 입력 배경 (gray-900)
          border: "hsl(210, 20%, 82%)", // 라이트 모드 입력 테두리 (gray-300)
          borderDark: "hsl(210, 20%, 25%)", // 다크 모드 입력 테두리 (gray-800)
          focus: "hsl(220, 70%, 50%)", // 포커스 테두리 (accent-500)
          focusDark: "hsl(220, 70%, 60%)", // 다크 모드 포커스 테두리 (accent-400)
        },

        card: {
          DEFAULT: "hsl(0, 0%, 100%)", // 라이트 모드 카드 배경 (흰색)
          dark: "hsl(210, 20%, 15%)", // 다크 모드 카드 배경 (gray-900)
        },

        popover: {
          DEFAULT: "hsl(0, 0%, 100%)", // 라이트 모드 팝오버 배경 (흰색)
          dark: "hsl(210, 20%, 15%)", // 다크 모드 팝오버 배경 (gray-900)
        },

        muted: {
          DEFAULT: "hsl(210, 20%, 96%)", // 라이트 모드 뮤티드 배경 (gray-100)
          dark: "hsl(210, 20%, 25%)", // 다크 모드 뮤티드 배경 (gray-800)
          foreground: "hsl(210, 20%, 45%)", // 라이트 모드 뮤티드 전경 (gray-600)
          foregroundDark: "hsl(210, 20%, 70%)", // 다크 모드 뮤티드 전경 (gray-400)
        },

        ring: {
          DEFAULT: "hsl(220, 70%, 50%)", // 포커스 링 (accent-500)
          dark: "hsl(220, 70%, 60%)", // 다크 모드 포커스 링 (accent-400)
        },
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },

      // 타이포그래피 시스템 (font size와 line height)
      fontSize: {
        // 모바일 우선 타이포그래피 시스템
        "display-1": ["32px", { lineHeight: "40px", letterSpacing: "-0.5px" }],
        "display-2": ["28px", { lineHeight: "36px", letterSpacing: "-0.25px" }],
        h1: ["24px", { lineHeight: "32px", letterSpacing: "0" }],
        h2: ["20px", { lineHeight: "28px", letterSpacing: "0" }],
        h3: ["18px", { lineHeight: "26px", letterSpacing: "0.15px" }],
        h4: ["16px", { lineHeight: "24px", letterSpacing: "0.15px" }],
        h5: ["14px", { lineHeight: "22px", letterSpacing: "0.1px" }],
        "body-1": ["16px", { lineHeight: "24px", letterSpacing: "0.5px" }],
        "body-2": ["14px", { lineHeight: "22px", letterSpacing: "0.25px" }],
        caption: ["12px", { lineHeight: "18px", letterSpacing: "0.4px" }],
        overline: ["10px", { lineHeight: "16px", letterSpacing: "1.5px" }],
        button: ["14px", { lineHeight: "20px", letterSpacing: "1.25px" }],
      },

      // 간격 시스템 (일관된 여백)
      spacing: {
        // 기본 간격 시스템은 유지하면서 필요한 커스텀 값 추가
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "96px",
      },

      // 테두리 반경
      borderRadius: {
        none: "0",
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },

      // 그림자 시스템
      boxShadow: {
        none: "none",
        xs: "0 1px 2px rgba(30, 41, 59, 0.05)",
        sm: "0 1px 3px rgba(30, 41, 59, 0.1), 0 1px 2px rgba(30, 41, 59, 0.06)",
        md: "0 4px 6px -1px rgba(30, 41, 59, 0.1), 0 2px 4px -1px rgba(30, 41, 59, 0.06)",
        lg: "0 10px 15px -3px rgba(30, 41, 59, 0.1), 0 4px 6px -2px rgba(30, 41, 59, 0.05)",
        xl: "0 20px 25px -5px rgba(30, 41, 59, 0.1), 0 10px 10px -5px rgba(30, 41, 59, 0.04)",
      },

      // Opacity
      opacity: {
        50: "0.5",
        25: "0.25",
      },

      // 애니메이션 지속 시간
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "350ms",
      },

      // 애니메이션 타이밍 함수
      transitionTimingFunction: {
        default: "cubic-bezier(0.4, 0, 0.2, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  // 사용자 정의 유틸리티 클래스
  plugins: [
    function ({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        // 텍스트 스타일
        ".text-display-1": {
          fontSize: "32px",
          lineHeight: "40px",
          letterSpacing: "-0.5px",
          fontFamily: "Poppins-Bold, sans-serif",
        },
        ".text-display-2": {
          fontSize: "28px",
          lineHeight: "36px",
          letterSpacing: "-0.25px",
          fontFamily: "Poppins-Bold, sans-serif",
        },
        ".text-heading-1": {
          fontSize: "24px",
          lineHeight: "32px",
          fontFamily: "Poppins-SemiBold, sans-serif",
        },
        ".text-heading-2": {
          fontSize: "20px",
          lineHeight: "28px",
          fontFamily: "Poppins-SemiBold, sans-serif",
        },
        ".text-heading-3": {
          fontSize: "18px",
          lineHeight: "26px",
          letterSpacing: "0.15px",
          fontFamily: "Poppins-Medium, sans-serif",
        },
        ".text-body-1": {
          fontSize: "16px",
          lineHeight: "24px",
          letterSpacing: "0.5px",
          fontFamily: "Poppins-Regular, sans-serif",
        },
        ".text-body-2": {
          fontSize: "14px",
          lineHeight: "22px",
          letterSpacing: "0.25px",
          fontFamily: "Poppins-Regular, sans-serif",
        },
        ".text-caption": {
          fontSize: "12px",
          lineHeight: "18px",
          letterSpacing: "0.4px",
          fontFamily: "Poppins-Regular, sans-serif",
        },
        ".text-button": {
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "1.25px",
          fontFamily: "Poppins-Medium, sans-serif",
          textTransform: "uppercase",
        },

        // 입력 필드 스타일
        ".input-base": {
          borderWidth: "1px",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "16px",
          lineHeight: "24px",
        },

        // 버튼 스타일
        ".btn-base": {
          borderRadius: "8px",
          padding: "12px 24px",
          textAlign: "center",
          transition: "all 250ms",
        },
        ".btn-small": {
          borderRadius: "8px",
          padding: "8px 16px",
          textAlign: "center",
          fontSize: "12px",
          transition: "all 250ms",
        },
        ".btn-large": {
          borderRadius: "8px",
          padding: "16px 32px",
          textAlign: "center",
          fontSize: "16px",
          transition: "all 250ms",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
