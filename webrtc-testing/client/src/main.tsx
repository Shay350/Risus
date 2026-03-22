import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// import App from "./App.tsx";
import VideoCall from "./CallPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VideoCall />
  </StrictMode>,
);
