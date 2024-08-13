/** @type {import('tailwindcss').Config} */
import daisyUi from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "640px",

      md: "768px",

      lg: "1024px",

      xl: "1280px",

      "2xl": "1536px",

      xxl: "1580px",

      xxxl: "1780px",

      "3xl": "2020px",

      "4xl": "2440px",

      xs: "360px",

      xsm: "468px",
    },
    extend: {
      colors: {
        blueColor: "var(--blueColor)",
        blueHoverBgColor: "var(--blueHoverBgColor)",
        blueHoverTextColor: "var(--blueHoverTextColor)",
        redColor: "var(--redColor)",
        lightRedColor: "var(--lightRedColor)",
        blueColor: "var(--blueColor)",
        grayColor: "var(--grayColor)",
        grayTextColor: "var(--grayTextColor)",
        textColor: "var(--textColor)",
        whiteColor: "var(--whiteColor)",
        placeHolderColor: "var(--placeHolderColor)",
        borderColor: "var(--borderColor)",
        bgColor: "var(--bgColor)",
        primaryColor: "var(--primaryColor)",
        lightGrayColor: "var(--lightGrayColor)",
        blueTransparentColor: "var(--blueTransparentColor)",
        blueTransparentHoverColor: "var(--blueTransparentHoverColor)",
        activeBlueColor: "var(--activeBlueColor)",
        disabledColor: "var(--disabledColor)",
        toggleIconColor: "var(--toggleIconColor)",
      },
      boxShadow: {
        light: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        SourceSans3: ["Source_Sans_3", "sans-serif"],
      },
    },
  },

  daisyui: {
    themes: [
      {
        cLight: {
          "--blueColor": "#3e5eb9",
          "--blueHoverBgColor": "#264db9",
          "--activeBlueColor": "#3e5eb9",
          "--primaryColor": "#3e5eb9",
          "--blueTransparentColor": "#F6EEFF",
          "--blueTransparentHoverColor": "#e0c7ff",
          "--redColor": "#FF5243",
          "--lightRedColor": "#ff000013",
          "--grayColor": "#404040 ",
          "--grayTextColor": "#797979",
          "--textColor": "#202020",
          "--whiteColor": "#ffffff",
          "--borderColor": "#DDDDE2",
          "--placeHolderColor": "#7c7c83",
          "--bgColor": "#F9F9F9",
          "--lightGrayColor": "#DDE6ED",
          "--disabledColor": "#f4f4f5",
          "--toggleIconColor": "#f4f4f5",
        },
        cDark: {
          "--blueColor": "#3e5eb9",
          "--blueHoverBgColor": "#264db9",
          "--activeBlueColor": "#3e5eb9",
          "--primaryColor": "#3e5eb9",
          "--blueTransparentColor": "#27272a",
          "--blueTransparentHoverColor": "#18181b",
          "--redColor": "#FF5243",
          "--lightRedColor": "#ff000009",
          "--grayColor": "#bfbfbf",
          "--grayTextColor": "#FFFFFF",
          "--textColor": "#ffffff",
          "--whiteColor": "#202020",
          "--placeHolderColor": "#7c7c83",
          "--borderColor": "#3f3f46",
          "--bgColor": "#131313",
          "--lightGrayColor": "#181818",
          "--disabledColor": "#3f3f46",
          "--toggleIconColor": "#f4f4f5",
        },
        cGray: {
          "--blueColor": "#929294",
          "--blueHoverBgColor": "#929294",
          "--activeBlueColor": "#d4d4d8",
          "--primaryColor": "#92929294",
          "--blueTransparentColor": "#27272a",
          "--blueTransparentHoverColor": "#8F8F8F",
          "--redColor": "#929294",
          "--lightRedColor": "#92929294",
          "--grayColor": "#b5b9c2 ",
          "--grayTextColor": "#929294",
          "--textColor": "#ffffff",
          "--whiteColor": "#333333",
          "--placeHolderColor": "#929294",
          "--borderColor": "#404040",
          "--bgColor": "#2B2B2B",
          "--lightGrayColor": "#3f3f3f",
          "--disabledColor": "#92929294",
          "--toggleIconColor": "#27272a",
        },
      },
    ],
  },
  plugins: [daisyUi],
};
