/**
 * 환경 요인 보정 계산 모듈
 * 온도, 습도, 고도에 따른 레시피 자동 조정
 */

export class Environmental {
  /**
   * 고도에 따른 기압 계산
   * @param {number} altitude - 고도 (m)
   * @returns {number} 기압 (kPa)
   */
  static calculatePressure(altitude) {
    // 해수면 기압: 101.325 kPa
    // 기압 감소율: 약 12 Pa/m
    const seaLevelPressure = 101.325
    const pressureDropRate = 0.012
    
    return seaLevelPressure - (altitude * pressureDropRate)
  }

  /**
   * 고도에 따른 끓는점 계산
   * @param {number} altitude - 고도 (m)
   * @returns {number} 끓는점 (°C)
   */
  static calculateBoilingPoint(altitude) {
    // 매 300m마다 약 1°C 감소
    const seaLevelBoiling = 100
    const boilingDropRate = 1 / 300
    
    return seaLevelBoiling - (altitude * boilingDropRate)
  }

  /**
   * 고도 보정 계수
   * @param {number} altitude - 고도 (m)
   * @returns {Object} 보정 계수들
   */
  static getAltitudeAdjustments(altitude) {
    const adjustments = {
      yeast: 1.0,
      sugar: 1.0,
      liquid: 1.0,
      flour: 1.0,
      temperature: 0,
      time: 1.0
    }

    // 900m 이상부터 보정 시작
    if (altitude >= 900) {
      // 이스트 감소 (발효가 빨라짐)
      adjustments.yeast = 1 - (altitude / 10000)
      
      // 설탕 감소 (구조 약화 방지)
      adjustments.sugar = 1 - (altitude / 15000)
      
      // 액체 증가 (수분 증발 보상)
      adjustments.liquid = 1 + (altitude / 8000)
      
      // 밀가루 증가 (구조 강화)
      adjustments.flour = 1 + (altitude / 12000)
      
      // 온도 증가 (3-5°C)
      adjustments.temperature = Math.min(5, altitude / 300)
      
      // 베이킹 시간 증가
      adjustments.time = 1 + (altitude / 10000)
    }

    return adjustments
  }

  /**
   * 습도에 따른 밀가루 조정
   * @param {number} humidity - 상대습도 (%)
   * @param {number} flourAmount - 원본 밀가루량 (g)
   * @returns {number} 조정된 밀가루량 (g)
   */
  static adjustFlourForHumidity(humidity, flourAmount) {
    // 기준 습도: 60%
    const baseHumidity = 60
    const humidityDiff = humidity - baseHumidity
    
    // 습도 10% 차이당 밀가루 2% 조정
    const adjustmentFactor = 1 + (humidityDiff * 0.002)
    
    return Math.round(flourAmount * adjustmentFactor)
  }

  /**
   * 습도에 따른 수분 조정
   * @param {number} humidity - 상대습도 (%)
   * @param {number} liquidAmount - 원본 수분량 (g)
   * @returns {number} 조정된 수분량 (g)
   */
  static adjustLiquidForHumidity(humidity, liquidAmount) {
    // 기준 습도: 60%
    const baseHumidity = 60
    const humidityDiff = humidity - baseHumidity
    
    // 습도 10% 차이당 수분 3% 조정 (반대로)
    const adjustmentFactor = 1 - (humidityDiff * 0.003)
    
    return Math.round(liquidAmount * adjustmentFactor)
  }

  /**
   * 온도에 따른 발효 시간 조정
   * @param {number} temp - 현재 온도 (°C)
   * @param {number} baseTime - 기준 발효 시간 (분)
   * @param {number} baseTemp - 기준 온도 (°C, 기본 25°C)
   * @returns {number} 조정된 발효 시간 (분)
   */
  static adjustFermentationTime(temp, baseTime, baseTemp = 25) {
    // 온도 1°C 차이당 약 10% 시간 변화
    const tempDiff = temp - baseTemp
    const timeFactor = Math.pow(0.9, tempDiff)
    
    return Math.round(baseTime * timeFactor)
  }

  /**
   * 온도에 따른 이스트량 조정
   * @param {number} temp - 현재 온도 (°C)
   * @param {number} yeastAmount - 원본 이스트량 (g)
   * @returns {number} 조정된 이스트량 (g)
   */
  static adjustYeastForTemperature(temp, yeastAmount) {
    // 기준 온도: 25°C
    const baseTemp = 25
    const tempDiff = temp - baseTemp
    
    // 온도가 높으면 이스트 감소, 낮으면 증가
    // 5°C 차이당 약 15% 조정
    const adjustmentFactor = 1 - (tempDiff * 0.03)
    
    return Math.round(yeastAmount * adjustmentFactor * 100) / 100
  }

