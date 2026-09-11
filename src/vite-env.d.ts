/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_SEED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
