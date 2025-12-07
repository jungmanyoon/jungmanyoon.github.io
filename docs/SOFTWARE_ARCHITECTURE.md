# 소프트웨어 아키텍처 및 설계 원칙

## 🏗️ 아키텍처 패턴

### 1. 계층 구조 (Layered Architecture)

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  (UI 컴포넌트)
├─────────────────────────────────────┤
│         Business Logic Layer        │  (레시피 계산, 변환 로직)
├─────────────────────────────────────┤
│         Data Access Layer           │  (localStorage, IndexedDB)
└─────────────────────────────────────┘
```

```javascript
// 계층 분리 예시
// UI Layer
const RecipeInput = ({ onSubmit }) => {
    const [recipe, setRecipe] = useState({});
    
    const handleSubmit = () => {
        // Business Layer 호출
        const validated = RecipeService.validate(recipe);
        if (validated) {
            onSubmit(validated);
        }
    };
};

// Business Layer
class RecipeService {
    static validate(recipe) {
        // 비즈니스 로직
        return RecipeValidator.isValid(recipe) 
            ? RecipeTransformer.normalize(recipe)
            : null;
    }
    
    static convert(recipe, method, options) {
        // 핵심 변환 로직
        const converter = ConverterFactory.create(method);
        return converter.convert(recipe, options);
    }
}

// Data Layer
class RecipeRepository {
    static async save(recipe) {
        // 저장소 추상화
        if (StorageService.hasSpace()) {
            return await StorageService.save('recipes', recipe);
        }
        throw new StorageError('공간 부족');
    }
}
```

## 🧩 모듈화 원칙

### 1. 단일 책임 원칙 (Single Responsibility)

```javascript
// ❌ 나쁜 예: 여러 책임을 가진 클래스
class Recipe {
    constructor(data) {
        this.data = data;
    }
    
    validate() { /* 검증 */ }
    save() { /* 저장 */ }
    convert() { /* 변환 */ }
    render() { /* 렌더링 */ }
}

// ✅ 좋은 예: 책임 분리
class Recipe {
    constructor(data) {
        this.data = data;
    }
}

class RecipeValidator {
    validate(recipe) { /* 검증만 담당 */ }
}

class RecipeRepository {
    save(recipe) { /* 저장만 담당 */ }
}

class RecipeConverter {
    convert(recipe, method) { /* 변환만 담당 */ }
}
```

### 2. 모듈 구성 방식

```javascript
// modules/recipe/index.js
export { Recipe } from './Recipe';
export { RecipeValidator } from './RecipeValidator';
export { RecipeConverter } from './RecipeConverter';
export { RecipeRepository } from './RecipeRepository';

// modules/pan/index.js
export { Pan } from './Pan';
export { PanCalculator } from './PanCalculator';
export { PanCategories } from './PanCategories';

// 사용
import { Recipe, RecipeConverter } from '@/modules/recipe';
import { Pan, PanCalculator } from '@/modules/pan';
```

## 🎯 객체지향 프로그래밍 원칙

### 1. 캡슐화 (Encapsulation)

```javascript
class Recipe {
    #ingredients = [];  // private field
    #metadata = {};
    
    constructor(title, servings) {
        this.title = title;
        this.servings = servings;
    }
    
    // Getter/Setter로 접근 제어
    get ingredients() {
        return [...this.#ingredients]; // 복사본 반환
    }
    
    addIngredient(ingredient) {
        // 검증 후 추가
        if (this.#validateIngredient(ingredient)) {
            this.#ingredients.push(ingredient);
        }
    }
    
    #validateIngredient(ingredient) {
        // private 메서드
        return ingredient.amount > 0 && ingredient.name;
    }
}
```

### 2. 상속과 다형성

```javascript
// 기본 변환기 클래스
class BaseConverter {
    constructor(recipe) {
        this.recipe = recipe;
    }
    
    // 템플릿 메서드 패턴
    convert(options) {
        this.validateOptions(options);
        const prepared = this.prepareRecipe();
        const converted = this.performConversion(prepared, options);
        return this.formatResult(converted);
    }
    
    // 하위 클래스에서 구현
    validateOptions(options) {
        throw new Error('구현 필요');
    }
    
    performConversion(recipe, options) {
        throw new Error('구현 필요');
    }
    
    // 공통 메서드
    prepareRecipe() {
        return {
            ...this.recipe,
            totalFlour: this.calculateTotalFlour()
        };
    }
    
    formatResult(converted) {
        return {
            ...converted,
            timestamp: new Date(),
            method: this.constructor.name
        };
    }
}

// 폴리쉬 변환기
class PoolishConverter extends BaseConverter {
    validateOptions(options) {
        if (options.ratio < 10 || options.ratio > 50) {
            throw new Error('폴리쉬 비율은 10-50% 사이여야 합니다');
        }
    }
    
