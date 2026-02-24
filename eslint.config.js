// @ts-check
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    rules: {
      // Require all variables to be initialized when declared
      "init-declarations": ["error", "always"],

      // Require explicit return type annotations on all functions
      "@typescript-eslint/explicit-function-return-type": "error",

      // Require type annotations on function parameters
      "@typescript-eslint/typedef": [
        "error",
        {
          parameter: true,
          arrowParameter: true,
        },
      ],
    },
  }
);
