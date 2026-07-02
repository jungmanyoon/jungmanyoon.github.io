/**
 * DDT (Desired Dough Temperature) 계산 모듈
 * 목표 반죽 온도를 달성하기 위한 물 온도 계산
 */

import { DDTCalculation } from '@/types/recipe.types'
import { DDTState, DDTResult } from '@/types/store.types'

export type MixerType = 'hand' | 'stand' | 'spiral' | 'planetary' | 'intensive'

interface IceCalculation {
  ice: number
  water: number
  percentage: number
}

interface TemperatureInputs {
  flour: number
  room: number
  water?: number
  preferment?: number
}

export class DDTCalculator {
  /**
   * 마찰계수 (Friction Factor) - 화씨(°F) 기준 전통 베이커리 표준값
   * 출처: King Arthur Baking, SFBI(샌프란시스코 베이킹 인스티튜트) 표준.
   *       이 값들은 화씨 DDT 공식(목표온도*믹서수 - (실온+밀가루+물+마찰))에서 쓰는 °F 마찰열이다.
   * 주의: 본 상수는 predictDoughTemp / recommendFrictionFactor 등 화씨 기반 보조 계산용이며,
   *       섭씨 물온도 DDT 공식에 그대로 대입하면 마찰열이 과대 적용된다(C-5 결함).
   *       섭씨 물온도 계산에는 아래 FRICTION_FACTORS_CELSIUS 를 사용할 것.
   * hand 은 손반죽으로 기계 마찰열이 없어 0(체온 영향은 별도 effectiveFriction 로직에서 처리).
   */
  static readonly FRICTION_FACTORS: Record<MixerType, number> = {
    'hand': 0,           // 손반죽 (기계 마찰열 없음)
    'spiral': 22,        // 스파이럴 믹서
    'stand': 24,         // 스탠드 믹서
    'planetary': 26,     // 플래니터리 믹서
    'intensive': 30      // 고속 믹서
  }

  /**
   * 섭씨(°C) 마찰열 - 섭씨 DDT 물온도 공식 전용 (C-5 결함 수정용)
   * 근거: 화씨 마찰계수를 섭씨 "온도차"로 환산하면 delta°C = delta°F / 1.8 이다.
   *       (마찰계수는 절대온도가 아니라 믹싱으로 더해지는 온도 상승분이므로 32 오프셋은 적용하지 않음)
   *       stand 24°F / 1.8 ~= 13.3°C 이지만, 실측 제빵 이론(Hamelman, SFBI)에서
   *       가정용 스탠드/스파이럴 믹서의 실제 반죽 온도 상승은 7~9°C 수준으로 보고된다.
   *       여름철(실온 28°C, 밀가루 25°C)에도 물온도가 비현실적 음수로 떨어지지 않도록
   *       실측 하한값을 채택한다.
   *       hand 0~1, spiral/stand 6~9, intensive 11~14 권장 범위 내에서 결정.
   */
  static readonly FRICTION_FACTORS_CELSIUS: Record<MixerType, number> = {
    'hand': 0,           // 손반죽 (기계 마찰열 없음)
    'spiral': 7,         // 스파이럴 믹서 (저속, 마찰열 낮음)
    'stand': 8,          // 스탠드 믹서 (가정용 표준)
    'planetary': 9,      // 플래니터리 믹서
    'intensive': 12      // 고속/인텐시브 믹서
  }

  /**
   * 계절별 권장 DDT 온도
   */
  static readonly SEASONAL_DDT: Record<string, number> = {
    'spring': 25,    // 봄
    'summer': 23,    // 여름 (낮게 설정)
    'autumn': 25,    // 가을
    'winter': 27     // 겨울 (높게 설정)
  }

  /**
   * 물 온도 계산 (기본 DDT 공식)
   */
  static calculateWaterTemp(
    targetTemp: number,
    flourTemp: number,
    roomTemp: number,
    frictionFactor: number = 8   // 섭씨 전용 공식: 기본값도 섭씨 stand(8). 화씨 24 유입 방지
  ): number {
    // DDT = (밀가루 온도 + 실온 + 물 온도 + 마찰계수) / 3
    // 물 온도 = (DDT × 3) - 밀가루 온도 - 실온 - 마찰계수
    const waterTemp = (targetTemp * 3) - flourTemp - roomTemp - frictionFactor
    
    return Math.round(waterTemp * 10) / 10
  }

