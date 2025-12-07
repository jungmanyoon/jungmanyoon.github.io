# 무료 웹 애플리케이션 배포 전략

## 플랫폼 선택: 웹 애플리케이션

### 왜 웹 애플리케이션인가?

1. **접근성**: 설치 없이 브라우저만 있으면 사용 가능
2. **크로스 플랫폼**: PC, 모바일, 태블릿 모두 지원
3. **무료 배포**: 다양한 무료 호스팅 옵션 존재
4. **실시간 업데이트**: 사용자가 항상 최신 버전 사용
5. **공유 용이**: URL만 전달하면 즉시 사용 가능

## 무료 호스팅 옵션

### 1. GitHub Pages (추천)

```yaml
# 장점
- 완전 무료
- 커스텀 도메인 지원
- HTTPS 자동 제공
- 안정적인 서비스

# 제한사항
- 정적 사이트만 가능 (프론트엔드 전용)
- 1GB 저장 공간
- 월 100GB 트래픽

# 적합한 구조
- React/Vue/Svelte 등 SPA
- 모든 계산을 클라이언트에서 처리
- localStorage로 데이터 저장
```

### 2. Netlify

```yaml
# 장점
- 빌드 자동화
- 폼 처리 기능
- 서버리스 함수 지원 (제한적)
- CDN 포함

# 무료 플랜
- 300분/월 빌드 시간
- 100GB/월 대역폭
- 125,000회/월 서버리스 함수 실행
```

### 3. Vercel

```yaml
# 장점
- Next.js 완벽 지원
- 서버리스 API 라우트
- 자동 최적화
- 분석 도구 제공

# 무료 플랜
- 100GB/월 대역폭
- 100,000회/일 서버리스 함수 실행
- 자동 HTTPS
```

### 4. Firebase Hosting

```yaml
# 장점
- Google 인프라
- 실시간 데이터베이스 연동 가능
- 인증 서비스 포함
- 클라우드 함수 지원

# 무료 플랜
- 10GB 저장소
- 360MB/일 전송량
- SSL 인증서 제공
```

## 프론트엔드 전용 아키텍처

### 기술 스택

```javascript
// 추천 스택
const techStack = {
    framework: 'React', // 또는 Vue, Svelte
    styling: 'Tailwind CSS',
    stateManagement: 'Zustand', // 가벼운 상태 관리
    storage: 'localStorage + IndexedDB',
    pwa: 'Workbox', // 오프라인 지원
    bundler: 'Vite', // 빠른 빌드
};
```

### 클라이언트 사이드 데이터 저장

```javascript
// localStorage를 활용한 레시피 저장
class LocalRecipeStorage {
    constructor() {
        this.storageKey = 'recipebook_data';
        this.maxSize = 5 * 1024 * 1024; // 5MB 제한
    }
    
    saveRecipe(recipe) {
        const recipes = this.getAllRecipes();
        recipes.push({
            ...recipe,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            isLocal: true
        });
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(recipes));
            return { success: true };
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                return { 
                    success: false, 
                    error: '저장 공간이 부족합니다. 오래된 레시피를 삭제해주세요.' 
                };
            }
        }
    }
    
    getAllRecipes() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
    
    exportToFile() {
        const recipes = this.getAllRecipes();
        const blob = new Blob([JSON.stringify(recipes, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recipes_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }
    
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const recipes = JSON.parse(e.target.result);
                    localStorage.setItem(this.storageKey, JSON.stringify(recipes));
                    resolve({ success: true, count: recipes.length });
                } catch (error) {
                    reject({ success: false, error: '파일 형식이 올바르지 않습니다.' });
                }
            };
            reader.readAsText(file);
        });
    }
}
```

### IndexedDB for 대용량 데이터

```javascript
// IndexedDB를 활용한 고급 저장소
class IndexedDBStorage {
    constructor() {
        this.dbName = 'RecipeBookDB';
        this.version = 1;
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 레시피 저장소
                if (!db.objectStoreNames.contains('recipes')) {
                    const recipeStore = db.createObjectStore('recipes', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    recipeStore.createIndex('title', 'title', { unique: false });
                    recipeStore.createIndex('category', 'category', { unique: false });
                }
                
                // 사용자 설정 저장소
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                // 커스텀 팬 저장소
                if (!db.objectStoreNames.contains('customPans')) {
                    const panStore = db.createObjectStore('customPans', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    panStore.createIndex('category', 'category', { unique: false });
                }
            };
        });
    }
    
    async saveRecipe(recipe) {
        const transaction = this.db.transaction(['recipes'], 'readwrite');
        const store = transaction.objectStore('recipes');
        
        return new Promise((resolve, reject) => {
            const request = store.add(recipe);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllRecipes() {
        const transaction = this.db.transaction(['recipes'], 'readonly');
        const store = transaction.objectStore('recipes');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
```

