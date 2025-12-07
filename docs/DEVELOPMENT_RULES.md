# 개발 시 필수 준수 사항

## 🔴 코드 작성 전 반드시 확인

### 1. 프로젝트 기본 정보
- **타입**: 무료 웹 애플리케이션
- **플랫폼**: 브라우저 기반 (설치 불필요)
- **사용자**: 모든 사용자 무료 이용
- **데이터**: 클라이언트 사이드 저장 (localStorage/IndexedDB)

### 2. 필수 체크 사항
```javascript
// 모든 코드 작성 시 이 규칙을 먼저 확인
const MUST_CHECK = {
    isFree: true,              // 무료 기능만
    isWebBased: true,          // 웹 전용
    isClientSide: true,        // 클라이언트 처리
    needsInstall: false,       // 설치 불필요
    requiresBackend: false,    // 백엔드 선택사항
};
```

## 📋 코드 작성 순서

### 1단계: 기능 정의
```javascript
// 새 기능 추가 시 먼저 정의
const newFeature = {
    name: '기능명',
    description: '설명',
    isFree: true,  // 필수 확인
    complexity: 'low|medium|high',
    dependencies: []
};
```

### 2단계: 데이터 구조 설계
```javascript
// 로컬 저장소에 맞는 구조 설계
const dataStructure = {
    version: '1.0.0',
    maxSize: '5MB',
    schema: {
        // 간단하고 효율적인 구조
    }
};
```

### 3단계: UI 먼저 구현
```javascript
// UI -> 로직 순서로 개발
// 1. 컴포넌트 생성
// 2. 스타일 적용
// 3. 로직 연결
// 4. 테스트
```

## 🚫 절대 하지 말아야 할 것

### 0. 파일 관리 금지사항
```javascript
// ❌ 금지: 불필요한 파일 생성
test1.js
test2.js
test_final.js
test_final_final.js
test_real_final.js

// ❌ 금지: 임시 파일 난립
run.bat
run2.bat
run_new.bat
run_latest.bat

// ✅ 허용: 하나의 파일을 계속 수정
test.js      // 기존 파일 재사용
run.bat      // 기존 파일 수정
index.html   // 기존 파일 업데이트
```

### 파일 관리 원칙
```bash
# 1. 기존 파일 최대한 활용
# 2. 새 파일은 명확한 목적이 있을 때만
# 3. 임시 파일은 사용 후 즉시 삭제
# 4. 버전 관리는 Git으로 (파일명 변경 X)

# 임시 파일 정리 스크립트
# cleanup.sh
#!/bin/bash
rm -f test*.js
rm -f *.tmp
rm -f *.bak
find . -name "*.log" -mtime +7 -delete
```

### 1. 유료 서비스 의존
```javascript
// ❌ 금지
import PaidAPI from 'paid-service';
const data = await PaidAPI.fetch();

// ✅ 허용
const data = localStorage.getItem('recipes');
```

### 2. 필수 백엔드 요구
```javascript
// ❌ 금지
if (!backendUrl) {
    throw new Error('백엔드 필수');
}

// ✅ 허용
const backendUrl = config.backendUrl || null;
if (backendUrl) {
    // 선택적 백엔드 기능
}
```

### 3. 복잡한 설치 과정
```javascript
// ❌ 금지
// "먼저 Node.js를 설치하고..."
// "Docker를 실행하고..."

// ✅ 허용
// "브라우저에서 URL을 열기만 하면 됩니다"
```

## ✅ 항상 해야 할 것

### 1. 오프라인 우선 설계
```javascript
// 네트워크 체크 후 로컬 폴백
const loadData = async () => {
    try {
        if (navigator.onLine && config.syncEnabled) {
            return await fetchFromCloud();
        }
    } catch (error) {
        console.log('온라인 동기화 실패, 로컬 데이터 사용');
    }
    return loadFromLocal();
};
```

