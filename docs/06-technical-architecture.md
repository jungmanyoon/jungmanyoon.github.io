# 견고한 기술 스택과 아키텍처

## 데이터베이스 설계

### 하이브리드 접근법 (PostgreSQL + JSONB)

#### 핵심 테이블 구조

```sql
-- 사용자 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 레시피 메인 테이블
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    servings INTEGER DEFAULT 1,
    prep_time INTEGER, -- 분 단위
    bake_time INTEGER, -- 분 단위
    total_weight DECIMAL(10,2),
    created_by INTEGER REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 재료 마스터 테이블
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(100),
    density DECIMAL(10,4), -- g/ml 변환용
    base_unit VARCHAR(20) DEFAULT 'g',
    allergens TEXT[],
    substitutes INTEGER[], -- 대체 가능 재료 ID 배열
    properties JSONB
);

-- 레시피-재료 관계 테이블
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id),
    amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'g',
    baker_percentage DECIMAL(10,2),
    step_number INTEGER DEFAULT 1,
    is_optional BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(recipe_id, ingredient_id, step_number)
);

-- 인덱스 생성
CREATE INDEX idx_recipes_created_by ON recipes(created_by);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_recipes_metadata ON recipes USING GIN (metadata);
```

### NoSQL 대안 (MongoDB)

```javascript
// 레시피 문서 구조
const recipeSchema = {
    _id: ObjectId,
    title: String,
    slug: String,
    category: String,
    servings: Number,
    totalWeight: Number,
    
    ingredients: [{
        ingredient: {
            _id: ObjectId,
            name: String,
            category: String
        },
        amount: Number,
        unit: String,
        bakerPercentage: Number,
        stepNumber: Number
    }],
    
    instructions: [{
        step: Number,
        description: String,
        time: Number,
        temperature: Number,
        tips: [String]
    }],
    
    conversions: {
        poolish: {
            ratio: Number,
            preferment: [Object],
            mainDough: [Object]
        },
        overnight: {
            yeastReduction: Number,
            fermentationTime: Number
        }
    },
    
    metadata: {
        tags: [String],
        difficulty: String,
        equipment: [String],
        allergens: [String]
    },
    
    createdBy: ObjectId,
    createdAt: Date,
    updatedAt: Date
};
```

## 마이크로서비스 아키텍처

### 서비스 분리

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 1. 레시피 서비스
  recipe-service:
    build: ./services/recipe
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/recipes
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  # 2. 변환 서비스
  conversion-service:
    build: ./services/conversion
    ports:
      - "3002:3000"
    environment:
      - RECIPE_SERVICE_URL=http://recipe-service:3000
    
  # 3. 검색 서비스
  search-service:
    build: ./services/search
    ports:
      - "3003:3000"
    environment:
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  # 4. 사용자 서비스
  auth-service:
    build: ./services/auth
    ports:
      - "3004:3000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=postgresql://user:pass@db:5432/users

  # API 게이트웨이
  api-gateway:
    build: ./gateway
    ports:
      - "80:80"
    depends_on:
      - recipe-service
      - conversion-service
      - search-service
      - auth-service

  # 데이터베이스
  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=recipebook
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # 캐시
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # 검색 엔진
  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - es_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  es_data:
```

### API 설계 (RESTful + GraphQL)

#### REST API 엔드포인트

```
# 레시피 CRUD
GET    /api/v1/recipes
GET    /api/v1/recipes/:id
POST   /api/v1/recipes
PUT    /api/v1/recipes/:id
DELETE /api/v1/recipes/:id

# 레시피 변환
POST   /api/v1/recipes/:id/convert
{
    "method": "poolish",
    "options": {
        "ratio": 25,
        "fermentationTime": 12
    }
}

# 팬 크기 조정
POST   /api/v1/recipes/:id/scale
{
    "panType": "loaf_2pound",
    "quantity": 2
}

# 검색
GET    /api/v1/search?q=bread&category=sourdough&tags=overnight

# 사용자 인증
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

#### GraphQL 스키마

```graphql
type Recipe {
    id: ID!
    title: String!
    slug: String!
    category: String
    servings: Int
    totalWeight: Float
    ingredients: [RecipeIngredient!]!
    instructions: [Instruction!]!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
}

type RecipeIngredient {
    ingredient: Ingredient!
    amount: Float!
    unit: String!
    bakerPercentage: Float
    stepNumber: Int
}

type Query {
    recipe(id: ID!): Recipe
    recipes(
        category: String
        author: ID
        limit: Int
        offset: Int
    ): [Recipe!]!
    
    searchRecipes(
        query: String!
        filters: SearchFilters
    ): SearchResult!
}

type Mutation {
    createRecipe(input: RecipeInput!): Recipe!
    updateRecipe(id: ID!, input: RecipeInput!): Recipe!
    deleteRecipe(id: ID!): Boolean!
    
    convertRecipe(
        id: ID!
        method: ConversionMethod!
        options: ConversionOptions
    ): ConvertedRecipe!
    
    scaleRecipe(
        id: ID!
        factor: Float!
    ): Recipe!
}
```

