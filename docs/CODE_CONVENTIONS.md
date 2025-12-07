# 레시피북 프로젝트 코드 작성 규칙 및 컨벤션

## 🎯 프로젝트 핵심 원칙

1. **무료 웹 애플리케이션**: 모든 기능은 무료로 제공되어야 함
2. **클라이언트 중심**: 가능한 모든 계산은 브라우저에서 처리
3. **오프라인 우선**: 인터넷 연결 없이도 핵심 기능 사용 가능
4. **접근성**: 모든 사용자가 쉽게 사용할 수 있도록 설계

## 📁 프로젝트 구조

### 파일 관리 엄격 규칙

```bash
# ⚠️ 파일 생성 전 반드시 확인
1. 같은 목적의 파일이 이미 있는가?
2. 기존 파일을 수정해서 해결 가능한가?
3. 정말 새 파일이 필요한가?

# ❌ 절대 금지 패턴
test.js → test2.js → test_final.js → test_final2.js
run.bat → run_new.bat → run_latest.bat → run_v2.bat
index.html → index2.html → index_backup.html

# ✅ 올바른 방법
1. 하나의 테스트 파일: test.spec.js (계속 수정)
2. 하나의 실행 파일: run.bat (내용만 업데이트)
3. 하나의 진입점: index.html (버전 관리는 Git으로)

# 임시 파일 규칙
- 생성: 반드시 .tmp 확장자 사용
- 사용: 목적 달성 즉시
- 삭제: 사용 완료 후 바로 삭제
```

### 표준 프로젝트 구조

```
recipe-book/
├── src/
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── common/       # 공통 UI 컴포넌트
│   │   ├── recipe/       # 레시피 관련 컴포넌트
│   │   └── pan/          # 팬 관련 컴포넌트
│   ├── hooks/            # 커스텀 React 훅
│   ├── utils/            # 유틸리티 함수
│   │   ├── calculations/ # 레시피 계산 로직
│   │   ├── storage/      # 저장소 관련
│   │   └── conversions/  # 변환 알고리즘
│   ├── constants/        # 상수 정의
│   ├── types/            # TypeScript 타입 정의
│   └── styles/           # 글로벌 스타일
├── public/               # 정적 파일
└── docs/                 # 프로젝트 문서
```

## 💻 코딩 스타일 가이드

### JavaScript/TypeScript

```javascript
// ✅ 좋은 예: 명확한 함수명과 주석
/**
 * 베이커스 퍼센트를 기반으로 재료량 계산
 * @param {number} flourWeight - 밀가루 총량 (g)
 * @param {number} percentage - 베이커스 퍼센트
 * @returns {number} 계산된 재료량 (g)
 */
function calculateIngredientWeight(flourWeight, percentage) {
    return Math.round(flourWeight * percentage / 100 * 10) / 10;
}

// ❌ 나쁜 예: 불명확한 이름
function calc(f, p) {
    return f * p / 100;
}
```

### 명명 규칙

```javascript
// 컴포넌트: PascalCase
const RecipeConverter = () => { };

// 함수: camelCase, 동사로 시작
const convertToPoolish = () => { };

// 상수: UPPER_SNAKE_CASE
const MAGIC_NUMBER_WHITE_BREAD = 1.78;

// 타입/인터페이스: PascalCase, I 접두사 금지
interface Recipe {
    id: string;
    title: string;
}

// 파일명
// 컴포넌트: RecipeConverter.jsx
// 유틸리티: calculateDoughWeight.js
// 상수: panCategories.js
```

### 에러 처리

```javascript
// 항상 사용자 친화적인 에러 메시지 제공
try {
    const result = await saveRecipe(recipe);
    showToast('레시피가 저장되었습니다', 'success');
} catch (error) {
    console.error('Recipe save error:', error);
    showToast('저장 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
}
```

## 🧮 레시피 계산 규칙

### 1. 정밀도 규칙

```javascript
// 재료량 반올림 규칙
function roundIngredientAmount(amount) {
    if (amount >= 100) {
        return Math.round(amount); // 100g 이상: 정수
    } else if (amount >= 10) {
        return Math.round(amount * 10) / 10; // 10-100g: 소수점 1자리
    } else {
        return Math.round(amount * 100) / 100; // 10g 미만: 소수점 2자리
    }
}
```

### 2. 베이커스 퍼센트 항상 유지

```javascript
// 레시피 변환 시 베이커스 퍼센트 보존
const convertedRecipe = {
    ...originalRecipe,
    ingredients: originalRecipe.ingredients.map(ing => ({
        ...ing,
        amount: calculateNewAmount(ing.bakerPercentage, newFlourTotal),
        bakerPercentage: ing.bakerPercentage // 퍼센트는 변경하지 않음
    }))
};
```

### 3. 사용자 설정 우선

```javascript
// 항상 사용자 커스텀 설정 확인
const getMagicNumber = (breadType) => {
    const userSetting = getUserSettings().magicNumbers?.[breadType];
    return userSetting?.value || DEFAULT_MAGIC_NUMBERS[breadType];
};
```

