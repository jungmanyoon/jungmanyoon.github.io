# 최적화된 웹 애플리케이션 UI/UX 설계

## 플랫폼: 무료 웹 애플리케이션

txt 파일의 분석 결과에 따라, 이 시스템은 **무료 웹 애플리케이션**으로 구현됩니다:
- PC와 스마트폰 브라우저에서 모두 사용 가능
- 설치 없이 링크만 클릭하면 즉시 사용
- 블로그나 카페 등에 쉽게 공유 가능

## 레시피 입력 인터페이스

### 스마트 재료 입력 시스템

#### AI 기반 자동완성
- 재료명 예측 및 제안
- 자주 사용하는 재료 우선 표시
- 오타 자동 수정

#### 바코드 스캔
- 모바일 카메라로 제품 바코드 스캔
- 자동으로 재료 정보 입력
- 브랜드별 재료 데이터베이스 연동

#### 음성 인식
- 핸즈프리 입력 지원
- "강력분 500그램 추가" 같은 자연어 인식
- 다국어 지원

### 단계별 안내 시스템

#### 프로그레시브 디스클로저
```
[기본 정보] → [재료 입력] → [제법 선택] → [상세 옵션]
```

#### 인라인 도움말
- 각 입력 필드별 툴팁
- 이미지/동영상 가이드
- 실시간 유효성 검사

#### 타이머 연동
- 각 단계별 타이머 자동 설정
- 알림 기능
- 백그라운드 실행 지원

## 변환 인터페이스 설계

### 시각적 피드백 시스템

```
┌─────────────────────────────────────┐
│ 원본 인분: [4] → 변경 인분: [6] [+][-] │
│ 변환 배수: 1.5x                      │
└─────────────────────────────────────┘

재료 목록:
┌────────────────────────────────────┐
│ ✓ 밀가루    750g (←500g) ↑50%     │
│ ✓ 물        450g (←300g) ↑50%     │
│ ✓ 이스트    9g   (←6g)   ↑50%     │
│ ✓ 소금      15g  (←10g)  ↑50%     │
└────────────────────────────────────┘

[변경 적용] [초기화] [새 레시피로 저장]
```

### 색상 코딩
- 🟢 녹색: 증가한 재료
- 🔴 빨간색: 감소한 재료
- 🟡 노란색: 주의가 필요한 변경
- 🔵 파란색: 변경 없음

### 실시간 계산
- 슬라이더 조작 시 즉시 반영
- 애니메이션 효과로 변화 강조
- 되돌리기(Undo) 기능

## 모바일 최적화

### 반응형 브레이크포인트

```css
/* 모바일 (320-768px) */
@media (max-width: 768px) {
    /* 단일 열, 스택형 레이아웃 */
    .recipe-container { 
        flex-direction: column; 
    }
}

/* 태블릿 (768-1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
    /* 2열 구성, 플로팅 액션 버튼 */
    .recipe-container { 
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}

/* 데스크톱 (1024px+) */
@media (min-width: 1024px) {
    /* 다중 열, 고급 필터링 패널 */
    .sidebar { 
        display: block; 
    }
}
```

### 터치 최적화
- **최소 터치 타겟**: 44px × 44px
- **엄지 도달 영역**: 하단 2/3 영역에 주요 기능
- **스와이프 제스처**: 
  - 좌우: 레시피 단계 이동
  - 상하: 스크롤
  - 길게 누르기: 상세 옵션

## 고급 UI 컴포넌트

### 제법 선택 카드

```html
<div class="method-card">
    <div class="method-icon">🌙</div>
    <h3>저온숙성법</h3>
    <p>12-24시간 냉장 발효</p>
    <div class="benefits">
        <span class="tag">풍미 증진</span>
        <span class="tag">부드러운 질감</span>
    </div>
</div>
```

### 팬 크기 비주얼라이저

```javascript
// Canvas나 SVG로 팬 크기 시각화
function drawPan(width, height, depth) {
    const canvas = document.getElementById('pan-visual');
    const ctx = canvas.getContext('2d');
    
    // 3D 효과로 팬 그리기
    // 현재 반죽량 표시
    // 권장 수준 라인 표시
}
```

### 인터랙티브 타임라인

```
발효 과정 타임라인:
━━━●━━━━━━━━━━━━━━━━━━━━━━━━━
30분 경과 / 총 2시간

[일시정지] [알림 설정] [단계 건너뛰기]
```

## 접근성 (Accessibility)

### WCAG 2.1 준수
- 키보드 네비게이션 완벽 지원
- 스크린 리더 호환
- 고대비 모드
- 텍스트 크기 조절

### ARIA 레이블
```html
<button 
    aria-label="레시피를 6인분으로 변경"
    aria-pressed="false"
    role="button">
    6인분
</button>
```

## 다크 모드 지원

```css
/* 라이트 모드 */
:root {
    --bg-primary: #ffffff;
    --text-primary: #333333;
    --accent: #007bff;
}

/* 다크 모드 */
[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
    --accent: #4dabf7;
}
```

## 성능 최적화

### 지연 로딩 (Lazy Loading)
- 이미지는 뷰포트 진입 시 로드
- 복잡한 컴포넌트는 필요 시 로드
- 코드 스플리팅으로 초기 로드 최소화

### 상태 관리
```javascript
// React 예시
const RecipeContext = React.createContext();

function RecipeProvider({ children }) {
    const [recipe, setRecipe] = useState(initialRecipe);
    const [convertedRecipe, setConvertedRecipe] = useState(null);
    
    // 메모이제이션으로 불필요한 재계산 방지
    const totalWeight = useMemo(() => 
        calculateTotalWeight(recipe), 
        [recipe]
    );
    
    return (
        <RecipeContext.Provider value={{ 
            recipe, 
            convertedRecipe, 
            totalWeight 
        }}>
            {children}
        </RecipeContext.Provider>
    );
}
```

## 사용자 피드백

### 토스트 알림
```javascript
showToast({
    type: 'success',
    message: '레시피가 성공적으로 변환되었습니다',
    duration: 3000,
    position: 'bottom-center'
});
```

### 진행 상태 표시
- 로딩 스피너
- 진행률 바
- 스켈레톤 스크린

### 에러 처리
```javascript
try {
    const converted = await convertRecipe(recipe, options);
} catch (error) {
    showError({
        title: '변환 실패',
        message: '올바른 값을 입력해주세요',
        actions: [
            { label: '다시 시도', handler: retry },
            { label: '취소', handler: cancel }
        ]
    });
}
```

## 💡 UX 개선 팁

### 온보딩
- 첫 사용자를 위한 투어
- 샘플 레시피로 연습
- 단계별 성취 뱃지

### 개인화
- 자주 사용하는 제법 저장
- 선호 단위 설정
- 최근 레시피 기록

### 소셜 기능
- 레시피 공유 버튼
- QR 코드 생성
- 소셜 미디어 카드 미리보기

## 🔧 구현 기술 스택 추천

### 프론트엔드
- **React/Vue/Svelte**: 반응형 UI
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Framer Motion**: 애니메이션
- **PWA**: 오프라인 지원

### 상태 관리
- **Zustand/Pinia**: 간단한 상태 관리
- **React Query**: 서버 상태 관리
- **IndexedDB**: 로컬 저장소