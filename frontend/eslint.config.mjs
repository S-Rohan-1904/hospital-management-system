import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables prefixed with an underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Allow explicit 'any' for gradual migration
      "@typescript-eslint/no-explicit-any": "off",

      // Relax React Hook dependency warnings
      "react-hooks/exhaustive-deps": "warn",

      // Allow React components to have unused props for flexibility
      "react/prop-types": "off",

      // Ignore deprecation warnings
      "no-deprecated-api": "off",
    },
  },
];

export default eslintConfig;
