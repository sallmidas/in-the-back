import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Capacitor } from "@capacitor/core"
import { BrowserRouter, HashRouter } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"

const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter

if (
  import.meta.env.PROD &&
  !Capacitor.isNativePlatform() &&
  "serviceWorker" in navigator
) {
  // Network-only SW: Chromium needs a fetch handler to offer install.
  // Do not cache the board here — a last-seen cache would serve a stale
  // demo seed after VITE_DEMO_SEED=0. Native Add to Home Screen only;
  // do not intercept beforeinstallprompt with a custom nag.
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* installability is best-effort */
    })
  })
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
