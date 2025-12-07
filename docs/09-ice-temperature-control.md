# 얼음과 온도 제어 시스템

## 얼음 사용의 과학적 원리

### 열역학 기초

```javascript
// 얼음의 물리적 상수
const ICE_CONSTANTS = {
    meltingHeat: 80,        // cal/g (융해 잠열)
    specificHeatIce: 0.5,   // cal/g°C (얼음의 비열)
    specificHeatWater: 1.0, // cal/g°C (물의 비열)
    freezingPoint: 0,       // °C
    iceTemperature: -18     // °C (일반 냉동고 온도)
};
```

### 얼음 필요량 계산 공식

```javascript
class IceCalculator {
    /**
     * 목표 온도를 달성하기 위한 얼음량 계산
     * @param {number} waterWeight - 전체 물의 중량 (g)
     * @param {number} currentWaterTemp - 현재 물 온도 (°C)
     * @param {number} targetTemp - 목표 온도 (°C)
     * @param {number} iceTemp - 얼음 온도 (°C, 기본값 -18)
     * @returns {object} 얼음과 물의 비율
     */
    calculateIceRatio(waterWeight, currentWaterTemp, targetTemp, iceTemp = -18) {
        // 열평형 방정식
        // m1 × c × (T1 - Tf) = m2 × [c_ice × (0 - T_ice) + L + c × (Tf - 0)]
        
        const totalHeatToRemove = waterWeight * 
            ICE_CONSTANTS.specificHeatWater * 
            (currentWaterTemp - targetTemp);
        
        const heatAbsorbedPerGramIce = 
            ICE_CONSTANTS.specificHeatIce * (0 - iceTemp) + // 얼음을 0°C로
            ICE_CONSTANTS.meltingHeat +                      // 얼음 녹이기
            ICE_CONSTANTS.specificHeatWater * targetTemp;    // 0°C에서 목표온도로
        
        const iceNeeded = totalHeatToRemove / heatAbsorbedPerGramIce;
        const waterNeeded = waterWeight - iceNeeded;
        
        return {
            ice: Math.round(iceNeeded),
            water: Math.round(waterNeeded),
            icePercentage: (iceNeeded / waterWeight * 100).toFixed(1),
            totalWater: waterWeight
        };
    }
}
```

## DDT (Desired Dough Temperature) 시스템

### 정밀한 DDT 계산

```javascript
class DDTCalculator {
    constructor() {
        this.frictionFactors = {
            handMixing: 6,        // °C
            standMixer: 20,       // °C
            spiralMixer: 15,      // °C
            foodProcessor: 25     // °C
        };
        
        this.optimalDDT = {
            whiteBread: 25,       // °C
            wholeWheat: 23,       // °C
            sourdough: 27,        // °C
            enrichedDough: 24,    // °C
            pizza: 22,            // °C
            croissant: 20         // °C
        };
    }
    
    /**
     * 필요한 물 온도 계산
     * @param {object} params - 계산 매개변수
     * @returns {number} 필요한 물 온도
     */
    calculateWaterTemp(params) {
        const {
            desiredDoughTemp,
            roomTemp,
            flourTemp,
            prefermentTemp = null,
            mixingMethod = 'standMixer',
            mixingTime = 10
        } = params;
        
        const friction = this.calculateFriction(mixingMethod, mixingTime);
        const factorCount = prefermentTemp ? 4 : 3;
        
        let sumOfTemps = roomTemp + flourTemp + friction;
        if (prefermentTemp) {
            sumOfTemps += prefermentTemp;
        }
        
        const requiredWaterTemp = (desiredDoughTemp * factorCount) - sumOfTemps;
        
        return {
            waterTemp: requiredWaterTemp,
            friction: friction,
            needsIce: requiredWaterTemp < 4,
            calculation: {
                formula: prefermentTemp ? 
                    '(DDT × 4) - 실온 - 밀가루온도 - 전발효온도 - 마찰열' :
                    '(DDT × 3) - 실온 - 밀가루온도 - 마찰열',
                values: {
                    ddt: desiredDoughTemp,
                    room: roomTemp,
                    flour: flourTemp,
                    preferment: prefermentTemp,
                    friction: friction
                }
            }
        };
    }
    
    calculateFriction(method, time) {
        const baseFriction = this.frictionFactors[method] || 10;
        // 시간에 따른 마찰열 조정
        return baseFriction * (time / 10);
    }
}
```

### 환경 요인별 보정

