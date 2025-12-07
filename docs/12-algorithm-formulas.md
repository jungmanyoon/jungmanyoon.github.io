# 제빵 과학 알고리즘 및 수식 종합

## 🔬 핵심 계산 공식 모음

### 1. 베이커스 퍼센트 (Baker's Percentage)

#### 기본 공식
```javascript
// 베이커스 퍼센트 = (재료 중량 ÷ 전체 밀가루 중량) × 100

class BakersPercentage {
    // 베이커스 퍼센트 계산
    static calculate(ingredientWeight, totalFlourWeight) {
        return (ingredientWeight / totalFlourWeight) * 100;
    }
    
    // 베이커스 퍼센트로부터 실제 중량 계산
    static toWeight(percentage, totalFlourWeight) {
        return (percentage / 100) * totalFlourWeight;
    }
    
    // 레시피 정규화 (모든 재료를 베이커스 퍼센트로 변환)
    static normalizeRecipe(ingredients) {
        const flourWeight = ingredients
            .filter(ing => ing.category === 'flour')
            .reduce((sum, ing) => sum + ing.weight, 0);
        
        return ingredients.map(ing => ({
            ...ing,
            bakerPercentage: this.calculate(ing.weight, flourWeight)
        }));
    }
}
```

### 2. 제법별 변환 매트릭스

```javascript
const METHOD_CONVERSION_MATRIX = {
    // 중종법 (Sponge & Dough)
    sponge: {
        prefermentFlour: { min: 50, max: 70, default: 60 }, // %
        prefermentWater: 'adjust_to_dough_consistency',
        prefermentYeast: { min: 60, max: 100, default: 80 }, // % of total yeast
        fermentationTime: { min: 2, max: 4, unit: 'hours' },
        temperature: 26 // °C
    },
    
    // 폴리쉬법 (Poolish)
    poolish: {
        prefermentFlour: { min: 30, max: 40, default: 35 }, // %
        prefermentWater: 100, // % of preferment flour (1:1 ratio)
        prefermentYeast: 0.1, // % of preferment flour
        fermentationTime: { min: 12, max: 16, unit: 'hours' },
        temperature: { min: 20, max: 22 } // °C
    },
    
    // 비가법 (Biga)
    biga: {
        prefermentFlour: { min: 30, max: 40, default: 35 }, // %
        prefermentWater: { min: 50, max: 60, default: 55 }, // % of preferment flour
        prefermentYeast: { min: 0.2, max: 0.5, default: 0.3 }, // % of preferment flour
        fermentationTime: { min: 12, max: 24, unit: 'hours' },
        temperature: 'room_temperature'
    },
    
    // 저온숙성법 (Cold Fermentation)
    coldFermentation: {
        yeastReduction: { min: 50, max: 75, default: 60 }, // % reduction
        temperature: { min: 4, max: 6, default: 5 }, // °C
        fermentationTime: { min: 12, max: 72, default: 24 }, // hours
        targetDoughTemp: 24 // °C
    },
    
    // 노타임법 (No-Time Dough)
    noTime: {
        yeastIncrease: { min: 50, max: 100, default: 75 }, // % increase
        targetDoughTemp: { min: 30, max: 31 }, // °C
        mixingTimeIncrease: { min: 20, max: 25 }, // %
        waterReduction: 2, // %
        sugarReduction: 5 // %
    }
};
```

### 3. 팬 부피 계산 공식

```javascript
class PanVolumeCalculator {
    // 직사각형/정사각형 팬
    static rectangular(length, width, height) {
        return length * width * height;
    }
    
    // 원형 팬
    static circular(radius, height) {
        return Math.PI * Math.pow(radius, 2) * height;
    }
    
    // 경사진 팬 (식빵틀)
    static tapered(topLength, topWidth, bottomLength, bottomWidth, height) {
        const avgLength = (topLength + bottomLength) / 2;
        const avgWidth = (topWidth + bottomWidth) / 2;
        return avgLength * avgWidth * height;
    }
    
    // 쉬폰 팬 (중앙 구멍 있음)
    static chiffon(outerRadius, innerRadius, height) {
        return Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2)) * height;
    }
    
    // 스케일링 팩터 계산
    static calculateScalingFactor(originalVolume, targetVolume) {
        return targetVolume / originalVolume;
    }
}
```

### 4. DDT (Desired Dough Temperature) 공식

