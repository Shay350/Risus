import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: ["webrtc-testing/**"],
  },
];

export default config;
