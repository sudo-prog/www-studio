import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// Wire the API server base URL so the generated api-client-react hooks
// can reach the backend in production.
const apiServerUrl = import.meta.env.VITE_API_SERVER_URL;
if (apiServerUrl) setBaseUrl(apiServerUrl);

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
}