```javascript
class EnvironmentalAdjustment {
    /**
     * 습도에 따른 물 온도 조정
     * @param {number} baseWaterTemp - 기본 계산된 물 온도
     * @param {number} humidity - 상대 습도 (%)
     * @returns {number} 조정된 물 온도
     */
    adjustForHumidity(baseWaterTemp, humidity) {
        // 높은 습도: 반죽이 더 끈적이고 발효가 빨라짐
        // 낮은 습도: 반죽이 건조하고 발효가 느려짐
        
        const humidityFactor = (humidity - 60) * 0.05; // 60%를 기준으로
        return baseWaterTemp - humidityFactor;
    }
    
    /**
     * 고도에 따른 조정
     * @param {object} recipe - 레시피 객체
     * @param {number} altitude - 고도 (미터)
     * @returns {object} 조정된 레시피
     */
    adjustForAltitude(recipe, altitude) {
        const adjustments = {
            water: 1.0,
            yeast: 1.0,
            temperature: 0
        };
        
        if (altitude > 900) {  // 3,000 피트 이상
            // 물 증발이 빨라짐
            adjustments.water = 1.02 + (altitude / 1000) * 0.01;
            
            // 발효가 빨라짐
            adjustments.yeast = 0.95 - (altitude / 1000) * 0.02;
            
            // 오븐 온도 상승 필요
            adjustments.temperature = Math.floor((altitude / 300) * 5);
        }
        
        return adjustments;
    }
}
```

## 베이커스 퍼센트에서 얼음 통합

### 얼음을 포함한 베이커스 퍼센트 계산

```javascript
class BakersPercentageWithIce {
    /**
     * 얼음을 포함한 레시피 변환
     * @param {object} recipe - 원본 레시피
     * @param {number} targetDoughTemp - 목표 반죽 온도
     * @param {object} environment - 환경 조건
     * @returns {object} 얼음이 포함된 레시피
     */
    convertWithIce(recipe, targetDoughTemp, environment) {
        const ddtCalc = new DDTCalculator();
        const iceCalc = new IceCalculator();
        
        // DDT 계산
        const waterTempResult = ddtCalc.calculateWaterTemp({
            desiredDoughTemp: targetDoughTemp,
            roomTemp: environment.roomTemp,
            flourTemp: environment.flourTemp,
            mixingMethod: recipe.mixingMethod
        });
        
        const totalWater = this.getTotalWater(recipe);
        
        if (waterTempResult.needsIce) {
            // 얼음 필요량 계산
            const iceRatio = iceCalc.calculateIceRatio(
                totalWater,
                environment.tapWaterTemp,
                waterTempResult.waterTemp
            );
            
            // 레시피 조정
            return this.adjustRecipeWithIce(recipe, iceRatio);
        }
        
        return {
            ...recipe,
            waterTemperature: waterTempResult.waterTemp,
            useIce: false
        };
    }
    
    adjustRecipeWithIce(recipe, iceRatio) {
        const adjustedIngredients = recipe.ingredients.map(ingredient => {
            if (ingredient.name === '물') {
                return [
                    {
                        ...ingredient,
                        name: '찬물',
                        amount: iceRatio.water,
                        temperature: 4 // 냉장고 온도
                    },
                    {
                        name: '얼음',
                        amount: iceRatio.ice,
                        unit: 'g',
                        category: 'liquid',
                        bakerPercentage: (iceRatio.ice / recipe.flourTotal) * 100,
                        notes: '사용 직전에 으깬 얼음 사용'
                    }
                ];
            }
            return ingredient;
        }).flat();
        
        return {
            ...recipe,
            ingredients: adjustedIngredients,
            useIce: true,
            iceInstructions: this.generateIceInstructions(iceRatio)
        };
    }
    
    generateIceInstructions(iceRatio) {
        return [
            `얼음 ${iceRatio.ice}g을 잘게 부수어 준비합니다.`,
            `찬물 ${iceRatio.water}g과 함께 계량합니다.`,
            `전체 물 중 ${iceRatio.icePercentage}%가 얼음입니다.`,
            `반죽 시작 직전에 얼음을 넣어 온도를 조절합니다.`
        ];
    }
}
```

## 계절별 온도 관리 전략

### 여름철 전략