  /**
   * 프리퍼먼트가 있는 경우 물 온도 계산
   */
  static calculateWaterTempWithPreferment(
    targetTemp: number,
    temps: TemperatureInputs,
    frictionFactor: number = 8   // 섭씨 전용 공식: 기본값도 섭씨 stand(8)
  ): number {
    const { flour, room, preferment } = temps
    
    if (!preferment) {
      return this.calculateWaterTemp(targetTemp, flour, room, frictionFactor)
    }
    
    // DDT = (밀가루 + 실온 + 물 + 프리퍼먼트 + 마찰계수) / 4
    const waterTemp = (targetTemp * 4) - flour - room - preferment - frictionFactor
    
    return Math.round(waterTemp * 10) / 10
  }

  /**
   * 얼음 필요량 계산
   * 열평형 방정식 기반 정밀 계산
   */
  static calculateIceAmount(
    totalWater: number,
    currentWaterTemp: number,
    targetWaterTemp: number
  ): IceCalculation {
    if (currentWaterTemp <= targetWaterTemp) {
      return { ice: 0, water: totalWater, percentage: 0 }
    }

    // 물리 상수 (kcal/kg 기준)
    const ICE_SPECIFIC_HEAT = 0.5    // 얼음 비열: 0.5 kcal/kg·°C
    const WATER_SPECIFIC_HEAT = 1.0  // 물 비열: 1.0 kcal/kg·°C
    const MELTING_HEAT = 80          // 융해열: 80 kcal/kg
    const ICE_TEMP = -10             // 얼음 초기 온도 (°C)

    // 열평형 방정식:
    // 물이 잃는 열 = 얼음이 얻는 열
    // m_w × C_w × (T_water - T_target) = m_i × [C_i × |T_ice| + L + C_w × T_target]
    const waterCooling = WATER_SPECIFIC_HEAT * (currentWaterTemp - targetWaterTemp)
    const iceHeating = ICE_SPECIFIC_HEAT * Math.abs(ICE_TEMP) + MELTING_HEAT + WATER_SPECIFIC_HEAT * targetWaterTemp

    const iceRatio = waterCooling / (waterCooling + iceHeating)

    const iceAmount = Math.round(totalWater * iceRatio)
    const waterAmount = totalWater - iceAmount

    return {
      ice: iceAmount,
      water: waterAmount,
      percentage: Math.round(iceRatio * 100)
    }
  }

  /**
   * 반죽 최종 온도 예측
   */
  static predictDoughTemp(
    temps: TemperatureInputs, 
    mixingTime: number, 
    mixerType: MixerType = 'stand'
  ): number {
    const { flour, water = 20, room, preferment } = temps
    // 입력 온도(flour/water/room)는 섭씨이므로 섭씨 마찰상수를 사용해야 한다(C-5 정합).
    // 화씨 상수(FRICTION_FACTORS)를 쓰면 예측 반죽온도가 약 5°C 과대 산출된다.
    // `?? 8`: hand의 0을 falsy로 삼켜 24로 대체되던 버그(`|| 24`)도 함께 제거.
    const frictionFactor = this.FRICTION_FACTORS_CELSIUS[mixerType] ?? 8

    // 손반죽은 마찰계수 0 고정
    const effectiveFriction = mixerType === 'hand' ? 0 : frictionFactor

    // 시간에 따른 마찰계수 조정
    const adjustedFriction = effectiveFriction * (mixingTime / 10)

    const ingredients = [flour, water, room]
    if (preferment) ingredients.push(preferment)

    const avg = ingredients.reduce((acc, temp) => acc + temp, 0) / ingredients.length
    const predictedTemp = avg + (adjustedFriction / ingredients.length)

    return Math.round(predictedTemp * 10) / 10
  }

