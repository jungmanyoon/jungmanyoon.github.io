/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // brand: 단일 brand 스케일 (amber 기준, 명도 균일 10단계)
        'brand': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE7A6',
          300: '#FBD174',
          400: '#F8B43C',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // bread: 하위호환 별칭 - brand와 100% 동일 hex로 재정의(기존 bread-* 281회가 자동으로 brand 톤으로 통일)
        'bread': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE7A6',
          300: '#FBD174',
          400: '#F8B43C',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // semantic: 의미 토큰 (Tailwind 기본 emerald/amber/rose/blue와 동일값)
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#F43F5E',
        'info': '#3B82F6',
        // 뉴트럴(surface/line/ink) - 화면 대부분(80%+)을 담당. brand(amber)는 CTA/활성/강조 액센트로만.
        // Codex(gpt-5.5)와 협의한 슬레이트 기반 의미 토큰. bread/brand는 그대로 두고 "추가만" 함.
        'surface': {
          canvas: '#F8FAFC',   // 페이지 배경(slate-50)
          paper: '#FFFFFF',    // 카드/패널/폼 표면
          muted: '#F1F5F9',    // 접힌/보조 영역(slate-100)
        },
        'line': {
          DEFAULT: '#E2E8F0',  // 기본 보더(slate-200)
          soft: '#F1F5F9',     // 약한 보더(slate-100)
          strong: '#CBD5E1',   // 강한 보더(slate-300)
        },
        'ink': {
          DEFAULT: '#0F172A',  // 기본 텍스트(slate-900)
          muted: '#475569',    // 보조 텍스트(slate-600)
          subtle: '#64748B',   // 더 약한 텍스트(slate-500)
          disabled: '#94A3B8', // 비활성(slate-400)
          inverse: '#FFFFFF',  // 어두운 배경 위 텍스트
        },
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        'full': '9999px',
      },
      boxShadow: {
        // elevation 위계 토큰
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'cardHover': '0 4px 8px -2px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'dropdown': '0 4px 12px -2px rgb(0 0 0 / 0.12), 0 2px 6px -2px rgb(0 0 0 / 0.08)',
        'modal': '0 20px 40px -8px rgb(0 0 0 / 0.20), 0 8px 16px -8px rgb(0 0 0 / 0.12)',
        'focus': '0 0 0 3px rgb(245 158 11 / 0.35)',
      },
      fontSize: {
        // 타이포 스케일 토큰
        'display': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1': ['1.5rem', { lineHeight: '1.875rem', fontWeight: '700' }],
        'h2': ['1.25rem', { lineHeight: '1.625rem', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
      },
      fontFamily: {
        'sans': ['Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'Noto Sans KR', 'sans-serif'],
      }
    },
  },
  plugins: [],
}