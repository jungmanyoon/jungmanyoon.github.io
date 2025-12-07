# 공유 및 협업 기능

## 회원 계정 시스템

### 사용자 권한 레벨

| 권한 | 기능 |
|------|------|
| 게스트 | 공개 레시피 보기, 기본 변환 기능 |
| 회원 | 레시피 저장, 북마크, 개인 레시피 관리 |
| 프로 | 무제한 저장, 고급 변환, API 접근 |
| 관리자 | 모든 레시피 관리, 사용자 관리 |

### 프로필 설정

```javascript
const userProfile = {
    preferences: {
        units: 'metric', // metric, imperial
        language: 'ko',
        defaultMethod: 'straight',
        timezone: 'Asia/Seoul'
    },
    
    equipment: [
        'stand_mixer',
        'bread_maker',
        'stone_oven'
    ],
    
    allergyInfo: ['gluten', 'nuts'],
    
    favorites: {
        ingredients: ['bread_flour', 'yeast'],
        methods: ['poolish', 'overnight']
    }
};
```

## 레시피 공유 시스템

### 공유 옵션

```javascript
const sharingOptions = {
    visibility: 'public', // public, private, unlisted
    allowFork: true,      // 다른 사용자가 복사 가능
    allowComments: true,
    allowRatings: true,
    
    shareLinks: {
        direct: 'https://recipebook.com/r/abc123',
        embed: '<iframe src="..."></iframe>',
        qrCode: 'data:image/png;base64,...'
    }
};
```

### 버전 관리

```sql
-- 레시피 포크 추적
CREATE TABLE recipe_forks (
    id SERIAL PRIMARY KEY,
    original_recipe_id INTEGER REFERENCES recipes(id),
    forked_recipe_id INTEGER REFERENCES recipes(id),
    forked_by INTEGER REFERENCES users(id),
    forked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changes_summary TEXT
);

-- 레시피 변경 이력
CREATE TABLE recipe_history (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id),
    version INTEGER NOT NULL,
    changes JSONB,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_note TEXT
);
```

## 협업 기능

### 댓글 시스템

```javascript
const commentSchema = {
    id: String,
    recipeId: String,
    userId: String,
    content: String,
    rating: Number, // 1-5
    
    helpfulVotes: Number,
    
    images: [{
        url: String,
        caption: String
    }],
    
    // 실제 베이킹 결과
    bakingResult: {
        success: Boolean,
        modifications: String,
        tips: String
    },
    
    createdAt: Date,
    updatedAt: Date
};
```

### 실시간 협업

```javascript
// Socket.io를 이용한 실시간 편집
io.on('connection', (socket) => {
    socket.on('join-recipe', (recipeId) => {
        socket.join(`recipe:${recipeId}`);
        
        // 현재 편집 중인 사용자 목록 전송
        const activeUsers = getActiveUsers(recipeId);
        socket.emit('active-users', activeUsers);
    });
    
    socket.on('recipe-change', (data) => {
        // 변경 사항 검증
        if (validateChange(data)) {
            // 다른 사용자에게 전파
            socket.to(`recipe:${data.recipeId}`).emit('recipe-updated', data);
            
            // 변경 사항 저장
            saveChange(data);
        }
    });
});
```

## 커뮤니티 기능

### 레시피 컬렉션

```javascript
const collectionSchema = {
    id: String,
    name: String,
    description: String,
    curator: User,
    
    recipes: [{
        recipe: Recipe,
        addedAt: Date,
        note: String
    }],
    
    followers: Number,
    
    tags: [String],
    
    visibility: String, // public, private
    
    createdAt: Date,
    updatedAt: Date
};
```

### 챌린지/이벤트

```javascript
const challengeSchema = {
    id: String,
    title: String,
    description: String,
    
    rules: {
        startDate: Date,
        endDate: Date,
        baseRecipe: Recipe,
        allowedModifications: [String],
        judgingCriteria: [String]
    },
    
    submissions: [{
        user: User,
        recipe: Recipe,
        photos: [String],
        story: String,
        votes: Number
    }],
    
    prizes: [{
        rank: Number,
        description: String
    }]
};
```

## 소셜 미디어 연동

### 공유 카드 생성

