/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_SEED?: string
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