```javascript
class DDTCalculator {
    // 기본 DDT 공식 (스트레이트법)
    static straight(desiredTemp, flourTemp, roomTemp, frictionCoeff) {
        return (desiredTemp * 3) - (flourTemp + roomTemp + frictionCoeff);
    }
    
    // 중종법용 DDT 공식
    static sponge(desiredTemp, flourTemp, roomTemp, spongeTemp, frictionCoeff) {
        return (desiredTemp * 4) - (flourTemp + roomTemp + spongeTemp + frictionCoeff);
    }
    
    // 마찰 계수 참조값
    static FRICTION_COEFFICIENTS = {
        handMixing: { min: -5, max: 3, default: -1 },
        standMixer: { min: 6, max: 10, default: 8 },
        spiralMixer: { min: 15, max: 20, default: 17 }
    };
    
    // 얼음 필요량 계산 (Gemini 문서 참조)
    static calculateIceNeeded(waterWeight, currentWaterTemp, targetWaterTemp) {
        if (targetWaterTemp >= currentWaterTemp) return 0;
        
        // 열평형 방정식 적용
        const specificHeatWater = 1; // cal/g°C
        const specificHeatIce = 0.5; // cal/g°C
        const latentHeat = 80; // cal/g
        const iceTemp = -18; // °C (일반 냉동고)
        
        const heatToRemove = waterWeight * specificHeatWater * (currentWaterTemp - targetWaterTemp);
        const heatAbsorbedPerGramIce = 
            specificHeatIce * (0 - iceTemp) + // 얼음을 0°C로
            latentHeat + // 얼음 녹이기
            specificHeatWater * targetWaterTemp; // 0°C에서 목표온도로
        
        const iceNeeded = heatToRemove / heatAbsorbedPerGramIce;
        
        return {
            ice: Math.round(iceNeeded),
            water: Math.round(waterWeight - iceNeeded),
            icePercentage: (iceNeeded / waterWeight * 100).toFixed(1)
        };
    }
}
```

### 5. 환경 요인 조정 공식

```javascript
class EnvironmentalAdjustments {
    // 습도에 따른 수분량 조정
    static adjustForHumidity(baseHydration, humidity) {
        if (humidity < 50) {
            return baseHydration + 1; // 1% 증가
        } else if (humidity > 80) {
            return baseHydration - 1; // 1% 감소
        }
        return baseHydration;
    }
    
    // 온도에 따른 발효 시간 조정
    static adjustFermentationTime(baseTime, currentTemp, targetTemp = 25) {
        // Q10 법칙: 10°C 상승 시 반응속도 2배
        const tempDiff = currentTemp - targetTemp;
        const factor = Math.pow(2, tempDiff / 10);
        return baseTime / factor;
    }
    
    // 고도에 따른 조정 (Gemini 문서 참조)
    static adjustForAltitude(recipe, altitudeMeters) {
        const adjustments = {
            water: 1.0,
            yeast: 1.0,
            temperature: 0,
            sugar: 1.0
        };
        
        if (altitudeMeters > 900) { // 3,000 feet
            adjustments.water = 1.02 + (altitudeMeters / 1000) * 0.01;
            adjustments.yeast = 0.95 - (altitudeMeters / 1000) * 0.02;
            adjustments.temperature = Math.floor((altitudeMeters / 300) * 5);
            adjustments.sugar = 0.98; // 2% 감소
        }
        
        return adjustments;
    }
    
    // 이스트 조정 공식 (Gemini 문서)
    static adjustYeastForTime(currentYeast, currentTime, desiredTime) {
        return (currentYeast * currentTime) / desiredTime;
    }
}
```

### 6. 고급 스케일링 옵션

```javascript
class AdvancedScaling {
    // 모드 A: 단순 부피 기반 스케일링
    static simpleScaling(recipe, originalVolume, targetVolume) {
        const scalingFactor = targetVolume / originalVolume;
        return this.scaleIngredients(recipe, scalingFactor);
    }
    
    // 모드 B: 원하는 제품 높이 기반 스케일링 (Gemini 문서)
    static heightBasedScaling(recipe, targetPanArea, desiredHeight, originalVolume) {
        const scalingFactor = (targetPanArea * desiredHeight) / originalVolume;
        return this.scaleIngredients(recipe, scalingFactor);
    }
    
    // 재료 스케일링 with 반올림 규칙
    static scaleIngredients(ingredients, factor) {
        return ingredients.map(ing => ({
            ...ing,
            amount: this.smartRound(ing.amount * factor)
        }));
    }
    
    // 스마트 반올림 (기존 문서 참조)
    static smartRound(amount) {
        if (amount >= 100) return Math.round(amount);
        if (amount >= 10) return Math.round(amount * 10) / 10;
        return Math.round(amount * 100) / 100;
    }
}
```

### 7. 목표 추구 알고리즘 (Goal-Seeking)

