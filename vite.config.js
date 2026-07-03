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
    react(),
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
        theme_color: '#D97706',
        background_color: '#FFFBEB',
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
    // 공개 배포(gh-pages)에 원본 소스가 노출되지 않도록 소스맵 비활성
    sourcemap: false,
    rollupOptions: {
      output: {
        // 코드 스플리팅: vendor 라이브러리를 용도별 청크로 분리해 메인 청크를 500KB 아래로 유지
        // 함수형 manualChunks - node_modules 경로 기반으로 안전하게 분리
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          // React 코어 (react, react-dom, scheduler) - 가장 안정적이고 변경이 드물어 장기 캐싱에 유리
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor'
          }
          // 상태 관리 + 국제화 (zustand, i18next 계열, react-i18next)
          if (
            id.includes('node_modules/zustand/') ||
            id.includes('node_modules/i18next') ||
            id.includes('node_modules/react-i18next/')
          ) {
            return 'state-i18n'
          }
          // html2canvas - 화면 캡처용 대용량 라이브러리, 사용처가 한정적이라 단독 분리
          if (id.includes('node_modules/html2canvas/')) {
            return 'html2canvas'
          }
          // lucide-react - 아이콘 라이브러리, 별도 청크로 분리
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons'
          }
          // 그 외 나머지 의존성은 공통 vendor 청크로 묶어 과도한 파편화 방지
          return 'vendor'
        },
        chunkFileNames: (chunkInfo) => {
          // facadeModuleId가 없는 vendor 청크는 manualChunks에서 지정한 이름(chunkInfo.name)을 사용
          // (예: react-vendor, state-i18n, html2canvas) - 캐싱/디버깅 식별성 향상
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : (chunkInfo.name || 'chunk')
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