## 📱 UI/UX 규칙

### 1. 반응형 디자인 필수

```css
/* 모바일 우선 설계 */
.recipe-card {
    padding: 1rem;
    margin: 0.5rem;
}

@media (min-width: 768px) {
    .recipe-card {
        padding: 2rem;
        margin: 1rem;
    }
}
```

### 2. 즉각적인 피드백

```javascript
// 모든 사용자 액션에 즉각적인 반응
const handleIngredientChange = (id, value) => {
    // 1. 즉시 UI 업데이트
    setIngredients(prev => updateIngredient(prev, id, value));
    
    // 2. 디바운싱으로 계산 최적화
    debounce(() => {
        recalculateRecipe();
    }, 300);
};
```

### 3. 오류 방지

```javascript
// 입력값 검증 및 자동 수정
const validatePanVolume = (volume) => {
    const MIN_VOLUME = 100;  // 100ml
    const MAX_VOLUME = 10000; // 10L
    
    if (volume < MIN_VOLUME) {
        showWarning(`최소 부피는 ${MIN_VOLUME}ml입니다`);
        return MIN_VOLUME;
    }
    if (volume > MAX_VOLUME) {
        showWarning(`최대 부피는 ${MAX_VOLUME}ml입니다`);
        return MAX_VOLUME;
    }
    return volume;
};
```

## 💾 데이터 저장 규칙

### 1. localStorage 크기 관리

```javascript
// 저장 전 크기 확인
const checkStorageSpace = () => {
    const used = new Blob(Object.values(localStorage)).size;
    const estimatedMax = 5 * 1024 * 1024; // 5MB
    
    if (used > estimatedMax * 0.8) {
        showWarning('저장 공간이 부족합니다. 오래된 레시피를 정리해주세요.');
        return false;
    }
    return true;
};
```

### 2. 자동 백업

```javascript
// 중요 데이터 변경 시 자동 백업
const autoBackup = debounce(() => {
    const backup = {
        recipes: getAllRecipes(),
        settings: getUserSettings(),
        customPans: getCustomPans(),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('recipebook_backup', JSON.stringify(backup));
}, 5000);
```

### 3. 데이터 마이그레이션

```javascript
// 버전 업데이트 시 데이터 구조 변경 처리
const migrateData = () => {
    const version = localStorage.getItem('app_version') || '1.0.0';
    
    if (version < '2.0.0') {
        // v1 -> v2 마이그레이션
        const oldData = localStorage.getItem('recipes');
        if (oldData) {
            const migrated = migrateV1ToV2(JSON.parse(oldData));
            localStorage.setItem('recipes', JSON.stringify(migrated));
        }
    }
    
    localStorage.setItem('app_version', CURRENT_VERSION);
};
```

## 🌐 환경별 처리

### 1. 온도 계산 시 얼음 고려

```javascript
// 항상 얼음 사용 가능성 체크
const calculateWaterTemperature = (ddt, environment) => {
    const requiredTemp = calculateRequiredWaterTemp(ddt, environment);
    
    if (requiredTemp < 4) {
        // 자동으로 얼음 계산 포함
        return {
            useIce: true,
            iceRatio: calculateIceRatio(requiredTemp, environment.tapWaterTemp),
            instructions: generateIceInstructions()
        };
    }
    
    return { useIce: false, waterTemp: requiredTemp };
};
```

### 2. 계절/지역 자동 감지

```javascript
// 사용자 위치 기반 환경 설정 제안
const suggestEnvironmentSettings = async () => {
    try {
        const location = await getUserLocation();
        const weather = await getWeatherData(location);
        
        return {
            temperature: weather.temp,
            humidity: weather.humidity,
            altitude: location.altitude,
            season: getCurrentSeason(location.latitude)
        };
    } catch {
        // 실패 시 기본값 사용
        return DEFAULT_ENVIRONMENT;
    }
};
```

## 🔒 보안 및 프라이버시

### 1. 민감 정보 처리 금지

```javascript
// ❌ 절대 하지 말 것
// - 비밀번호 평문 저장
// - 개인 식별 정보 수집
// - 제3자 추적 스크립트

// ✅ 해야 할 것
// - 모든 데이터 로컬 저장
// - 선택적 클라우드 동기화
// - 명시적 동의 후 데이터 공유
```

### 2. XSS 방지

```javascript
// 사용자 입력 항상 검증
const sanitizeInput = (input) => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};
```

## 📊 성능 최적화 규칙

### 1. 레이지 로딩

```javascript
// 큰 컴포넌트는 필요할 때만 로드
const RecipeAnalytics = lazy(() => import('./components/RecipeAnalytics'));

// 사용 시
<Suspense fallback={<LoadingSpinner />}>
    <RecipeAnalytics />
</Suspense>
```

### 2. 메모이제이션

```javascript
// 무거운 계산은 메모이제이션
const convertedRecipe = useMemo(() => {
    return convertRecipeToMethod(recipe, method, options);
}, [recipe, method, options]);

// 컴포넌트도 필요시 메모
const RecipeCard = memo(({ recipe, onClick }) => {
    // ...
});
```

