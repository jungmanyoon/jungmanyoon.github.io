/**
 * DDT (Desired Dough Temperature) 계산 모듈
 * 목표 반죽 온도를 달성하기 위한 물 온도 계산
 */

import { DDTCalculation } from '@types/recipe.types'
import { DDTState, DDTResult } from '@types/store.types'

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
   * 기본 마찰계수 (Friction Factor)
   * 믹서 종류별 평균값 (°F 기준, 섭씨 환산 시 약 60% 값)
   * 참고: King Arthur Baking, SFBI 표준
   */
  static readonly FRICTION_FACTORS: Record<MixerType, number> = {
    'hand': 4,           // 손반죽 (체온 + 약간의 마찰열)
    'stand': 24,         // 스탠드 믹서
    'spiral': 22,        // 스파이럴 믹서
    'planetary': 26,     // 플래니터리 믹서
    'intensive': 30      // 고속 믹서
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
    frictionFactor: number = 24
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
    frictionFactor: number = 24
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
    const frictionFactor = this.FRICTION_FACTORS[mixerType] || 24

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
}