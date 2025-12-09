export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  app: {
    head: {
      title: 'LexiStack - 3D Word Tower Game',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'A beautiful 3D word tower game. Connect adjacent letters to form words and clear the tower before it reaches the top!' },
        { name: 'theme-color', content: '#0f172a' },
        { property: 'og:title', content: 'LexiStack - 3D Word Tower Game' },
        { property: 'og:description', content: 'A beautiful 3D word tower game. Connect adjacent letters to form words!' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  ssr: false,
  devServer: {
    port: 3000
  }
})