## 레시피 변환 알고리즘 구현

### Python 구현 (정밀도 중심)

```python
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Optional
import json

class RecipeConverter:
    def __init__(self):
        self.methods = {
            'poolish': self._convert_to_poolish,
            'biga': self._convert_to_biga,
            'overnight': self._convert_to_overnight,
            'sponge': self._convert_to_sponge
        }
    
    def convert(self, recipe: Dict, method: str, options: Dict) -> Dict:
        """레시피를 지정된 제법으로 변환"""
        if method not in self.methods:
            raise ValueError(f"Unknown method: {method}")
        
        return self.methods[method](recipe, options)
    
    def _convert_to_poolish(self, recipe: Dict, options: Dict) -> Dict:
        """폴리쉬법으로 변환"""
        ratio = Decimal(str(options.get('ratio', 25))) / 100
        
        # 전체 밀가루 계산
        total_flour = sum(
            Decimal(str(ing['amount'])) 
            for ing in recipe['ingredients'] 
            if ing['category'] == 'flour'
        )
        
        # 폴리쉬용 밀가루
        poolish_flour = total_flour * ratio
        poolish_water = poolish_flour  # 100% 수화율
        poolish_yeast = poolish_flour * Decimal('0.001')  # 0.1%
        
        # 정밀도 처리
        poolish_flour = poolish_flour.quantize(Decimal('1'))
        poolish_water = poolish_water.quantize(Decimal('1'))
        poolish_yeast = poolish_yeast.quantize(Decimal('0.01'))
        
        return {
            'method': 'poolish',
            'preferment': {
                'ingredients': [
                    {'name': '강력분', 'amount': float(poolish_flour), 'unit': 'g'},
                    {'name': '물', 'amount': float(poolish_water), 'unit': 'g'},
                    {'name': '이스트', 'amount': float(poolish_yeast), 'unit': 'g'}
                ],
                'time': '12-18시간',
                'temperature': '20-22°C'
            },
            'main_dough': self._calculate_main_dough(
                recipe, poolish_flour, poolish_water, poolish_yeast
            )
        }
    
    def scale_recipe(self, recipe: Dict, target_servings: int) -> Dict:
        """레시피 스케일링"""
        factor = Decimal(str(target_servings)) / Decimal(str(recipe['servings']))
        scaled_ingredients = []
        
        for ingredient in recipe['ingredients']:
            new_quantity = Decimal(str(ingredient['amount'])) * factor
            
            # 적절한 정밀도로 반올림
            if new_quantity > 100:
                new_quantity = new_quantity.quantize(Decimal('1'))
            elif new_quantity > 10:
                new_quantity = new_quantity.quantize(Decimal('0.1'))
            else:
                new_quantity = new_quantity.quantize(Decimal('0.01'))
            
            scaled_ingredients.append({
                **ingredient,
                'amount': float(new_quantity)
            })
        
        return {
            **recipe,
            'servings': target_servings,
            'ingredients': scaled_ingredients
        }
```

### TypeScript 구현 (웹 클라이언트용)

```typescript
interface Recipe {
    id: string;
    ingredients: Ingredient[];
    servings: number;
    totalWeight: number;
}

interface Ingredient {
    id: string;
    name: string;
    amount: number;
    unit: string;
    bakerPercentage: number;
    category: string;
}

class RecipeConverter {
    private readonly PRECISION = 2;
    
    convertToPoolish(
        recipe: Recipe, 
        options: { ratio: number; fermentationTime: number }
    ): ConvertedRecipe {
        const flourIngredients = recipe.ingredients.filter(
            ing => ing.category === 'flour'
        );
        
        const totalFlour = flourIngredients.reduce(
            (sum, ing) => sum + ing.amount, 0
        );
        
        const poolishFlour = this.round(totalFlour * options.ratio / 100);
        const poolishWater = poolishFlour; // 100% hydration
        const poolishYeast = this.round(poolishFlour * 0.001, 3);
        
        const preferment: Ingredient[] = [
            {
                id: 'flour_poolish',
                name: '강력분',
                amount: poolishFlour,
                unit: 'g',
                bakerPercentage: 100,
                category: 'flour'
            },
            {
                id: 'water_poolish',
                name: '물',
                amount: poolishWater,
                unit: 'g',
                bakerPercentage: 100,
                category: 'liquid'
            },
            {
                id: 'yeast_poolish',
                name: '이스트',
                amount: poolishYeast,
                unit: 'g',
                bakerPercentage: 0.1,
                category: 'leavening'
            }
        ];
        
        const mainDough = this.calculateMainDough(
            recipe, 
            poolishFlour, 
            poolishWater, 
            poolishYeast
        );
        
        return {
            method: 'poolish',
            preferment,
            mainDough,
            fermentationTime: options.fermentationTime,
            instructions: this.generateInstructions('poolish', options)
        };
    }
    
    private round(value: number, precision: number = this.PRECISION): number {
        const factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    }
    
    private calculateMainDough(
        recipe: Recipe,
        usedFlour: number,
        usedWater: number,
        usedYeast: number
    ): Ingredient[] {
        return recipe.ingredients.map(ingredient => {
            let adjustedAmount = ingredient.amount;
            
            if (ingredient.category === 'flour') {
                adjustedAmount -= (usedFlour * ingredient.amount / 
                    this.getTotalByCategory(recipe, 'flour'));
            } else if (ingredient.name === '물') {
                adjustedAmount -= usedWater;
            } else if (ingredient.name === '이스트') {
                adjustedAmount -= usedYeast;
            }
            
            return {
                ...ingredient,
                amount: this.round(adjustedAmount)
            };
        }).filter(ing => ing.amount > 0);
    }
    
    private getTotalByCategory(recipe: Recipe, category: string): number {
        return recipe.ingredients
            .filter(ing => ing.category === category)
            .reduce((sum, ing) => sum + ing.amount, 0);
    }
}
```

