// env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

interface ImportMetaEnv {
    // Клиентские переменные
    readonly VITE_API_URL: string
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_DESCRIPTION?: string
    readonly VITE_APP_VERSION: string
    readonly VITE_NODE_ENV: 'development' | 'production'

    // Серверные переменные (не используются в клиенте)
    readonly MONGODB_URI?: string
    readonly JWT_SECRET?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}