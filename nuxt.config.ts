import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SPA mode — no SSR needed for admin dashboard, simplifies naive-ui integration
  ssr: false,

  css: [
    'grapesjs/dist/css/grapes.min.css',
    '~/assets/css/main.css',
    '~/assets/css/editor.css',
  ],

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'webbuilder-dev-secret-change-in-production',
    mysqlHost: process.env.MYSQL_HOST || 'localhost',
    mysqlPort: process.env.MYSQL_PORT || '3306',
    mysqlUser: process.env.MYSQL_USER || 'webbuilder',
    mysqlPassword: process.env.MYSQL_PASSWORD || 'webbuilder123',
    mysqlDatabase: process.env.MYSQL_DATABASE || 'webbuilder',
    r2AccountId: process.env.R2_ACCOUNT_ID || '943bff6b05f8ea689c78f0d1f5724bce',
    r2BucketName: process.env.R2_BUCKET_NAME || 'web-builder',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '6bb3b122352fdf7b40ac209008e9d326',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'ff5a9b333cdbddf2f2743d9cb084fd8f3c8cea859975e4251502bd427f8a6640',
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'naive-ui',
        'vueuc',
        '@css-render/vue3-ssr',
        '@juggle/resize-observer',
      ],
    },
  },
})
