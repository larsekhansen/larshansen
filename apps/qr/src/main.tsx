import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Self-hosted fonts (bundled by Vite), so the page makes no requests to Google.
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
