# 레시피북 Phase 2 구현 가이드

## 📋 개요

제과제빵 레시피 북 Phase 2에서는 다음과 같은 전문가급 기능들이 구현되었습니다:

1. **테스트 인프라 구축** - Vitest 단위 테스트 + Playwright E2E 테스트
2. **PWA 기능 강화** - 오프라인 모드, 푸시 알림, 백그라운드 동기화
3. **영양 정보 자동 계산** - 재료 기반 영양 성분 분석
4. **원가 계산 시스템** - 재료비, 인건비, 간접비 포함 총 원가 계산
5. **AI 기반 레시피 추천** - 사용자 선호도 학습 기반 맞춤 추천

## 🧪 테스트 인프라

### 구성 요소
- **Vitest**: 빠른 단위 테스트 실행
- **Playwright**: 크로스 브라우저 E2E 테스트
- **React Testing Library**: React 컴포넌트 테스트
- **Coverage**: 코드 커버리지 80% 목표

### 설정 파일
- `vitest.config.ts`: Vitest 설정 및 커버리지 임계값
- `playwright.config.ts`: 멀티 브라우저 테스트 환경
- `src/test/setup.ts`: 테스트 환경 초기화
- `src/test/utils/test-utils.tsx`: 테스트 유틸리티 함수

### 실행 명령어
```bash
# 단위 테스트
npm run test
npm run test:ui
npm run test:coverage

# E2E 테스트
npm run e2e
npm run e2e:ui
npm run e2e:install
```

### 테스트 구조
```
tests/
├── unit/
│   └── utils/
│       ├── bakersPercentage.test.ts
│       └── ddtCalculator.test.ts
└── e2e/
    └── basic-functionality.spec.ts
```

## 📱 PWA 기능

### 핵심 기능
1. **설치 프롬프트**: 사용자 친화적인 앱 설치 안내
2. **오프라인 지원**: 완전한 오프라인 모드
3. **백그라운드 동기화**: 네트워크 복구 시 자동 동기화
4. **푸시 알림**: 베이킹 타이머 및 발효 알림
5. **앱 단축키**: 빠른 기능 접근

### 구현 컴포넌트
- `PWAInstallPrompt.jsx`: 설치 프롬프트 UI
- `PWAStatus.jsx`: 연결 및 동기화 상태 표시
- `TimerManager.jsx`: 베이킹 타이머 관리
- `backgroundSync.js`: 백그라운드 동기화 엔진
- `notificationManager.js`: 푸시 알림 관리

### 사용법
```javascript
// 백그라운드 동기화 사용
import { useBackgroundSync } from '@/utils/pwa/backgroundSync'

const { addToSync, getSyncStatus } = useBackgroundSync()
addToSync({ type: 'SAVE_RECIPE', data: recipe })

// 알림 관리 사용
import { useNotifications } from '@/utils/pwa/notificationManager'

const { setBakingTimer, setFermentationTimer } = useNotifications()
setBakingTimer('바게트 굽기', 25) // 25분 타이머
```

## 🍎 영양 정보 시스템

### 영양 데이터베이스
- **재료별 영양 정보**: 100g 기준 9가지 영양소
- **밀도 정보**: 부피-무게 변환을 위한 밀도 데이터
- **카테고리 분류**: 밀가루, 당류, 유지, 액체 등

### 계산 엔진 기능
1. **총 영양소 계산**: 레시피 전체 영양 성분
2. **1인분 영양소**: 서빙 수 기반 개인별 영양 정보
3. **영양성분표**: 한국 식약처 기준 영양성분표
4. **영양 밀도 분석**: 칼로리당 영양소 밀도
5. **제빵 특화 분석**: 밀가루 구성, 설탕 함량 등

### 사용 예제
```javascript
import NutritionCalculator from '@/utils/calculations/nutritionCalculator'

// 영양 정보 계산
const totalNutrition = NutritionCalculator.calculateTotalNutrition(ingredients)
const perServing = NutritionCalculator.calculatePerServingNutrition(totalNutrition, servings)
const nutritionLabel = NutritionCalculator.generateNutritionLabel(totalNutrition, perServing)
```

