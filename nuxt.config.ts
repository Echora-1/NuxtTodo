export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  modules: ['@pinia/nuxt', '@nuxt/fonts', '@nuxt/icon'],
  imports: {
    dirs: ['stores'],
  },

  icon: {
    mode: 'svg',
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
  },
  fonts: {
    families: [
      { name: 'Geist', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] },
    ],
  },
  css: ['~/assets/scss/main.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/_tools.scss" as *;',
        },
      },
    },
  },
  app: {
    head: {
      title: 'Заметки',
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
