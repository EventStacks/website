module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/react-in-jsx-scope": "off",
    "no-useless-catch": "off",
    "no-unused-vars": "warn",
    "no-mixed-spaces-and-tabs": "warn",
    "no-useless-escape": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
