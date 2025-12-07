/**
 * 제과제빵 계산 공식 상수
 * 각종 계산에 사용되는 공식과 계수
 */

export const FORMULAS = {
  // 베이커스 퍼센트 공식
  BAKERS_PERCENTAGE: {
    calculate: (ingredientWeight, flourWeight) => (ingredientWeight / flourWeight) * 100,
    reverse: (percentage, flourWeight) => (percentage / 100) * flourWeight
  },

  // 수화율 계산
  HYDRATION: {
    calculate: (liquidWeight, flourWeight) => (liquidWeight / flourWeight) * 100,
    targetLiquid: (flourWeight, hydrationPercent) => flourWeight * (hydrationPercent / 100)
  },

  // 반죽 수율
  DOUGH_YIELD: {
    calculate: (totalDoughWeight, flourWeight) => (totalDoughWeight / flourWeight) * 100,
    targetDough: (flourWeight, yieldPercent) => flourWeight * (yieldPercent / 100)
  },

  // DDT (목표 반죽 온도) 공식
  DDT: {
    basic: (targetTemp, flourTemp, roomTemp, friction) => 
      (targetTemp * 3) - flourTemp - roomTemp - friction,
    
    withPreferment: (targetTemp, flourTemp, roomTemp, prefermentTemp, friction) =>
      (targetTemp * 4) - flourTemp - roomTemp - prefermentTemp - friction,
    
    friction_factors: {
      hand: 0,
      stand_mixer: 24,
      spiral_mixer: 22,
      planetary_mixer: 26
    }
  },

  // 얼음 계산 공식
  ICE_CALCULATION: {
    // 얼음량 = 전체물량 × (현재물온도 - 목표물온도) / (90 + 목표물온도)
    amount: (totalWater, currentTemp, targetTemp) => {
      if (currentTemp <= targetTemp) return 0
      return totalWater * (currentTemp - targetTemp) / (90 + targetTemp)
    },
    
    // 물의 열용량
    specific_heat_water: 1, // kcal/kg·°C
    
    // 얼음의 융해열
    heat_of_fusion: 80 // kcal/kg
  },

  // 팬 부피 계산
  PAN_VOLUME: {
    round: (diameter, height) => Math.PI * Math.pow(diameter/2, 2) * height,
    
    square: (length, width, height) => length * width * height,
    
    loaf: (topLength, bottomLength, width, height) => 
      ((topLength + bottomLength) / 2) * width * height,
    
    chiffon: (outerDiameter, innerDiameter, height) => {
      const outerVolume = Math.PI * Math.pow(outerDiameter/2, 2) * height
      const innerVolume = Math.PI * Math.pow(innerDiameter/2, 2) * height
      return outerVolume - innerVolume
    }
  },

  // 발효 시간 계산
  FERMENTATION_TIME: {
    // 온도에 따른 발효 시간 조정
    // 기준온도 25°C, 온도 1°C 차이당 10% 시간 변화
    byTemperature: (baseTime, currentTemp, baseTemp = 25) => {
      const tempDiff = currentTemp - baseTemp
      const factor = Math.pow(0.9, tempDiff)
      return baseTime * factor
    },
    
    // 이스트량에 따른 발효 시간 조정
    byYeastAmount: (baseTime, actualYeast, baseYeast) => {
      const yeastRatio = baseYeast / actualYeast
      return baseTime * Math.sqrt(yeastRatio)
    }
  },

  // 고도 보정 공식
  ALTITUDE_ADJUSTMENT: {
    // 기압 계산 (kPa)
    pressure: (altitude) => 101.325 - (altitude * 0.012),
    
    // 끓는점 계산 (°C)
    boilingPoint: (altitude) => 100 - (altitude / 300),
    
    // 보정 계수
    factors: (altitude) => ({
      yeast: altitude >= 900 ? 1 - (altitude / 10000) : 1,
      sugar: altitude >= 900 ? 1 - (altitude / 15000) : 1,
      liquid: altitude >= 900 ? 1 + (altitude / 8000) : 1,
      flour: altitude >= 900 ? 1 + (altitude / 12000) : 1,
      temperature: altitude >= 900 ? Math.min(5, altitude / 300) : 0,
      time: altitude >= 900 ? 1 + (altitude / 10000) : 1
    })
  },

  // 습도 보정 공식
  HUMIDITY_ADJUSTMENT: {
    // 밀가루 조정 (기준 습도 60%)
    flour: (humidity, flourAmount) => {
      const humidityDiff = humidity - 60
      const factor = 1 + (humidityDiff * 0.002)
      return flourAmount * factor
    },
    
    // 수분 조정 (기준 습도 60%)
    liquid: (humidity, liquidAmount) => {
      const humidityDiff = humidity - 60
      const factor = 1 - (humidityDiff * 0.003)
      return liquidAmount * factor
    }
  }
}

/**
 * 제품별 기준값
 */
export const PRODUCT_STANDARDS = {
  // 수화율 기준
  hydration: {
    bagel: 55,
    pizza: 65,
    ciabatta: 80,
    focaccia: 75,
    sandwich_bread: 60,
    croissant: 55,
    brioche: 50
  },

  // 반죽 수율 기준
  dough_yield: {
    lean_dough: 160,
    enriched_dough: 180,
    sweet_dough: 200,
    laminated_dough: 170
  },

  // 발효 온도 기준
  fermentation_temp: {
    slow: 18,
    standard: 25,
    fast: 30,
    cold: 4
  },

  // 베이킹 온도 기준
  baking_temp: {
    cookies: 170,
    cakes: 180,
    bread: 200,
    pizza: 250,
    croissant: 190
  }
}

/**
 * 계산 상수
 */
export const CALCULATION_CONSTANTS = {
  // 밀도 (g/ml)
  density: {
    water: 1.0,
    flour: 0.52,
    sugar: 0.85,
    butter: 0.91,
    oil: 0.92,
    salt: 1.2,
    yeast: 0.65
  },

  // 변환 계수
  conversion: {
    celsius_to_fahrenheit: 9/5,
    fahrenheit_offset: 32,
    gram_to_ounce: 0.035274,
    ml_to_cup: 0.00422675,
    cm_to_inch: 0.393701
  },

  // 반죽 밀도 (g/cm³)
  dough_density: {
    bread: 0.55,
    cake: 0.45,
    cookie: 0.75,
    pastry: 0.65
  },

  // 팬 충전율
  pan_fill_ratio: {
    bread: 0.5,
    cake: 0.65,
    chiffon: 0.75,
    pound: 0.7,
    muffin: 0.75,
    roll: 0.6
  }
}

/**
 * 시간 변환 상수
 */
export const TIME_CONVERSIONS = {
  minute_to_hour: 1/60,
  hour_to_day: 1/24,
  
  // 발효 단계별 시간 비율
  fermentation_stages: {
    bulk: 0.6,      // 1차 발효 60%
    final: 0.4      // 2차 발효 40%
  },
  
  // 제법별 시간 분배
  method_time_distribution: {
    straight: { mixing: 0.1, bulk: 0.5, final: 0.4 },
    sponge: { preferment: 0.4, mixing: 0.1, bulk: 0.3, final: 0.2 },
    poolish: { preferment: 0.5, mixing: 0.1, bulk: 0.25, final: 0.15 }
  }
}

export default FORMULAS