  /**
   * 종합 환경 보정
   * @param {Object} recipe - 원본 레시피
   * @param {Object} environment - 환경 정보 {temp, humidity, altitude}
   * @returns {Object} 보정된 레시피
   */
  static adjustRecipeForEnvironment(recipe, environment) {
    const { temp, humidity, altitude } = environment
    const adjustedRecipe = JSON.parse(JSON.stringify(recipe)) // Deep copy
    
    // 고도 보정
    const altitudeAdj = this.getAltitudeAdjustments(altitude)
    
    adjustedRecipe.ingredients.forEach(ingredient => {
      // 밀가루류
      if (ingredient.type === 'flour') {
        ingredient.amount *= altitudeAdj.flour
        ingredient.amount = this.adjustFlourForHumidity(humidity, ingredient.amount)
      }
      
      // 액체류
      else if (ingredient.type === 'liquid') {
        ingredient.amount *= altitudeAdj.liquid
        ingredient.amount = this.adjustLiquidForHumidity(humidity, ingredient.amount)
      }
      
      // 이스트
      else if (ingredient.type === 'yeast') {
        ingredient.amount *= altitudeAdj.yeast
        ingredient.amount = this.adjustYeastForTemperature(temp, ingredient.amount)
      }
      
      // 설탕류
      else if (ingredient.type === 'sugar') {
        ingredient.amount *= altitudeAdj.sugar
      }
    })
    
    // 온도 조정
    if (adjustedRecipe.bakingTemp) {
      adjustedRecipe.bakingTemp += altitudeAdj.temperature
    }
    
    // 시간 조정
    if (adjustedRecipe.fermentationTime) {
      adjustedRecipe.fermentationTime = this.adjustFermentationTime(
        temp,
        adjustedRecipe.fermentationTime
      )
      adjustedRecipe.fermentationTime *= altitudeAdj.time
    }
    
    if (adjustedRecipe.bakingTime) {
      adjustedRecipe.bakingTime *= altitudeAdj.time
    }
    
    // 보정 내역 추가
    adjustedRecipe.adjustments = {
      altitude: altitudeAdj,
      temperature: {
        yeastAdjustment: this.adjustYeastForTemperature(temp, 1),
        fermentationTimeAdjustment: this.adjustFermentationTime(temp, 100) / 100
      },
      humidity: {
        flourAdjustment: this.adjustFlourForHumidity(humidity, 100) / 100,
        liquidAdjustment: this.adjustLiquidForHumidity(humidity, 100) / 100
      }
    }
    
    return adjustedRecipe
  }

  /**
   * 환경 조건 평가
   * @param {Object} environment - 환경 정보
   * @returns {Object} 평가 결과 및 권장사항
   */
  static evaluateEnvironment(environment) {
    const { temp, humidity, altitude } = environment
    const evaluation = {
      overall: 'normal',
      warnings: [],
      recommendations: []
    }

    // 온도 평가
    if (temp < 18) {
      evaluation.warnings.push('온도가 너무 낮습니다')
      evaluation.recommendations.push('발효 시간을 늘리거나 따뜻한 곳에서 발효하세요')
    } else if (temp > 30) {
      evaluation.warnings.push('온도가 너무 높습니다')
      evaluation.recommendations.push('찬물을 사용하고 발효 시간을 줄이세요')
    }

    // 습도 평가
    if (humidity < 30) {
      evaluation.warnings.push('습도가 너무 낮습니다')
      evaluation.recommendations.push('반죽에 수분을 추가하고 건조를 방지하세요')
    } else if (humidity > 80) {
      evaluation.warnings.push('습도가 너무 높습니다')
      evaluation.recommendations.push('밀가루를 추가하고 발효 시간을 조정하세요')
    }

    // 고도 평가
    if (altitude > 900) {
      evaluation.warnings.push('고지대 환경입니다')
      evaluation.recommendations.push('레시피가 자동으로 고도에 맞게 조정됩니다')
    }

    if (evaluation.warnings.length > 0) {
      evaluation.overall = 'caution'
    }

    return evaluation
  }

  /**
   * 계절별 기본 환경 설정
   * @param {string} season - 계절
   * @param {string} region - 지역 (optional)
   * @returns {Object} 예상 환경 조건
   */
  static getSeasonalDefaults(season, region = 'temperate') {
    const seasonalData = {
      spring: { temp: 20, humidity: 55 },
      summer: { temp: 28, humidity: 70 },
      fall: { temp: 18, humidity: 50 },
      winter: { temp: 15, humidity: 40 }
    }

    const regionalAdjustments = {
      tropical: { temp: +5, humidity: +15 },
      desert: { temp: +3, humidity: -20 },
      coastal: { temp: 0, humidity: +10 },
      mountain: { temp: -5, humidity: -5 }
    }

    const baseData = seasonalData[season] || seasonalData.spring
    const adjustment = regionalAdjustments[region] || { temp: 0, humidity: 0 }

    return {
      temp: baseData.temp + adjustment.temp,
      humidity: baseData.humidity + adjustment.humidity,
      altitude: region === 'mountain' ? 1500 : 0
    }
  }
}

export default Environmental