## 💰 원가 계산 시스템

### 가격 데이터베이스
- **재료별 시세**: 2024년 기준 한국 소매가
- **도매 가격**: 대량 구매 시 할인가
- **공급업체**: 일반 마트, 전문점 구분
- **패키지 사이즈**: 실제 구매 단위

### 원가 계산 요소
1. **재료비**: 실제 사용량 기준 재료 원가
2. **인건비**: 작업 시간 × 시급 계산
3. **간접비**: 전기, 가스, 임대료 등 (30% 기본값)
4. **손실률**: 제조 과정 손실 고려 (5% 기본값)

### 계산 결과
- **총 원가**: 모든 비용 포함
- **개당 원가**: 서빙 기준 단위 원가
- **마진 분석**: 다양한 마진율별 판매가
- **절감 제안**: AI 기반 비용 절감 방안

### 사용 예제
```javascript
import CostCalculator from '@/utils/calculations/costCalculator'

// 원가 계산
const costData = CostCalculator.calculateTotalCost(recipe, {
  useWholesalePrice: false,
  wasteFactor: 1.05,
  laborRate: 15000,
  overheadRate: 0.3
})

// 판매가 계산
const sellingPrice = CostCalculator.calculateSellingPrice(costData.totalCost, 0.5)
```

## 🤖 AI 추천 시스템

### 추천 엔진 특징
1. **다차원 분석**: 7가지 요소 기반 추천 점수 계산
2. **사용자 학습**: 상호작용 기반 선호도 학습
3. **상황별 추천**: 유사, 초급자용, 예산형, 건강형 등
4. **실시간 적응**: 사용 패턴에 따른 실시간 조정

### 추천 요소
- **난이도 적합성** (25%): 사용자 기술 수준과 레시피 난이도 매칭
- **카테고리 선호도** (20%): 사용자가 선호하는 제빵 분야
- **재료 유사성** (15%): 보유 재료 및 유사 레시피
- **영양 적합성** (15%): 건강 선호도와 영양 정보 매칭
- **비용 적합성** (10%): 예산 범위와 제조 원가
- **제법 적합성** (10%): 제빵 방법 선호도
- **시간 적합성** (5%): 가용 시간과 제조 시간

### 학습 데이터
- **조회 기록**: 본 레시피 추적
- **상호작용**: 좋아요, 요리함, 저장, 공유
- **평점**: 사용자 평점 기반 선호도
- **건너뛰기**: 관심 없는 레시피 패턴 학습

### 사용법
```javascript
import RecommendationEngine from '@/utils/ai/recommendationEngine'

const engine = new RecommendationEngine()

// 추천 받기
const recommendations = engine.recommendRecipes(recipes, currentRecipe, {
  count: 5,
  recommendationType: 'similar' // general, similar, beginner, budget, healthy
})

// 상호작용 기록
engine.recordInteraction(recipeId, 'like', true)
engine.recordInteraction(recipeId, 'cook', true)
```

## 🎨 UI 컴포넌트

### 영양 정보 패널 (`NutritionPanel.jsx`)
- 기본 영양소 (칼로리, 단백질, 탄수화물, 지방) 표시
- 영양 점수 시각화
- 상세 영양 정보 (식이섬유, 나트륨 등)
- 제빵 특화 분석 (밀가루 구성, 통곡물 비율)
- 일일권장량 대비 퍼센트

### 원가 분석 패널 (`CostPanel.jsx`)
- 총 원가 및 개당 원가 표시
- 원가 구성 비율 (재료비/인건비/간접비)
- 마진별 판매가 옵션
- 재료별 상세 원가
- AI 기반 절감 제안

### AI 추천 패널 (`RecommendationPanel.jsx`)
- 6가지 추천 타입 선택
- 추천 점수 및 이유 표시
- 실시간 상호작용 (좋아요, 클릭)
- 레시피 순위 및 매칭률

