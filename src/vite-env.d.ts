/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}