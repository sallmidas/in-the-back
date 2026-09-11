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