### 설정 패널 (`PreferenceSettings.jsx`)
- 사용자 프로필 (기술 수준, 시간, 예산)
- 카테고리별 선호도 (1-5점 평가)
- 영양 선호도 (저당, 고단백 등)
- 보유 재료 체크리스트

## 🚀 배포 및 실행

### 개발 환경
```bash
npm run dev        # 개발 서버 실행
npm run test       # 테스트 실행
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
```

### PWA 기능 활성화
```bash
# Playwright 브라우저 설치 (E2E 테스트용)
npm run e2e:install

# HTTPS 환경에서 테스트 (PWA 기능 완전 활성화)
npm run dev -- --host --https
```

## 🔧 커스터마이징

### 영양 데이터베이스 확장
`src/data/nutrition/ingredientNutrition.js`에서 새로운 재료 추가:

```javascript
'새재료': {
  calories: 350,
  protein: 10.5,
  carbohydrates: 72.0,
  fat: 2.1,
  fiber: 3.2,
  sugar: 1.5,
  sodium: 8,
  cholesterol: 0,
  category: 'flour',
  density: 0.65
}
```

### 가격 데이터베이스 업데이트
`src/data/costing/ingredientPrices.js`에서 가격 정보 수정:

```javascript
updatePrice('강력분', 3800, '온라인마트')
```

### AI 추천 가중치 조정
`src/utils/ai/recommendationEngine.js`의 `similarityWeights` 수정:

```javascript
this.similarityWeights = {
  difficulty: 0.30,    // 난이도 중요도 증가
  category: 0.25,      // 카테고리 중요도 증가
  ingredients: 0.15,
  nutrition: 0.10,
  cost: 0.10,
  method: 0.05,
  time: 0.05
}
```

## 📊 성능 최적화

### 메모이제이션
- React.memo()로 컴포넌트 리렌더링 최적화
- useMemo()로 복잡한 계산 결과 캐싱
- useCallback()로 이벤트 핸들러 최적화

### 지연 로딩
- React.lazy()로 컴포넌트 분할 로딩
- 이미지 레이지 로딩
- AI 계산의 Web Worker 활용

### PWA 캐싱
- 정적 리소스 사전 캐싱
- API 응답 런타임 캐싱
- 이미지 캐싱 정책

## 🛡️ 보안 고려사항

### 데이터 보호
- 사용자 프로필 로컬 저장
- 개인정보 수집 최소화
- 민감한 데이터 암호화

### PWA 보안
- HTTPS 필수
- Content Security Policy 설정
- 서비스 워커 보안 검증

## 🐛 문제 해결

### 일반적인 문제들

1. **PWA 설치 프롬프트가 나타나지 않음**
   - HTTPS 환경에서 테스트
   - 브라우저 DevTools에서 Application > Manifest 확인

2. **영양 계산이 부정확함**
   - `ingredientNutrition.js`에서 재료 정보 확인
   - 단위 변환 로직 검증

3. **AI 추천이 작동하지 않음**
   - 브라우저 LocalStorage 지원 확인
   - 레시피 데이터 형식 검증

4. **테스트 실패**
   - Node.js 버전 확인 (v18+ 권장)
   - 브라우저 권한 설정 확인

### 디버깅 팁
- React DevTools로 컴포넌트 상태 확인
- Network 탭으로 API 호출 모니터링
- Console에서 AI 추천 로그 확인
- PWA Lighthouse 점수 측정

## 📈 향후 확장 계획

1. **클라우드 동기화**: Firebase 또는 AWS 연동
2. **소셜 기능**: 레시피 공유 및 커뮤니티
3. **고급 AI**: 이미지 인식 기반 재료 검출
4. **다국어 지원**: i18n 국제화
5. **음성 안내**: 핸즈프리 요리 가이드

---

이 문서는 제과제빵 레시피 북 Phase 2의 모든 기능과 구현 방법을 상세히 설명합니다. 
추가 질문이나 기술적 지원이 필요한 경우 개발팀에 문의하세요.