### 2. 모바일 반응형
```javascript
// 모든 컴포넌트는 모바일 우선
const Component = styled.div`
    padding: 1rem;  /* 모바일 기본 */
    
    @media (min-width: 768px) {
        padding: 2rem;  /* 데스크톱 확장 */
    }
`;
```

### 3. 사용자 친화적 에러
```javascript
// 기술적 에러 -> 사용자 메시지
catch (error) {
    if (error.code === 'QUOTA_EXCEEDED') {
        showToast('저장 공간이 부족합니다. 오래된 레시피를 삭제해주세요.');
    } else {
        showToast('일시적인 오류가 발생했습니다. 다시 시도해주세요.');
    }
}
```

## 🔧 환경별 설정

### 개발 환경
```javascript
// .env.development
VITE_APP_MODE=development
VITE_APP_DEBUG=true
VITE_APP_API_URL=http://localhost:3000  // 선택사항
```

### 프로덕션 환경
```javascript
// .env.production
VITE_APP_MODE=production
VITE_APP_DEBUG=false
VITE_APP_API_URL=  // 비워둠 (선택사항)
```

## 📱 플랫폼별 고려사항

### iOS Safari
```javascript
// iOS 특수 처리
if (isIOS()) {
    // 100vh 버그 수정
    document.documentElement.style.setProperty(
        '--vh', 
        `${window.innerHeight * 0.01}px`
    );
}
```

### 구형 브라우저
```javascript
// 폴리필 적용
if (!window.Promise) {
    // Promise 폴리필 로드
}

// 또는 기능 감지
if ('serviceWorker' in navigator) {
    // PWA 기능 활성화
}
```

## 💡 성능 기준

### 목표 지표
```javascript
const PERFORMANCE_TARGETS = {
    firstPaint: '<1s',
    interactive: '<3s',
    bundleSize: '<500KB',
    lighthouse: '>90',
    offlineReady: true
};
```

### 최적화 필수
```javascript
// 큰 라이브러리 대신 경량 대안 사용
// ❌ moment.js (70KB)
// ✅ dayjs (7KB)

// 이미지 최적화
// ❌ PNG 원본 (500KB)
// ✅ WebP 압축 (50KB)
```

## 🎨 UI 일관성

### 색상 팔레트
```javascript
const colors = {
    primary: '#8B4513',    // 갈색 (제빵 테마)
    secondary: '#D2691E',  // 초콜릿
    success: '#228B22',    // 녹색
    error: '#DC143C',      // 빨강
    background: '#FFF8DC', // 크림색
};
```

### 컴포넌트 패턴
```javascript
// 모든 입력 컴포넌트는 동일한 패턴
const Input = ({ label, value, onChange, error, ...props }) => (
    <div className="input-group">
        <label>{label}</label>
        <input value={value} onChange={onChange} {...props} />
        {error && <span className="error">{error}</span>}
    </div>
);
```

## 📝 주석 규칙

### 필수 주석
```javascript
// TODO: 구현 예정 기능
// FIXME: 수정 필요한 버그
// HACK: 임시 해결책 (이유 설명)
// NOTE: 중요한 비즈니스 로직 설명
```

### 복잡한 계산 설명
```javascript
// 매직넘버 1.78 설명:
// 일반 식빵의 팬 부피 대비 반죽 무게 비율
// 경험적으로 도출된 값으로, 사용자가 조정 가능
const MAGIC_NUMBER_WHITE_BREAD = 1.78;
```

## 🔄 Git 커밋 규칙

### 커밋 메시지 형식
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정
```

### 예시
```bash
git commit -m "feat: 폴리쉬법 변환 기능 추가"
git commit -m "fix: 모바일에서 팬 선택 버그 수정"
git commit -m "docs: 얼음 계산 설명 추가"
```

---

**⚠️ 중요: 이 파일은 모든 개발 세션 시작 시 확인해야 합니다. 
컴퓨터 재부팅 후에도 이 규칙대로 코드를 작성해야 합니다.**