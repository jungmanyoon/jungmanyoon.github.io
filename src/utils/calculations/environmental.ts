export interface Environment {
  temp: number
  humidity: number
  altitude: number
}

/**
 * 이스트 조정 옵션 인터페이스
 */
export interface YeastAdjustmentOptions {
  baseYeast: number           // 기준 이스트량 (g)
  methodType?: string         // 제법 타입 (straight, poolish, coldFerment 등)
  methodYeastRatio?: number   // 제법별 이스트 비율 (0~1)
  temperature?: number        // 실제 온도 (°C)
  humidity?: number           // 습도 (%)
  altitude?: number           // 고도 (m)
  fermentationHours?: number  // 저온발효 시간 (시간)
  baseTemp?: number           // 기준 온도 (기본 26°C)
}

/**
 * 이스트 조정 결과 인터페이스
 */
export interface YeastAdjustmentResult {
  adjustedYeast: number       // 최종 조정된 이스트량
  factors: {
    method: number            // 제법 계수
    temperature: number       // 온도 계수
    humidity: number          // 습도 계수
    altitude: number          // 고도 계수
    coldFerment: number       // 저온발효 시간 계수
  }
  totalFactor: number         // 총 조정 계수
  explanation: string[]       // 조정 이유 설명
}

export class EnvironmentalTS {
  static calculatePressure(altitude: number): number {
    // 단순 모델 (kPa)
    return Math.round((101.325 * Math.exp(-altitude / 8434)) * 100) / 100
  }

  static calculateBoilingPoint(altitude: number): number {
    // 기압에 따른 물 끓는점 근사(°C)
    const pressure = this.calculatePressure(altitude)
    return Math.round((49.161 * Math.log(pressure) + 44.932) * 10) / 10
  }

  static adjustFlourForHumidity(humidity: number, flourAmount: number): number {
    if (humidity <= 40) return Math.round((flourAmount * 1.02) * 100) / 100
    if (humidity >= 70) return Math.round((flourAmount * 0.98) * 100) / 100
    return flourAmount
  }

  static adjustLiquidForHumidity(humidity: number, liquidAmount: number): number {
    if (humidity <= 40) return Math.round((liquidAmount * 1.02) * 100) / 100
    if (humidity >= 70) return Math.round((liquidAmount * 0.98) * 100) / 100
    return liquidAmount
  }

  /**
   * 온도에 따른 이스트 조정
   * - 기준 온도(26°C)보다 높으면 감량 (발효 빨라짐)
   * - 기준 온도보다 낮으면 증량 (발효 느려짐)
   * - 제빵 법칙: 온도 10°C 변화 → 발효 속도 약 2배
   */
  static adjustYeastForTemperature(temp: number, yeastAmount: number, baseTemp: number = 26): number {
    const diff = temp - baseTemp
    // 온도가 높으면 발효가 빨라지므로 이스트 감량 필요
    // 온도가 낮으면 발효가 느려지므로 이스트 증량 필요
    const factor = diff > 0
      ? Math.pow(0.93, diff / 5)   // 5°C 상승 시 ~7% 감량
      : Math.pow(1.08, Math.abs(diff) / 5)  // 5°C 하강 시 ~8% 증량
    return Math.round(yeastAmount * factor * 100) / 100
  }

  /**
   * 온도 조정 계수만 반환 (통합 계산용)
   */
  static getTemperatureFactor(temp: number, baseTemp: number = 26): number {
    const diff = temp - baseTemp
    return diff > 0
      ? Math.pow(0.93, diff / 5)
      : Math.pow(1.08, Math.abs(diff) / 5)
  }

  /**
   * 고도에 따른 이스트 조정
   * - 고도가 높을수록 기압이 낮아 발효가 빨라짐
   * - 900m 이상부터 감량 시작
   */
  static adjustYeastForAltitude(altitude: number, yeastAmount: number): number {
    const factor = this.getAltitudeFactor(altitude)
    return Math.round(yeastAmount * factor * 100) / 100
  }

  /**
   * 고도 조정 계수 반환
   */
  static getAltitudeFactor(altitude: number): number {
    if (altitude < 900) return 1.0
    if (altitude >= 2100) return 0.75  // -25%
    if (altitude >= 1500) return 0.80  // -20%
    if (altitude >= 900) return 0.92   // -8%
    return 1.0
  }

  /**
   * 습도에 따른 이스트 조정
   * - 습도가 높으면 발효 촉진 → 이스트 약간 감량
   * - 습도가 낮으면 발효 억제 → 이스트 약간 증량
   */
  static adjustYeastForHumidity(humidity: number, yeastAmount: number): number {
    const factor = this.getHumidityFactor(humidity)
    return Math.round(yeastAmount * factor * 100) / 100
  }

  /**
   * 습도 조정 계수 반환
   */
  static getHumidityFactor(humidity: number): number {
    if (humidity <= 40) return 1.05   // +5%
    if (humidity >= 70) return 0.95   // -5%
    return 1.0
  }