### 3. 디바운싱/쓰로틀링

```javascript
// 검색은 디바운싱
const searchRecipes = debounce((query) => {
    performSearch(query);
}, 300);

// 스크롤 이벤트는 쓰로틀링
const handleScroll = throttle(() => {
    updateScrollPosition();
}, 100);
```

## 🧪 테스트 규칙

### 1. 핵심 계산 로직 필수 테스트

```javascript
// 모든 변환 함수는 테스트 필수
describe('poolish conversion', () => {
    it('should calculate correct flour ratio', () => {
        const result = convertToPoolish(baseRecipe, { ratio: 25 });
        expect(result.preferment.flour).toBe(125); // 500g * 0.25
    });
});
```

### 2. 엣지 케이스 처리

```javascript
// 극단적인 값 테스트
it('should handle zero flour amount', () => {
    expect(() => calculateBakerPercentage(0, 100)).toThrow();
});

it('should handle very large amounts', () => {
    const result = scaleRecipe(recipe, 1000);
    expect(result).toBeDefined();
    expect(result.totalWeight).toBeLessThan(Number.MAX_SAFE_INTEGER);
});
```

## 📝 문서화 규칙

### 1. 모든 공개 함수 JSDoc

```javascript
/**
 * 레시피를 지정된 팬 크기에 맞게 조정
 * @param {Recipe} recipe - 원본 레시피
 * @param {string} panId - 팬 ID
 * @param {number} quantity - 팬 개수
 * @returns {ScaledRecipe} 조정된 레시피
 * @throws {Error} 팬을 찾을 수 없을 때
 * @example
 * const scaled = scaleRecipeForPan(recipe, 'loaf_1pound', 2);
 */
```

### 2. 복잡한 로직 설명

```javascript
// 매직넘버 계산 설명
// 팬 부피를 반죽 무게로 나누어 최적 비율 산출
// 1.78은 일반 식빵의 경험적 수치
// 사용자가 이 값을 조정하면 더 꽉 찬/여유있는 빵 가능
const magicNumber = userSettings.magicNumber || 1.78;
```

## 🧹 파일 정리 및 유지보수

### 정기 정리 작업

```javascript
// scripts/cleanup.js
const fs = require('fs');
const path = require('path');

const CLEANUP_RULES = {
    // 삭제할 파일 패턴
    deletePatterns: [
        /test\d+\.js$/,      // test1.js, test2.js 등
        /\.tmp$/,            // 모든 .tmp 파일
        /\.bak$/,            // 백업 파일
        /_old\./,            // _old가 포함된 파일
        /_backup\./,         // _backup이 포함된 파일
        /Copy of/            // "Copy of"로 시작하는 파일
    ],
    
    // 정리할 디렉토리
    cleanDirs: ['./temp', './tmp', './backup'],
    
    // 오래된 로그 파일 (7일)
    oldLogs: {
        pattern: /\.log$/,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

function cleanup() {
    console.log('🧹 프로젝트 정리 시작...');
    
    // 패턴에 맞는 파일 삭제
    CLEANUP_RULES.deletePatterns.forEach(pattern => {
        deleteFilesByPattern('.', pattern);
    });
    
    // 오래된 로그 삭제
    deleteOldFiles('.', CLEANUP_RULES.oldLogs.pattern, CLEANUP_RULES.oldLogs.maxAge);
    
    // 빈 디렉토리 제거
    removeEmptyDirs('.');
    
    console.log('✅ 정리 완료!');
}

// package.json에 추가
"scripts": {
    "cleanup": "node scripts/cleanup.js",
    "build": "npm run cleanup && vite build"
}
```

### Git 관리 규칙

```bash
# .gitignore에 반드시 추가
*.tmp
*.bak
*_old.*
*_backup.*
*.log
.DS_Store
Thumbs.db
test[0-9].*
*Copy of*

# Git 커밋 전 확인
git status --porcelain | grep -E "(test[0-9]|\.tmp|\.bak)" && echo "⚠️ 임시 파일을 먼저 정리하세요!"
```

## 🚀 배포 체크리스트

```markdown
배포 전 필수 확인사항:
- [ ] 임시 파일 모두 삭제 (npm run cleanup)
- [ ] 불필요한 파일 정리 완료
- [ ] 모든 console.log 제거
- [ ] 에러 처리 확인
- [ ] 모바일 테스트 완료
- [ ] 오프라인 모드 테스트
- [ ] 번들 크기 < 500KB
- [ ] Lighthouse 점수 > 90
- [ ] 브라우저 호환성 (Chrome, Safari, Firefox, Edge)
- [ ] 한국어/영어 텍스트 검토
```

---

**이 규칙은 프로젝트의 일관성과 품질을 위한 최소 요구사항입니다. 모든 코드는 이 규칙을 따라야 하며, 예외사항은 명확한 이유와 함께 문서화되어야 합니다.**