```javascript
const summerStrategy = {
    // 재료 보관
    storage: {
        flour: '서늘한 곳 또는 냉장보관',
        water: '냉장고에서 하룻밤 보관',
        bowl: '사용 전 냉장고에서 냉각',
        preferment: '에어컨 있는 방에서 발효'
    },
    
    // 반죽 조정
    doughAdjustments: {
        waterTemp: 'DDT - 2°C 목표',
        yeastReduction: '10-20% 감소',
        saltIncrease: '5% 증가 (발효 억제)',
        mixingTime: '최소화 (마찰열 감소)'
    },
    
    // 얼음 사용 가이드
    iceUsage: {
        threshold: '실온 28°C 이상',
        percentage: '전체 물의 20-30%',
        method: '플레이크 아이스 또는 잘게 부순 얼음'
    }
};

const winterStrategy = {
    // 재료 준비
    preparation: {
        flour: '실온에서 2시간 이상 보관',
        water: '미지근한 물 사용 (30-35°C)',
        bowl: '따뜻한 물로 예열',
        workspace: '난방이 잘 된 곳에서 작업'
    },
    
    // 반죽 조정
    doughAdjustments: {
        waterTemp: 'DDT + 2°C 목표',
        yeastIncrease: '10-15% 증가',
        proofBox: '발효기 또는 오븐 발효 기능 사용',
        mixingTime: '약간 연장 (반죽 온도 상승)'
    }
};
```

## 실시간 온도 모니터링

### 스마트 온도 추적 시스템

```javascript
class TemperatureMonitor {
    constructor() {
        this.readings = [];
        this.alerts = [];
    }
    
    /**
     * 온도 기록 및 분석
     * @param {string} stage - 공정 단계
     * @param {number} temperature - 측정 온도
     * @param {number} targetTemp - 목표 온도
     */
    recordTemperature(stage, temperature, targetTemp) {
        const reading = {
            stage,
            temperature,
            targetTemp,
            deviation: temperature - targetTemp,
            timestamp: new Date()
        };
        
        this.readings.push(reading);
        
        // 온도 편차 경고
        if (Math.abs(reading.deviation) > 2) {
            this.generateAlert(reading);
        }
        
        return this.analyzePattern();
    }
    
    analyzePattern() {
        const recentReadings = this.readings.slice(-10);
        const avgDeviation = recentReadings.reduce((sum, r) => 
            sum + r.deviation, 0) / recentReadings.length;
        
        return {
            trend: avgDeviation > 0 ? 'warming' : 'cooling',
            avgDeviation: avgDeviation.toFixed(1),
            recommendation: this.getRecommendation(avgDeviation)
        };
    }
    
    getRecommendation(deviation) {
        if (deviation > 2) {
            return '얼음 추가 또는 냉각 시간 연장 필요';
        } else if (deviation < -2) {
            return '따뜻한 환경에서 발효 또는 발효 시간 연장';
        }
        return '현재 온도 관리 양호';
    }
}
```

## 💡 실용적인 팁과 트릭

### 얼음 사용 베스트 프랙티스

1. **얼음 종류별 특징**
   - 각얼음: 녹는 속도가 느림, 큰 덩어리는 부숴서 사용
   - 플레이크 아이스: 가장 이상적, 빠르게 녹아 균일한 온도
   - 슬러시: 물과 얼음 혼합, 즉시 사용 가능

2. **얼음 첨가 타이밍**
   - 믹싱 초반: 전체적인 온도 조절
   - 오토리즈 후: 글루텐 형성에 영향 최소화
   - 단계별 첨가: 큰 배치에서 균일한 온도 유지

3. **계량 정확도**
   - 얼음도 정확히 계량 (녹기 전에 빠르게)
   - 총 수분량에 포함시켜 계산
   - 여유분 5% 추가 준비 (녹는 양 고려)

### 문제 해결 가이드

| 문제 | 원인 | 해결책 |
|------|------|--------|
| 반죽이 너무 차가움 | 얼음 과다 사용 | 실온에서 10분 휴지 |
| 불균일한 온도 | 얼음 덩어리 | 더 잘게 부수어 사용 |
| 발효 지연 | 낮은 반죽 온도 | 따뜻한 곳에서 발효 |
| 수분 과다 | 얼음 녹은 양 미계산 | 밀가루 5-10g 추가 |

## 🔧 구현 시 고려사항

1. **센서 통합**: 블루투스 온도계 연동
2. **자동 계산**: 환경 데이터 기반 실시간 조정
3. **시각화**: 온도 변화 그래프 표시
4. **알림**: 중요 온도 포인트 도달 시 알림