```javascript
// Open Graph 메타데이터 생성
function generateOGTags(recipe) {
    return {
        'og:title': recipe.title,
        'og:description': `${recipe.servings}인분 | ${recipe.totalTime}분`,
        'og:image': recipe.thumbnailUrl,
        'og:url': `https://recipebook.com/r/${recipe.slug}`,
        'og:type': 'article',
        
        'twitter:card': 'summary_large_image',
        'twitter:title': recipe.title,
        'twitter:description': recipe.description,
        'twitter:image': recipe.thumbnailUrl
    };
}
```

### 소셜 로그인

```javascript
// OAuth 2.0 통합
const socialAuthProviders = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        scope: ['email', 'profile']
    },
    
    kakao: {
        clientId: process.env.KAKAO_CLIENT_ID,
        redirectUri: '/auth/kakao/callback'
    },
    
    naver: {
        clientId: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET
    }
};
```

## 알림 시스템

### 알림 유형

```javascript
const notificationTypes = {
    RECIPE_COMMENTED: '레시피에 새 댓글',
    RECIPE_RATED: '레시피가 평가됨',
    RECIPE_FORKED: '레시피가 포크됨',
    FOLLOWER_NEW: '새 팔로워',
    CHALLENGE_INVITE: '챌린지 초대',
    SYSTEM_UPDATE: '시스템 업데이트'
};

// 알림 전송
async function sendNotification(userId, type, data) {
    const user = await getUserPreferences(userId);
    
    // 인앱 알림
    await saveNotification(userId, type, data);
    
    // 이메일 알림
    if (user.emailNotifications[type]) {
        await sendEmail(user.email, type, data);
    }
    
    // 푸시 알림
    if (user.pushToken && user.pushNotifications[type]) {
        await sendPush(user.pushToken, type, data);
    }
}
```

## API 공개

### 공개 API 엔드포인트

```yaml
openapi: 3.0.0
info:
  title: RecipeBook API
  version: 1.0.0
  
paths:
  /api/public/recipes:
    get:
      summary: 공개 레시피 목록
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: method
          in: query
          schema:
            type: string
            enum: [straight, poolish, overnight]
      responses:
        200:
          description: 레시피 목록
          
  /api/public/convert:
    post:
      summary: 레시피 변환
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                recipe:
                  $ref: '#/components/schemas/Recipe'
                method:
                  type: string
                options:
                  type: object
```

### 임베드 위젯

```html
<!-- 레시피 임베드 코드 -->
<div id="recipebook-widget" 
     data-recipe-id="abc123"
     data-show-conversion="true"
     data-theme="light">
</div>
<script src="https://recipebook.com/widget.js"></script>
```

## 다국어 지원

### i18n 구조

```javascript
// locales/ko.json
{
    "recipe": {
        "title": "레시피 제목",
        "ingredients": "재료",
        "instructions": "만드는 방법",
        "servings": "인분",
        "time": {
            "prep": "준비 시간",
            "bake": "굽기 시간",
            "total": "총 시간"
        }
    },
    
    "methods": {
        "straight": "스트레이트법",
        "poolish": "폴리쉬법",
        "overnight": "저온숙성법"
    },
    
    "units": {
        "g": "그램",
        "ml": "밀리리터",
        "cup": "컵",
        "tbsp": "큰술",
        "tsp": "작은술"
    }
}
```

### 재료명 매핑

```sql
CREATE TABLE ingredient_translations (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER REFERENCES ingredients(id),
    language_code VARCHAR(5),
    name VARCHAR(255),
    description TEXT,
    UNIQUE(ingredient_id, language_code)
);

-- 예시 데이터
INSERT INTO ingredient_translations VALUES
    (1, 'ko', '강력분', '단백질 함량이 높은 밀가루'),
    (1, 'en', 'Bread Flour', 'High-protein wheat flour'),
    (1, 'ja', '強力粉', 'タンパク質含有量の高い小麦粉');
```

## 💡 커뮤니티 활성화 전략

### 게이미피케이션

- **레벨 시스템**: 레시피 작성, 평가, 공유로 경험치 획득
- **뱃지**: 특정 성취 달성 시 뱃지 부여
- **리더보드**: 주간/월간 최고 기여자

### 큐레이션

- **에디터 추천**: 전문가가 선정한 레시피
- **이달의 레시피**: 커뮤니티 투표로 선정
- **테마 컬렉션**: 계절별, 행사별 레시피 모음

## 🔧 구현 시 고려사항

1. **개인정보 보호**: GDPR, KISA 가이드라인 준수
2. **콘텐츠 모더레이션**: 부적절한 콘텐츠 필터링
3. **저작권 관리**: 레시피 원작자 표시
4. **스팸 방지**: Rate limiting, CAPTCHA