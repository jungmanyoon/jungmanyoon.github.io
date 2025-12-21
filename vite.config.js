import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@types': path.resolve(__dirname, './src/types'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@data': path.resolve(__dirname, './src/data')
    },
    // React 중복 인스턴스 방지 - HMR 오류 해결
    dedupe: ['react', 'react-dom']
  },
  // HMR 최적화 설정
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // lazy loading 컴포넌트의 HMR 안정성 향상
    exclude: []
  },
  plugins: [
    react({
      // Fast Refresh 설정 - lazy 컴포넌트 HMR 안정성
      fastRefresh: true,
      // Babel 설정으로 HMR 경계 명확화
      babel: {
        plugins: [
          // React 컴포넌트 경계 유지
        ]
      }
    }),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['favicon.ico', 'icon.svg'],
      manifest: {
        name: '레시피북 - 제과제빵 레시피 변환기',
        short_name: '레시피북',
        description: '무료 제과제빵 레시피 변환 웹 애플리케이션',
        theme_color: '#8B4513',
        background_color: '#FFF8DC',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        lang: 'ko-KR',
        categories: ['food', 'lifestyle', 'productivity'],
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: "새 레시피",
            short_name: "새 레시피",
            description: "새로운 레시피를 만듭니다",
            url: "/?shortcut=new-recipe",
            icons: [{ src: "/icon.svg", sizes: "any" }]
          },
          {
            name: "레시피 목록",
            short_name: "목록",
            description: "저장된 레시피 목록을 봅니다",
            url: "/?shortcut=recipe-list",
            icons: [{ src: "/icon.svg", sizes: "any" }]
          }
        ],
        share_target: {
          action: "/share-recipe",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "title",
            text: "text",
            url: "url"
          }
        }
      },
      workbox: undefined,
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // manualChunks: {
        //   'vendor-react': ['react', 'react-dom'],
        //   'vendor-ui': ['tailwindcss'],
        //   'vendor-utils': ['zustand', 'html2canvas'],
        //   'calculations': [
        //     './src/utils/calculations/bakersPercentage.ts',
        //     './src/utils/calculations/ddtCalculator.ts'
        //   ]
        // },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
          return `assets/js/${facadeModuleId}-[hash].js`
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          } else {
            return `assets/[name]-[hash][extname]`
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 5173,
    open: true
  }
})