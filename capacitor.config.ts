import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.intheback.app",
  appName: "In the Back",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
}

export default config