    performConversion(recipe, options) {
        const flourAmount = recipe.totalFlour * options.ratio / 100;
        return {
            preferment: {
                flour: flourAmount,
                water: flourAmount,
                yeast: flourAmount * 0.001
            },
            mainDough: this.calculateMainDough(recipe, flourAmount)
        };
    }
}

// 저온숙성 변환기
class OvernightConverter extends BaseConverter {
    validateOptions(options) {
        if (options.hours < 8 || options.hours > 48) {
            throw new Error('저온숙성은 8-48시간 사이여야 합니다');
        }
    }
    
    performConversion(recipe, options) {
        const yeastReduction = this.calculateYeastReduction(options.hours);
        return {
            ...recipe,
            yeast: recipe.yeast * yeastReduction,
            instructions: this.generateInstructions(options)
        };
    }
}
```

### 3. 인터페이스와 추상화

```javascript
// 저장소 인터페이스
class IStorage {
    save(key, data) { throw new Error('구현 필요'); }
    load(key) { throw new Error('구현 필요'); }
    delete(key) { throw new Error('구현 필요'); }
    hasSpace() { throw new Error('구현 필요'); }
}

// localStorage 구현
class LocalStorage extends IStorage {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                throw new StorageError('저장 공간 부족');
            }
            throw e;
        }
    }
    
    load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    
    delete(key) {
        localStorage.removeItem(key);
    }
    
    hasSpace() {
        // 대략적인 여유 공간 확인
        const used = new Blob(Object.values(localStorage)).size;
        return used < 4 * 1024 * 1024; // 4MB 미만
    }
}

// IndexedDB 구현
class IndexedDBStorage extends IStorage {
    async save(key, data) {
        const db = await this.openDB();
        const tx = db.transaction(['data'], 'readwrite');
        await tx.objectStore('data').put(data, key);
    }
    
    async load(key) {
        const db = await this.openDB();
        const tx = db.transaction(['data'], 'readonly');
        return await tx.objectStore('data').get(key);
    }
    
    // ... 기타 메서드 구현
}

// 저장소 팩토리
class StorageFactory {
    static create(type = 'local') {
        switch (type) {
            case 'local':
                return new LocalStorage();
            case 'indexed':
                return new IndexedDBStorage();
            default:
                throw new Error(`Unknown storage type: ${type}`);
        }
    }
}
```

## 🔄 의존성 주입 (Dependency Injection)

```javascript
// 의존성 주입을 통한 결합도 감소
class RecipeService {
    constructor(storage, validator, converter) {
        this.storage = storage;
        this.validator = validator;
        this.converter = converter;
    }
    
    async saveRecipe(recipe) {
        // 주입된 의존성 사용
        const valid = this.validator.validate(recipe);
        if (!valid) throw new ValidationError('유효하지 않은 레시피');
        
        return await this.storage.save('recipe', recipe);
    }
    
    async convertRecipe(recipeId, method, options) {
        const recipe = await this.storage.load(`recipe:${recipeId}`);
        return this.converter.convert(recipe, method, options);
    }
}

// 의존성 컨테이너
class DIContainer {
    constructor() {
        this.services = new Map();
    }
    
    register(name, factory) {
        this.services.set(name, factory);
    }
    
    resolve(name) {
        const factory = this.services.get(name);
        if (!factory) throw new Error(`Service not found: ${name}`);
        return factory(this);
    }
}

// 설정
const container = new DIContainer();

container.register('storage', () => StorageFactory.create('local'));
container.register('validator', () => new RecipeValidator());
container.register('converter', () => new RecipeConverter());
container.register('recipeService', (container) => 
    new RecipeService(
        container.resolve('storage'),
        container.resolve('validator'),
        container.resolve('converter')
    )
);

// 사용
const recipeService = container.resolve('recipeService');
```

## 🎨 디자인 패턴

### 1. 팩토리 패턴

```javascript
class ConverterFactory {
    static converters = {
        poolish: PoolishConverter,
        overnight: OvernightConverter,
        biga: BigaConverter,
        sponge: SpongeConverter
    };
    
    static create(method, recipe) {
        const ConverterClass = this.converters[method];
        if (!ConverterClass) {
            throw new Error(`Unknown method: ${method}`);
        }
        return new ConverterClass(recipe);
    }
    
    static register(method, converterClass) {
        this.converters[method] = converterClass;
    }
}
```

### 2. 옵저버 패턴

```javascript
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(data));
    }
    
    off(event, listenerToRemove) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(
            listener => listener !== listenerToRemove
        );
    }
}

// 레시피 상태 관리
class RecipeStore extends EventEmitter {
    constructor() {
        super();
        this.recipes = [];
    }
    
    addRecipe(recipe) {
        this.recipes.push(recipe);
        this.emit('recipe:added', recipe);
    }
    
    updateRecipe(id, updates) {
        const index = this.recipes.findIndex(r => r.id === id);
        if (index !== -1) {
            this.recipes[index] = { ...this.recipes[index], ...updates };
            this.emit('recipe:updated', this.recipes[index]);
        }
    }
}

