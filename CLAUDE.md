# Recipe Book 프로젝트 개발 가이드

## 프로젝트 개요
무료 제과제빵 레시피 변환 웹 애플리케이션

## 기술 스택
- React 18.2 + TypeScript
- Vite 5.x (빌드 도구)
- Zustand (상태 관리)
- TailwindCSS (스타일링)
- PWA (vite-plugin-pwa)

---

## 알려진 이슈 및 재발 방지 대책

### React Hooks "Invalid hook call" 오류 - 완전 해결됨 ✅

**증상:**
```
Invalid hook call. Hooks can only be called inside of the body of a function component.
Cannot read properties of null (reading 'useRef')
```
- `App.lazy.tsx:39` 등 lazy 파일명으로 오류 표시
- 대시보드 등 대형 컴포넌트 수정 시 주로 발생

**근본 원인:**
1. Vite HMR + React.lazy() 조합에서 모듈 교체 시 React 컨텍스트 손상
2. 여러 React 인스턴스가 로드되어 hooks 상태 불일치
3. Fast Refresh가 lazy 컴포넌트 경계를 넘지 못함

**영구 해결책 (App.tsx에 적용됨):**
```tsx
// 개발환경: 직접 import (HMR 안정성) ✅
// 프로덕션: lazy loading (번들 최적화) ✅
const isDev = import.meta.env.DEV

// 개발환경용 직접 import
import AdvancedDashboardDirect from '@components/dashboard/AdvancedDashboard'
// ... 기타 컴포넌트

// 프로덕션용 lazy import
const AdvancedDashboardLazy = lazy(() => import('@components/dashboard/AdvancedDashboard'))
// ... 기타 컴포넌트

// 환경에 따른 컴포넌트 선택
const AdvancedDashboard = isDev ? AdvancedDashboardDirect : AdvancedDashboardLazy
```

**보조 설정 (vite.config.js):**
```js
resolve: {
  dedupe: ['react', 'react-dom']  // React 중복 인스턴스 방지
},
optimizeDeps: {
  include: ['react', 'react-dom']  // 사전 번들링
}
```

**이 방식의 장점:**
1. 개발환경: 직접 import로 HMR 충돌 완전 방지
2. 프로덕션: lazy loading으로 번들 최적화 유지
3. 코드 수정 시 새로고침 불필요

**만약 오류 발생 시 (거의 없음):**
- 브라우저 새로고침 (F5)
- 개발 서버 재시작 (`npm run dev`)

---

## 개발 규칙

### 컴포넌트 구조
```
src/
├── components/
│   ├── dashboard/    # 대시보드 관련 (AdvancedDashboard, SimpleDashboard 등)
│   ├── recipe/       # 레시피 관련
│   ├── conversion/   # 변환 도구
│   ├── calculator/   # 계산기
│   └── common/       # 공통 컴포넌트
├── stores/           # Zustand 스토어
├── utils/            # 유틸리티 함수
└── types/            # TypeScript 타입 정의
```

### Lazy Loading 컴포넌트 작성 시 주의사항
1. **모든 hooks는 컴포넌트 최상위에서 호출**
2. **조건부 hooks 호출 금지**
3. **useEffect/useMemo 의존성 배열 정확히 명시**

```tsx
// 올바른 예시
const MyComponent = () => {
  const [state, setState] = useState(0);  // 항상 최상위
  const memoized = useMemo(() => {...}, [deps]);  // 의존성 명시

  return <div>{state}</div>;
};

// 잘못된 예시
const MyComponent = () => {
  if (condition) {
    const [state, setState] = useState(0);  // 조건부 hooks - 금지!
  }
  return <div />;
};
```

### 스토어 사용 규칙
- Zustand 스토어 import 시 선택적 구독 사용
```tsx
// 좋은 예시 - 필요한 것만 구독
const { recipes } = useRecipeStore();

// 피해야 할 예시 - 전체 스토어 구독 (불필요한 리렌더링)
const store = useRecipeStore();
```

---

## 개발 서버 트러블슈팅

### WebSocket 연결 실패
```
WebSocket connection to 'ws://localhost:5173/...' failed
```
**해결:** 개발 서버 재시작 (`npm run dev`)

### HMR 작동 안 함
**해결:**
1. 브라우저 캐시 삭제
2. 개발 서버 재시작
3. `node_modules/.vite` 폴더 삭제 후 재시작

### 빌드 오류
```bash
# 클린 빌드
rm -rf node_modules/.vite dist
npm run build
```

---

## 커밋 메시지 규칙
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- style: 스타일 변경
- docs: 문서 수정
- chore: 기타 변경