## 캐싱 전략

### 다층 캐싱 구조

```javascript
// Redis 캐싱 레이어
class CacheService {
    constructor(redisClient) {
        this.redis = redisClient;
        this.ttl = {
            recipe: 3600,        // 1시간
            conversion: 86400,   // 24시간
            search: 300,         // 5분
            user: 1800          // 30분
        };
    }
    
    async getRecipe(id) {
        const cacheKey = `recipe:${id}`;
        const cached = await this.redis.get(cacheKey);
        
        if (cached) {
            return JSON.parse(cached);
        }
        
        const recipe = await db.getRecipe(id);
        await this.redis.setex(
            cacheKey, 
            this.ttl.recipe, 
            JSON.stringify(recipe)
        );
        
        return recipe;
    }
    
    async getConversion(recipeId, method, options) {
        const optionsHash = crypto
            .createHash('md5')
            .update(JSON.stringify(options))
            .digest('hex');
        
        const cacheKey = `conversion:${recipeId}:${method}:${optionsHash}`;
        const cached = await this.redis.get(cacheKey);
        
        if (cached) {
            return JSON.parse(cached);
        }
        
        const converted = await conversionService.convert(
            recipeId, 
            method, 
            options
        );
        
        await this.redis.setex(
            cacheKey, 
            this.ttl.conversion, 
            JSON.stringify(converted)
        );
        
        return converted;
    }
    
    async invalidateRecipe(id) {
        const pattern = `*:${id}:*`;
        const keys = await this.redis.keys(pattern);
        
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}
```

### CDN 전략

```nginx
# nginx.conf
server {
    listen 80;
    server_name api.recipebook.com;
    
    # 정적 파일 캐싱
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 응답 캐싱
    location /api/v1/recipes {
        proxy_pass http://recipe-service:3000;
        proxy_cache api_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_key "$request_method$request_uri$args";
        add_header X-Cache-Status $upstream_cache_status;
    }
    
    # 실시간 데이터는 캐싱 제외
    location /api/v1/auth {
        proxy_pass http://auth-service:3000;
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }
}
```

## 모니터링과 로깅

### 구조화된 로깅

```javascript
// Winston 로거 설정
const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'recipe-service' },
    transports: [
        new winston.transports.File({ 
            filename: 'error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'combined.log' 
        })
    ]
});

// 요청 로깅 미들웨어
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: Date.now() - start,
            userId: req.user?.id,
            ip: req.ip
        });
    });
    
    next();
});
```

### 성능 모니터링

```javascript
// Prometheus 메트릭
const prometheus = require('prom-client');

const httpDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status']
});

const recipeConversions = new prometheus.Counter({
    name: 'recipe_conversions_total',
    help: 'Total number of recipe conversions',
    labelNames: ['method']
});

// 메트릭 수집
app.use((req, res, next) => {
    const end = httpDuration.startTimer();
    
    res.on('finish', () => {
        end({ 
            method: req.method, 
            route: req.route?.path || 'unknown',
            status: res.statusCode 
        });
    });
    
    next();
});
```

## 🔧 배포 전략

### CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm install
          npm test
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t recipebook/api:$GITHUB_SHA .
          docker push recipebook/api:$GITHUB_SHA
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api api=recipebook/api:$GITHUB_SHA
          kubectl rollout status deployment/api
```

### 스케일링 전략

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recipe-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: recipe-service
  template:
    metadata:
      labels:
        app: recipe-service
    spec:
      containers:
      - name: recipe-service
        image: recipebook/recipe-service:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: recipe-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: recipe-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```