// 사용
const store = new RecipeStore();
store.on('recipe:added', (recipe) => {
    console.log('새 레시피 추가됨:', recipe.title);
    updateUI();
});
```

### 3. 전략 패턴

```javascript
// 온도 계산 전략
class TemperatureStrategy {
    calculate(ddt, environment) {
        throw new Error('구현 필요');
    }
}

class SummerTemperatureStrategy extends TemperatureStrategy {
    calculate(ddt, environment) {
        // 여름철 계산 로직
        const baseTemp = super.calculate(ddt, environment);
        return {
            ...baseTemp,
            waterTemp: baseTemp.waterTemp - 2,
            useIce: baseTemp.waterTemp < 10
        };
    }
}

class WinterTemperatureStrategy extends TemperatureStrategy {
    calculate(ddt, environment) {
        // 겨울철 계산 로직
        return {
            waterTemp: ddt - environment.roomTemp + 5,
            useIce: false
        };
    }
}

class TemperatureCalculator {
    constructor(strategy) {
        this.strategy = strategy;
    }
    
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    
    calculate(ddt, environment) {
        return this.strategy.calculate(ddt, environment);
    }
}
```

## 🧪 테스트 가능한 코드 작성

### 1. 순수 함수 선호

```javascript
// ❌ 나쁜 예: 외부 상태에 의존
let globalYeastRatio = 0.02;
function calculateYeast(flour) {
    return flour * globalYeastRatio;
}

// ✅ 좋은 예: 순수 함수
function calculateYeast(flour, yeastRatio = 0.02) {
    return flour * yeastRatio;
}

// 테스트가 쉬움
test('calculateYeast', () => {
    expect(calculateYeast(500, 0.02)).toBe(10);
    expect(calculateYeast(1000, 0.01)).toBe(10);
});
```

### 2. 의존성 모킹

```javascript
// 테스트하기 쉬운 구조
class RecipeService {
    constructor(storage) {
        this.storage = storage;
    }
    
    async save(recipe) {
        const validated = this.validate(recipe);
        return await this.storage.save(validated);
    }
}

// 테스트
describe('RecipeService', () => {
    it('should save valid recipe', async () => {
        // Mock 생성
        const mockStorage = {
            save: jest.fn().mockResolvedValue(true)
        };
        
        const service = new RecipeService(mockStorage);
        const recipe = { title: 'Test', ingredients: [] };
        
        await service.save(recipe);
        
        expect(mockStorage.save).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Test' })
        );
    });
});
```

## 🔧 리팩토링 원칙

### 1. 중복 제거 (DRY - Don't Repeat Yourself)

```javascript
// ❌ 나쁜 예: 중복된 계산 로직
function calculatePoolishFlour(totalFlour, ratio) {
    return Math.round(totalFlour * ratio / 100 * 10) / 10;
}

function calculateBigaFlour(totalFlour, ratio) {
    return Math.round(totalFlour * ratio / 100 * 10) / 10;
}

// ✅ 좋은 예: 공통 로직 추출
function calculatePrefermentFlour(totalFlour, ratio) {
    return Math.round(totalFlour * ratio / 100 * 10) / 10;
}

const calculatePoolishFlour = calculatePrefermentFlour;
const calculateBigaFlour = calculatePrefermentFlour;
```

### 2. 조기 반환 (Early Return)

```javascript
// ❌ 나쁜 예: 중첩된 조건문
function validateRecipe(recipe) {
    if (recipe) {
        if (recipe.title) {
            if (recipe.ingredients && recipe.ingredients.length > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// ✅ 좋은 예: 조기 반환
function validateRecipe(recipe) {
    if (!recipe) return false;
    if (!recipe.title) return false;
    if (!recipe.ingredients?.length) return false;
    return true;
}
```

## 📋 코드 리뷰 체크리스트

```markdown
## 코드 리뷰 시 확인 사항

### 아키텍처
- [ ] 계층 분리가 명확한가?
- [ ] 단일 책임 원칙을 지키는가?
- [ ] 의존성이 올바른 방향인가?

### 모듈화
- [ ] 각 모듈이 독립적으로 테스트 가능한가?
- [ ] 순환 참조가 없는가?
- [ ] 공개 API가 명확한가?

### 객체지향
- [ ] 캡슐화가 적절한가?
- [ ] 상속보다 조합을 사용했는가?
- [ ] 인터페이스가 작고 구체적인가?

### 코드 품질
- [ ] 중복 코드가 없는가?
- [ ] 함수/클래스가 너무 크지 않은가?
- [ ] 네이밍이 명확한가?
- [ ] 주석이 필요한 곳에만 있는가?

### 성능
- [ ] 불필요한 계산이 없는가?
- [ ] 메모리 누수 가능성이 없는가?
- [ ] 적절한 캐싱을 사용하는가?
```

---

**이 아키텍처 원칙들은 유지보수가 쉽고 확장 가능한 코드를 작성하는 기반이 됩니다.**