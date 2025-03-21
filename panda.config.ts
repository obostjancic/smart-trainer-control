import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import blue from "@park-ui/panda-preset/colors/blue";
import sage from "@park-ui/panda-preset/colors/sage";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          bg: {
            base: {
              value: { base: "{colors.white}", _dark: "{colors.gray.900}" },
            },
          },
        },
      },
    },
  },
  presets: [
    "@pandacss/preset-base",
    createPreset({
      accentColor: blue,
      grayColor: sage,
      radius: "md",
    }),
  ],
  jsxFramework: "react",

  // The output directory for your css system
  outdir: "styled-system",
});