## PWA (Progressive Web App) 구현

### 오프라인 지원

```javascript
// service-worker.js
const CACHE_NAME = 'recipebook-v1';
const urlsToCache = [
    '/',
    '/styles/main.css',
    '/scripts/main.js',
    '/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에 있으면 캐시에서 제공
                if (response) {
                    return response;
                }
                // 없으면 네트워크에서 가져오기
                return fetch(event.request);
            })
            .catch(() => {
                // 오프라인일 때
                return caches.match('/offline.html');
            })
    );
});
```

### manifest.json

```json
{
    "name": "레시피북 - 제과제빵 변환기",
    "short_name": "레시피북",
    "description": "무료 제과제빵 레시피 변환 도구",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#8B4513",
    "orientation": "portrait",
    "icons": [
        {
            "src": "/icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icons/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "categories": ["food", "utilities", "education"]
}
```

## 무료 백엔드 대안

### 1. Supabase (무료 PostgreSQL)

```javascript
// 무료 플랜: 500MB 데이터베이스, 2GB 전송량
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);

// 레시피 저장
async function saveRecipeToCloud(recipe) {
    const { data, error } = await supabase
        .from('recipes')
        .insert([recipe]);
    
    return { data, error };
}

// 공개 레시피 조회
async function getPublicRecipes() {
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
    
    return { data, error };
}
```

### 2. Google Sheets as Database

```javascript
// 완전 무료, Google Sheets를 데이터베이스로 활용
class GoogleSheetsDB {
    constructor() {
        this.sheetId = 'YOUR_SHEET_ID';
        this.apiKey = 'YOUR_API_KEY'; // 공개 읽기 전용
    }
    
    async fetchRecipes() {
        const range = 'Recipes!A2:Z1000';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}?key=${this.apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return this.parseSheetData(data.values);
    }
    
    parseSheetData(rows) {
        return rows.map(row => ({
            id: row[0],
            title: row[1],
            ingredients: JSON.parse(row[2]),
            instructions: row[3],
            category: row[4],
            isPublic: row[5] === 'TRUE'
        }));
    }
}
```

## 무료 도메인 옵션

### 1. GitHub Pages 기본 도메인
```
https://[username].github.io/recipe-book
```

### 2. 무료 서브도메인 서비스
```
recipebook.netlify.app
recipebook.vercel.app
recipebook.web.app (Firebase)
```

### 3. 무료 도메인 등록 (1년)
- Freenom (.tk, .ml, .ga, .cf)
- 일부 도메인 등록업체의 프로모션

## 수익 모델 없이 지속 가능성 확보

### 1. 오픈소스 프로젝트
```markdown
## 기여 방법
1. 이슈 등록
2. 풀 리퀘스트
3. 번역 지원
4. 문서 개선
```

### 2. 커뮤니티 운영
- GitHub Discussions 활용
- 무료 Discord 서버
- 사용자 피드백 수집

### 3. 자발적 후원 (선택사항)
```html
<!-- Buy Me a Coffee 버튼 -->
<a href="https://www.buymeacoffee.com/recipebook" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
         alt="Buy Me A Coffee" 
         style="height: 60px !important;width: 217px !important;">
</a>
```

## 배포 자동화 (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 💡 구현 로드맵

### Phase 1: MVP (2주)
1. 기본 레시피 변환 기능
2. localStorage 저장
3. 반응형 UI
4. GitHub Pages 배포

### Phase 2: 기능 확장 (1개월)
1. IndexedDB 통합
2. PWA 기능
3. 레시피 공유 (URL)
4. 다국어 지원

### Phase 3: 커뮤니티 (2개월)
1. 공개 레시피 갤러리
2. 사용자 피드백 시스템
3. 레시피 평가
4. 오픈소스 생태계 구축

## 🔧 개발 시작하기

```bash
# 프로젝트 생성
npm create vite@latest recipe-book -- --template react

# 의존성 설치
cd recipe-book
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 로컬 테스트
npm run preview
```