```javascript
class GoalSeekingAlgorithm {
    /**
     * Gemini 문서의 복합 환경 조정 개념 구현
     * 목표: 적절하게 발효된 반죽
     */
    static optimizeForEnvironment(recipe, environment, constraints) {
        const goals = {
            properFermentation: true,
            targetDoughTemp: environment.desiredDDT || 25
        };
        
        let optimized = { ...recipe };
        let iterations = 0;
        const maxIterations = 100;
        
        while (!this.goalsAchieved(optimized, goals, environment) && iterations < maxIterations) {
            // 제약 조건에 따라 조정
            if (!constraints.fixedFermentationTime) {
                optimized.fermentationTime = EnvironmentalAdjustments.adjustFermentationTime(
                    recipe.fermentationTime,
                    environment.roomTemp
                );
            }
            
            if (!constraints.fixedYeastAmount) {
                optimized.yeast = EnvironmentalAdjustments.adjustYeastForTime(
                    recipe.yeast,
                    optimized.fermentationTime,
                    recipe.fermentationTime
                );
            }
            
            // 물 온도 재계산
            optimized.waterTemp = DDTCalculator.straight(
                goals.targetDoughTemp,
                environment.flourTemp,
                environment.roomTemp,
                DDTCalculator.FRICTION_COEFFICIENTS[recipe.mixingMethod].default
            );
            
            iterations++;
        }
        
        return {
            recipe: optimized,
            adjustments: this.generateAdjustmentReport(recipe, optimized),
            iterations
        };
    }
}
```

## 📊 통합 변환 시스템

```javascript
class IntegratedRecipeConverter {
    constructor() {
        this.conversionMatrix = METHOD_CONVERSION_MATRIX;
        this.panCalculator = PanVolumeCalculator;
        this.ddtCalculator = DDTCalculator;
        this.environmental = EnvironmentalAdjustments;
    }
    
    /**
     * 통합 레시피 변환 메인 함수
     * Gemini 문서의 단계별 접근법 구현
     */
    convert(recipe, options) {
        // 1단계: 베이커스 퍼센트로 정규화
        const normalized = BakersPercentage.normalizeRecipe(recipe.ingredients);
        
        // 2단계: 제법 변환
        let converted = this.applyMethodConversion(normalized, options.method);
        
        // 3단계: 환경 조정
        converted = this.applyEnvironmentalAdjustments(converted, options.environment);
        
        // 4단계: 팬 크기 조정
        if (options.targetPan) {
            converted = this.applyPanScaling(converted, recipe.pan, options.targetPan);
        }
        
        // 5단계: 최종 중량 계산
        const final = this.calculateFinalWeights(converted, options.totalDoughWeight);
        
        // 6단계: 설명 생성 (Gemini의 Explainability 개념)
        const explanations = this.generateExplanations(recipe, final, options);
        
        return {
            recipe: final,
            explanations,
            metadata: {
                method: options.method,
                environment: options.environment,
                timestamp: new Date()
            }
        };
    }
    
    generateExplanations(original, converted, options) {
        const explanations = [];
        
        // 수분량 변경 설명
        const originalWater = original.ingredients.find(i => i.name === '물');
        const convertedWater = converted.ingredients.find(i => i.name === '물');
        
        if (originalWater && convertedWater && originalWater.amount !== convertedWater.amount) {
            const diff = convertedWater.amount - originalWater.amount;
            explanations.push({
                ingredient: '물',
                change: diff,
                reason: `습도 ${options.environment.humidity}%로 인해 수분량 ${diff > 0 ? '증가' : '감소'}`
            });
        }
        
        return explanations;
    }
}
```

## 🔍 주요 개선사항 (Gemini 문서 반영)

1. **목표 추구 알고리즘**: 복합적인 환경 변수를 자동으로 최적화
2. **고급 스케일링 모드**: 제품 높이 기반 스케일링 옵션
3. **설명 가능성**: 모든 변경사항에 대한 근거 제시
4. **통합 파이프라인**: 정규화 → 제법 변환 → 환경 조정 → 스케일링 순서

## 📐 참조 테이블

### 표준 팬 규격 데이터베이스

```javascript
const STANDARD_PANS = {
    // 원형 케이크팬
    'round_1': { name: '원형 1호', diameter: 15, height: 7, volume: 1237 },
    'round_2': { name: '원형 2호', diameter: 18, height: 7, volume: 1781 },
    'round_3': { name: '원형 3호', diameter: 21, height: 7, volume: 2425 },
    
    // 식빵팬
    'loaf_corn': { 
        name: '옥수수식빵팬', 
        topLength: 22.5, 
        topWidth: 10.5, 
        height: 9.5, 
        volume: 1988 
    },
    'loaf_pullman': { 
        name: '풀먼식빵팬', 
        topLength: 17, 
        topWidth: 12.5, 
        height: 12.5, 
        volume: 2343 
    }
};
```

이 문서는 Gemini 문서의 학술적 접근과 기존 문서들의 실용적 구현을 통합한 것입니다.