  /**
   * 저온발효 시간에 따른 이스트 감량 계수
   * - 냉장고(4-6°C)에서 장시간 발효 시 이스트 대폭 감량 필요
   */
  static getColdFermentFactor(hours: number, temp: number = 4): number {
    if (hours <= 0) return 1.0

    // 온도별 기본 감량 계수
    const tempBase = temp <= 4 ? 0.30 : temp <= 6 ? 0.35 : 0.40

    // 시간별 추가 조정
    if (hours <= 12) return tempBase + 0.15        // 12시간 이하: 45-55%
    if (hours <= 24) return tempBase + 0.05        // 12-24시간: 35-45%
    if (hours <= 48) return tempBase               // 24-48시간: 30-40%
    return tempBase - 0.05                         // 48시간 이상: 25-35%
  }

  /**
   * 통합 이스트 조정 계산
   * - 제법, 온도, 습도, 고도, 저온발효 시간을 모두 고려
   * - 중복 계산 방지 (저온발효 제법은 환경 온도 조정 제외)
   */
  static calculateIntegratedYeastAdjustment(options: YeastAdjustmentOptions): YeastAdjustmentResult {
    const {
      baseYeast,
      methodType = 'straight',
      methodYeastRatio = 1.0,
      temperature = 26,
      humidity = 55,
      altitude = 0,
      fermentationHours = 0,
      baseTemp = 26
    } = options

    const explanation: string[] = []

    // 1. 제법 계수 (저온발효 제법인 경우 별도 처리)
    const isColdFermentMethod = methodType === 'coldFerment' || methodType === 'retard'
    const methodFactor = methodYeastRatio
    if (methodFactor !== 1.0) {
      explanation.push(`제법(${methodType}): ${Math.round(methodFactor * 100)}%`)
    }

    // 2. 온도 계수 (저온발효 제법일 때는 환경 온도 조정 제외 - 중복 방지)
    let tempFactor = 1.0
    if (!isColdFermentMethod) {
      tempFactor = this.getTemperatureFactor(temperature, baseTemp)
      if (Math.abs(tempFactor - 1.0) > 0.01) {
        const percent = Math.round((tempFactor - 1) * 100)
        explanation.push(`온도(${temperature}°C): ${percent >= 0 ? '+' : ''}${percent}%`)
      }
    } else {
      explanation.push(`저온발효 제법: 환경 온도 조정 제외`)
    }

    // 3. 습도 계수
    const humidityFactor = this.getHumidityFactor(humidity)
    if (humidityFactor !== 1.0) {
      const percent = Math.round((humidityFactor - 1) * 100)
      explanation.push(`습도(${humidity}%): ${percent >= 0 ? '+' : ''}${percent}%`)
    }

    // 4. 고도 계수
    const altitudeFactor = this.getAltitudeFactor(altitude)
    if (altitudeFactor !== 1.0) {
      const percent = Math.round((altitudeFactor - 1) * 100)
      explanation.push(`고도(${altitude}m): ${percent}%`)
    }

    // 5. 저온발효 시간 계수 (저온발효 제법일 때만)
    let coldFermentFactor = 1.0
    if (isColdFermentMethod && fermentationHours > 0) {
      coldFermentFactor = this.getColdFermentFactor(fermentationHours, temperature)
      const percent = Math.round((coldFermentFactor - 1) * 100)
      explanation.push(`저온발효(${fermentationHours}h): ${percent}%`)
    }

    // 총 계수 계산 (제법 계수와 환경 계수는 독립적으로 적용)
    const environmentFactor = tempFactor * humidityFactor * altitudeFactor
    const totalFactor = isColdFermentMethod
      ? coldFermentFactor * humidityFactor * altitudeFactor  // 저온발효는 전용 계수 사용
      : methodFactor * environmentFactor                      // 일반 제법

    const adjustedYeast = Math.round(baseYeast * totalFactor * 100) / 100

    return {
      adjustedYeast,
      factors: {
        method: methodFactor,
        temperature: tempFactor,
        humidity: humidityFactor,
        altitude: altitudeFactor,
        coldFerment: coldFermentFactor
      },
      totalFactor: Math.round(totalFactor * 1000) / 1000,
      explanation
    }
  }

  static adjustRecipeForEnvironment(recipe: any, environment: Environment) {
    const { temp, humidity, altitude } = environment
    const adjusted = JSON.parse(JSON.stringify(recipe))
    const pressure = this.calculatePressure(altitude)
    const boilingPoint = this.calculateBoilingPoint(altitude)

    adjusted.ingredients.forEach((ing: any) => {
      if (ing.type === 'flour') {
        ing.amount = this.adjustFlourForHumidity(humidity, ing.amount)
      } else if (ing.type === 'liquid') {
        ing.amount = this.adjustLiquidForHumidity(humidity, ing.amount)
      } else if (ing.type === 'yeast') {
        ing.amount = this.adjustYeastForTemperature(temp, ing.amount)
      }
    })

    if (adjusted.bakingTemp) {
      adjusted.bakingTemp = Math.round((adjusted.bakingTemp + (altitude > 1000 ? 10 : 0)) * 10) / 10
    }
    if (adjusted.bakingTime) {
      adjusted.bakingTime = Math.round(adjusted.bakingTime * (altitude > 1000 ? 1.1 : 1))
    }

    adjusted.adjustments = {
      temperature: { pressure, boilingPoint },
      humidity: { humidity },
      altitude: { altitude }
    }

    return adjusted
  }
}

export default EnvironmentalTS