  /**
   * DDT 계산 실행 및 결과 생성
   */
  static calculate(state: DDTState): DDTResult {
    const { 
      targetTemp, 
      flourTemp, 
      roomTemp, 
      prefermentTemp, 
      frictionFactor,
      includePreferment 
    } = state

    let waterTemp: number
    const warnings: string[] = []
    const recommendations: string[] = []

    // 물 온도 계산
    if (includePreferment && prefermentTemp) {
      waterTemp = this.calculateWaterTempWithPreferment(
        targetTemp,
        { flour: flourTemp, room: roomTemp, preferment: prefermentTemp },
        frictionFactor
      )
    } else {
      waterTemp = this.calculateWaterTemp(
        targetTemp, 
        flourTemp, 
        roomTemp, 
        frictionFactor
      )
    }

    // 물 온도 검증 및 경고
    if (waterTemp < 0) {
      warnings.push('계산된 물 온도가 0°C 이하입니다. 얼음을 사용해야 합니다.')
      recommendations.push('얼음과 찬물을 혼합하여 사용하세요.')
    } else if (waterTemp < 5) {
      warnings.push('물 온도가 매우 낮습니다. 냉장 보관된 물을 사용하세요.')
    } else if (waterTemp > 40) {
      warnings.push('물 온도가 40°C를 초과합니다. 이스트 활성에 영향을 줄 수 있습니다.')
      recommendations.push('물 온도를 35-38°C로 조정하는 것을 권장합니다.')
    }

    // 계절별 권장사항
    const currentMonth = new Date().getMonth()
    const season = this.getCurrentSeason(currentMonth)
    const recommendedDDT = this.SEASONAL_DDT[season]
    
    if (Math.abs(targetTemp - recommendedDDT) > 3) {
      recommendations.push(
        `현재 계절(${season}) 권장 DDT는 ${recommendedDDT}°C입니다.`
      )
    }

    // 조정된 물 온도 (실용적 범위로 제한)
    const adjustedWaterTemp = Math.max(0, Math.min(38, waterTemp))

    return {
      waterTemp,
      adjustedWaterTemp: waterTemp !== adjustedWaterTemp ? adjustedWaterTemp : undefined,
      warnings,
      recommendations
    }
  }

  /**
   * DDT 계산 데이터 생성
   */
  static generateCalculation(
    targetTemp: number,
    flourTemp: number,
    roomTemp: number,
    waterTemp: number,
    frictionFactor: number
  ): DDTCalculation {
    return {
      targetTemp,
      flourTemp,
      roomTemp,
      waterTemp,
      frictionFactor
    }
  }

  /**
   * 온도 검증
   */
  static validateTemperatures(temps: TemperatureInputs): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (temps.flour < -20 || temps.flour > 50) {
      errors.push('밀가루 온도가 비정상적입니다. (-20°C ~ 50°C)')
    }
    
    if (temps.room < -10 || temps.room > 45) {
      errors.push('실온이 비정상적입니다. (-10°C ~ 45°C)')
    }
    
    if (temps.water !== undefined && (temps.water < 0 || temps.water > 100)) {
      errors.push('물 온도가 비정상적입니다. (0°C ~ 100°C)')
    }
    
    if (temps.preferment !== undefined && (temps.preferment < 0 || temps.preferment > 40)) {
      errors.push('프리퍼먼트 온도가 비정상적입니다. (0°C ~ 40°C)')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 현재 계절 판단
   */
  private static getCurrentSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  /**
   * 마찰계수 추천
   */
  static recommendFrictionFactor(
    mixerType: MixerType,
    mixingTime: number,
    doughHydration: number
  ): number {
    if (mixerType === 'hand') return 0
    let baseFactor = this.FRICTION_FACTORS[mixerType]
    
    // 믹싱 시간에 따른 조정
    if (mixingTime > 15) {
      baseFactor += 2
    } else if (mixingTime < 5) {
      baseFactor -= 2
    }
    
    // 수화율에 따른 조정
    if (doughHydration > 75) {
      baseFactor -= 1 // 높은 수화율은 마찰 감소
    } else if (doughHydration < 60) {
      baseFactor += 1 // 낮은 수화율은 마찰 증가
    }

    return Math.max(0, baseFactor)
  }

  /**
   * 섭씨 마찰계수 추천 (섭씨 물온도 DDT 공식 전용, C-5 결함 수정)
   * recommendFrictionFactor 와 동일한 보정 로직을 쓰되, 화씨 상수 대신 섭씨 상수를 기준으로 한다.
   * 화씨 보정폭(+-2, +-1)도 섭씨 스케일(약 1/1.8)로 축소하여 적용한다.
   */
  static recommendFrictionFactorCelsius(
    mixerType: MixerType,
    mixingTime: number,
    doughHydration: number
  ): number {
    if (mixerType === 'hand') return 0
    let baseFactor = this.FRICTION_FACTORS_CELSIUS[mixerType]

    // 믹싱 시간에 따른 조정 (섭씨 스케일: +-1°C)
    if (mixingTime > 15) {
      baseFactor += 1
    } else if (mixingTime < 5) {
      baseFactor -= 1
    }

    // 수화율에 따른 조정 (섭씨 스케일: +-0.5°C)
    if (doughHydration > 75) {
      baseFactor -= 0.5 // 높은 수화율은 마찰 감소
    } else if (doughHydration < 60) {
      baseFactor += 0.5 // 낮은 수화율은 마찰 증가
    }

    return Math.max(0, Math.round(baseFactor * 10) / 10)
  }
}