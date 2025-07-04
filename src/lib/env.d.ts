
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND: string;
  readonly VITE_MONGODB_URI: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
