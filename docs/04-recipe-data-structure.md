# 레시피 데이터 구조

## 베이커스 퍼센트 (Baker's Percentage)

### 핵심 개념
- **전체 밀가루 양을 100%로 기준**
- 모든 재료를 밀가루 대비 백분율로 표현
- 레시피 확장/축소 시 비율 유지

### 계산 공식
```
재료의 베이커스 퍼센트 = (재료 중량 ÷ 전체 밀가루 중량) × 100
```

### 예시
```
기본 레시피:
- 강력분: 500g (100%)
- 물: 300g (60%)
- 이스트: 6g (1.2%)
- 소금: 10g (2%)
- 설탕: 25g (5%)

총 수화율(Hydration): 60%
```

## 데이터베이스 설계

### 하이브리드 접근법 (PostgreSQL + JSONB)

```sql
-- 레시피 기본 정보
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    servings INTEGER,
    total_weight DECIMAL(10,2),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- 재료 마스터 테이블
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(100),
    density DECIMAL(10,4), -- g/ml 변환용
    base_unit VARCHAR(20) DEFAULT 'g',
    properties JSONB -- 알레르기 정보, 대체재 등
);

-- 레시피-재료 관계
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id),
    ingredient_id INTEGER REFERENCES ingredients(id),
    amount DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'g',
    baker_percentage DECIMAL(10,2),
    step_number INTEGER DEFAULT 1,
    notes TEXT
);

-- 제법별 변환 규칙
CREATE TABLE method_conversions (
    id SERIAL PRIMARY KEY,
    method_name VARCHAR(100) NOT NULL,
    flour_ratio DECIMAL(5,2),
    water_ratio DECIMAL(5,2),
    yeast_modifier DECIMAL(5,2),
    fermentation_time INTEGER,
    temperature_range JSONB
);
```

### JSONB 메타데이터 구조

```json
{
    "instructions": [
        {
            "step": 1,
            "description": "모든 재료를 볼에 넣고 섞기",
            "time": 5,
            "temperature": null
        }
    ],
    "tags": ["식빵", "아침빵", "부드러운"],
    "difficulty": "beginner",
    "prep_time": 20,
    "bake_time": 35,
    "total_time": 180,
    "equipment": ["스탠드믹서", "식빵팬"],
    "tips": "반죽이 매끄러워질 때까지 충분히 치대세요"
}
```

## 레시피 변환 데이터 모델

### 기본 레시피 객체

```javascript
const Recipe = {
    id: 'uuid',
    title: '기본 식빵',
    baseFlourWeight: 500, // 기준 밀가루량
    totalWeight: 841, // 총 반죽 중량
    servings: 1,
    panSize: 'loaf_1pound',
    
    ingredients: [
        {
            id: 'flour_bread',
            name: '강력분',
            amount: 500,
            unit: 'g',
            bakerPercentage: 100,
            category: 'flour'
        },
        {
            id: 'water',
            name: '물',
            amount: 300,
            unit: 'g',
            bakerPercentage: 60,
            category: 'liquid'
        },
        {
            id: 'yeast_instant',
            name: '인스턴트이스트',
            amount: 6,
            unit: 'g',
            bakerPercentage: 1.2,
            category: 'leavening'
        }
    ],
    
    method: 'straight',
    fermentationSteps: [...],
    bakingConditions: {...}
};
```

### 변환된 레시피 구조

```javascript
const ConvertedRecipe = {
    ...baseRecipe,
    
    conversionMethod: 'poolish',
    conversionParams: {
        prefermentRatio: 25,
        fermentationTime: 12,
        temperature: 22
    },
    
    steps: {
        preferment: {
            ingredients: [
                { name: '강력분', amount: 125, unit: 'g' },
                { name: '물', amount: 125, unit: 'g' },
                { name: '이스트', amount: 0.125, unit: 'g' }
            ],
            time: '12-18시간',
            temperature: '20-22°C'
        },
        
        mainDough: {
            ingredients: [
                { name: '강력분', amount: 375, unit: 'g' },
                { name: '물', amount: 175, unit: 'g' },
                { name: '이스트', amount: 5.875, unit: 'g' },
                { name: '소금', amount: 10, unit: 'g' }
            ]
        }
    }
};
```

## 단위 변환 시스템

### 무게-부피 변환 테이블

```javascript
const conversionTable = {
    flour: {
        cup: 125,    // 1컵 = 125g
        tbsp: 7.8,   // 1큰술 = 7.8g
        tsp: 2.6     // 1작은술 = 2.6g
    },
    water: {
        cup: 237,    // 1컵 = 237g
        tbsp: 15,    // 1큰술 = 15g
        tsp: 5       // 1작은술 = 5g
    },
    sugar: {
        cup: 200,    // 1컵 = 200g
        tbsp: 12.5,  // 1큰술 = 12.5g
        tsp: 4.2     // 1작은술 = 4.2g
    }
};
```

### 정밀도 처리

```python
from decimal import Decimal, ROUND_HALF_UP

def precise_scaling(ingredient, scale_factor):
    """정밀한 재료 스케일링"""
    original = Decimal(str(ingredient['amount']))
    scaled = original * Decimal(str(scale_factor))
    
    # 적절한 정밀도로 반올림
    if scaled > 100:
        # 100g 이상: 정수로
        return int(scaled.quantize(Decimal('1')))
    elif scaled > 10:
        # 10-100g: 소수점 첫째자리
        return float(scaled.quantize(Decimal('0.1')))
    else:
        # 10g 미만: 소수점 둘째자리
        return float(scaled.quantize(Decimal('0.01')))
```

## 레시피 검증 규칙

### 비율 검증

```javascript
function validateRecipe(recipe) {
    const validations = [];
    
    // 수화율 검증
    const hydration = calculateHydration(recipe);
    if (hydration < 50) {
        validations.push({
            type: 'warning',
            message: '수화율이 매우 낮습니다. 건조한 반죽이 될 수 있습니다.'
        });
    }
    
    // 이스트 비율 검증
    const yeastRatio = calculateYeastRatio(recipe);
    if (yeastRatio > 3) {
        validations.push({
            type: 'warning',
            message: '이스트가 많습니다. 발효 시간을 단축하세요.'
        });
    }
    
    // 소금 비율 검증
    const saltRatio = calculateSaltRatio(recipe);
    if (saltRatio < 1.5 || saltRatio > 2.5) {
        validations.push({
            type: 'info',
            message: '표준 소금 비율은 1.8-2.2%입니다.'
        });
    }
    
    return validations;
}
```

## 버전 관리

### 레시피 이력 추적

```sql
CREATE TABLE recipe_versions (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id),
    version_number INTEGER NOT NULL,
    changes JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_note TEXT
);
```

### 변경 사항 기록

```json
{
    "version": 2,
    "changes": [
        {
            "field": "ingredients.water.amount",
            "old_value": 300,
            "new_value": 320,
            "reason": "건조한 날씨를 위한 수분 증량"
        }
    ]
}
```

## 🔧 구현 최적화

1. **캐싱 전략**: 자주 사용되는 변환 결과 캐싱
2. **인덱싱**: 재료명, 레시피 제목에 대한 전문 검색
3. **정규화**: 재료 이름 표준화 (밀가루, 강력분 → bread_flour)
4. **다국어 지원**: 재료명 다국어 매핑 테이블