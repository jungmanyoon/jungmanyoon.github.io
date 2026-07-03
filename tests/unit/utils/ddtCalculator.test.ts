import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DDTCalculator, MixerType } from '@utils/calculations/ddtCalculator'
import { expectApproximately } from '@/test/utils/test-utils'

describe('DDTCalculator', () => {
  beforeEach(() => {
    // 현재 날짜를 고정하여 일관된 계절 테스트
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15')) // 여름으로 고정
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('calculateWaterTemp', () => {
    it('기본 DDT 공식으로 물 온도를 올바르게 계산해야 한다', () => {
      // DDT = (밀가루온도 + 실온 + 물온도 + 마찰계수) / 3
      // 목표: 25°C, 밀가루: 20°C, 실온: 22°C, 마찰계수: 24°C
      // 물온도 = (25 × 3) - 20 - 22 - 24 = 9°C
      
      const waterTemp = DDTCalculator.calculateWaterTemp(25, 20, 22, 24)
      expect(waterTemp).toBe(9)
    })

    it('마찰계수가 없을 때 섭씨 기본값 8을 사용해야 한다', () => {
      // C-5 정합: 섭씨 전용 공식이므로 기본 마찰계수도 섭씨 stand(8)
      const waterTemp = DDTCalculator.calculateWaterTemp(25, 20, 22)
      const expectedTemp = (25 * 3) - 20 - 22 - 8
      expect(waterTemp).toBe(expectedTemp)
    })

    it('소수점 첫째 자리까지 반올림해야 한다', () => {
      const waterTemp = DDTCalculator.calculateWaterTemp(25.5, 20.3, 22.7, 24.2)
      expect(waterTemp).toBe(9.3)
    })
  })

  describe('calculateWaterTempWithPreferment', () => {
    it('프리퍼먼트가 있을 때 물 온도를 올바르게 계산해야 한다', () => {
      // DDT = (밀가루 + 실온 + 물 + 프리퍼먼트 + 마찰계수) / 4
      // 목표: 25°C, 밀가루: 20°C, 실온: 22°C, 프리퍼먼트: 18°C, 마찰계수: 24°C
      // 물온도 = (25 × 4) - 20 - 22 - 18 - 24 = 16°C
      
      const temps = { flour: 20, room: 22, preferment: 18 }
      const waterTemp = DDTCalculator.calculateWaterTempWithPreferment(25, temps, 24)
      expect(waterTemp).toBe(16)
    })

    it('프리퍼먼트가 없으면 기본 계산을 사용해야 한다', () => {
      const temps = { flour: 20, room: 22 }
      const waterTemp = DDTCalculator.calculateWaterTempWithPreferment(25, temps, 24)
      const expectedTemp = DDTCalculator.calculateWaterTemp(25, 20, 22, 24)
      expect(waterTemp).toBe(expectedTemp)
    })
  })

  describe('calculateIceAmount', () => {
    it('현재 물 온도가 목표 온도보다 높을 때 얼음량을 계산해야 한다', () => {
      const result = DDTCalculator.calculateIceAmount(1000, 30, 10)
      
      expect(result.ice).toBeGreaterThan(0)
      expect(result.water).toBeLessThan(1000)
      expect(result.ice + result.water).toBe(1000)
      expect(result.percentage).toBeGreaterThan(0)
    })

    it('현재 물 온도가 목표 온도 이하일 때 얼음이 필요 없어야 한다', () => {
      const result = DDTCalculator.calculateIceAmount(1000, 10, 15)
      
      expect(result.ice).toBe(0)
      expect(result.water).toBe(1000)
      expect(result.percentage).toBe(0)
    })

    it('같은 온도일 때 얼음이 필요 없어야 한다', () => {
      const result = DDTCalculator.calculateIceAmount(1000, 20, 20)
      
      expect(result.ice).toBe(0)
      expect(result.water).toBe(1000)
      expect(result.percentage).toBe(0)
    })
  })

  describe('predictDoughTemp', () => {
    it('반죽 온도를 예측해야 한다', () => {
      const temps = { flour: 20, water: 15, room: 22 }
      const mixingTime = 10
      const mixerType: MixerType = 'stand'
      
      const predictedTemp = DDTCalculator.predictDoughTemp(temps, mixingTime, mixerType)

      // C-5 정합: 섭씨 마찰계수(stand=8) -> avg(20,15,22) + 8/3 = 19 + 2.67 = 21.7°C
      expectApproximately(predictedTemp, 21.7, 1)
    })

    it('믹싱 시간에 따라 마찰계수가 조정되어야 한다', () => {
      const temps = { flour: 20, water: 15, room: 22 }
      
      const shortMixing = DDTCalculator.predictDoughTemp(temps, 5, 'stand')
      const longMixing = DDTCalculator.predictDoughTemp(temps, 20, 'stand')
      
      expect(longMixing).toBeGreaterThan(shortMixing)
    })

    it('프리퍼먼트가 있을 때 온도 예측에 포함되어야 한다', () => {
      const temps = { flour: 20, water: 15, room: 22, preferment: 18 }
      const predictedTemp = DDTCalculator.predictDoughTemp(temps, 10, 'stand')

      // C-5 정합: 섭씨 마찰계수(stand=8) -> avg(20,15,22,18) + 8/4 = 18.75 + 2 = 20.75°C
      expectApproximately(predictedTemp, 20.8, 1)
    })
  })

  describe('FRICTION_FACTORS', () => {
    it('모든 믹서 타입에 대한 마찰계수가 정의되어야 한다', () => {
      const mixerTypes: MixerType[] = ['hand', 'stand', 'spiral', 'planetary', 'intensive']
      
      mixerTypes.forEach(type => {
        expect(DDTCalculator.FRICTION_FACTORS[type]).toBeDefined()
        expect(typeof DDTCalculator.FRICTION_FACTORS[type]).toBe('number')
      })
    })

    it('고속 믹서일수록 마찰계수가 높아야 한다', () => {
      expect(DDTCalculator.FRICTION_FACTORS.hand)
        .toBeLessThan(DDTCalculator.FRICTION_FACTORS.stand)
      expect(DDTCalculator.FRICTION_FACTORS.stand)
        .toBeLessThan(DDTCalculator.FRICTION_FACTORS.intensive)
    })
  })

  describe('calculate', () => {
    const mockState = {
      targetTemp: 25,
      flourTemp: 20,
      roomTemp: 22,
      frictionFactor: 24,
      includePreferment: false
    }

    it('DDT 계산 결과를 생성해야 한다', () => {
      const result = DDTCalculator.calculate(mockState)
      
      expect(result.waterTemp).toBeDefined()
      expect(Array.isArray(result.warnings)).toBe(true)
      expect(Array.isArray(result.recommendations)).toBe(true)
    })

    it('물 온도가 0°C 이하일 때 경고를 표시해야 한다', () => {
      const stateWithLowTemp = {
        ...mockState,
        targetTemp: 15, // 매우 낮은 목표 온도
        flourTemp: 30,
        roomTemp: 30
      }
      
      const result = DDTCalculator.calculate(stateWithLowTemp)
      
      expect(result.warnings).toContain('계산된 물 온도가 0°C 이하입니다. 얼음을 사용해야 합니다.')
      expect(result.recommendations).toContain('얼음과 찬물을 혼합하여 사용하세요.')
    })

    it('물 온도가 40°C 초과일 때 경고를 표시해야 한다', () => {
      const stateWithHighTemp = {
        ...mockState,
        targetTemp: 35, // 높은 목표 온도
        flourTemp: 10,
        roomTemp: 10
      }
      
      const result = DDTCalculator.calculate(stateWithHighTemp)
      
      expect(result.warnings).toContain('물 온도가 40°C를 초과합니다. 이스트 활성에 영향을 줄 수 있습니다.')
      expect(result.recommendations).toContain('물 온도를 35-38°C로 조정하는 것을 권장합니다.')
    })

    it('프리퍼먼트 포함 계산이 올바르게 작동해야 한다', () => {
      const stateWithPreferment = {
        ...mockState,
        includePreferment: true,
        prefermentTemp: 18
      }
      
      const result = DDTCalculator.calculate(stateWithPreferment)
      
      expect(result.waterTemp).toBeDefined()
      expect(typeof result.waterTemp).toBe('number')
    })

    it('계절별 권장 온도와 차이가 클 때 권장사항을 제시해야 한다', () => {
      // 현재 여름(6월)으로 설정되어 있고, 권장 온도는 23°C
      const stateWithDifferentTemp = {
        ...mockState,
        targetTemp: 30 // 권장보다 7°C 높음
      }
      
      const result = DDTCalculator.calculate(stateWithDifferentTemp)
      
      expect(result.recommendations.some(rec => 
        rec.includes('현재 계절') && rec.includes('권장 DDT')
      )).toBe(true)
    })
  })

  describe('validateTemperatures', () => {
    it('정상 온도 범위에서 유효성 검증을 통과해야 한다', () => {
      const normalTemps = { flour: 20, room: 22, water: 15, preferment: 18 }
      const validation = DDTCalculator.validateTemperatures(normalTemps)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('비정상적인 밀가루 온도에서 에러를 반환해야 한다', () => {
      const abnormalTemps = { flour: 60, room: 22 } // 너무 높은 밀가루 온도
      const validation = DDTCalculator.validateTemperatures(abnormalTemps)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('밀가루 온도가 비정상적입니다. (-20°C ~ 50°C)')
    })

    it('비정상적인 실온에서 에러를 반환해야 한다', () => {
      const abnormalTemps = { flour: 20, room: 50 } // 너무 높은 실온
      const validation = DDTCalculator.validateTemperatures(abnormalTemps)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('실온이 비정상적입니다. (-10°C ~ 45°C)')
    })

    it('비정상적인 물 온도에서 에러를 반환해야 한다', () => {
      const abnormalTemps = { flour: 20, room: 22, water: 110 } // 끓는점 초과
      const validation = DDTCalculator.validateTemperatures(abnormalTemps)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('물 온도가 비정상적입니다. (0°C ~ 100°C)')
    })

    it('비정상적인 프리퍼먼트 온도에서 에러를 반환해야 한다', () => {
      const abnormalTemps = { flour: 20, room: 22, preferment: 50 } // 너무 높음
      const validation = DDTCalculator.validateTemperatures(abnormalTemps)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('프리퍼먼트 온도가 비정상적입니다. (0°C ~ 40°C)')
    })
  })

  describe('recommendFrictionFactor', () => {
    it('믹서 타입에 따른 기본 마찰계수를 반환해야 한다', () => {
      const factor = DDTCalculator.recommendFrictionFactor('stand', 10, 70)
      expect(factor).toBe(24) // 기본값
    })

    it('긴 믹싱 시간에 마찰계수가 증가해야 한다', () => {
      const normalTime = DDTCalculator.recommendFrictionFactor('stand', 10, 70)
      const longTime = DDTCalculator.recommendFrictionFactor('stand', 20, 70)
      
      expect(longTime).toBeGreaterThan(normalTime)
    })

    it('짧은 믹싱 시간에 마찰계수가 감소해야 한다', () => {
      const normalTime = DDTCalculator.recommendFrictionFactor('stand', 10, 70)
      const shortTime = DDTCalculator.recommendFrictionFactor('stand', 3, 70)
      
      expect(shortTime).toBeLessThan(normalTime)
    })

    it('높은 수화율에 마찰계수가 감소해야 한다', () => {
      const normalHydration = DDTCalculator.recommendFrictionFactor('stand', 10, 70)
      const highHydration = DDTCalculator.recommendFrictionFactor('stand', 10, 80)
      
      expect(highHydration).toBeLessThan(normalHydration)
    })

    it('낮은 수화율에 마찰계수가 증가해야 한다', () => {
      const normalHydration = DDTCalculator.recommendFrictionFactor('stand', 10, 70)
      const lowHydration = DDTCalculator.recommendFrictionFactor('stand', 10, 55)
      
      expect(lowHydration).toBeGreaterThan(normalHydration)
    })

    it('마찰계수가 0 미만이 되지 않아야 한다', () => {
      const factor = DDTCalculator.recommendFrictionFactor('hand', 3, 80) // 모든 조건이 감소
      expect(factor).toBeGreaterThanOrEqual(0)
    })
  })

  describe('generateCalculation', () => {
    it('DDT 계산 데이터를 올바르게 생성해야 한다', () => {
      const calculation = DDTCalculator.generateCalculation(25, 20, 22, 15, 24)

      expect(calculation).toEqual({
        targetTemp: 25,
        flourTemp: 20,
        roomTemp: 22,
        waterTemp: 15,
        frictionFactor: 24
      })
    })
  })

  describe('predictDoughTemp - 믹서 종류별 비교', () => {
    it('마찰열이 높은 믹서일수록 예측 반죽 온도가 높아야 한다', () => {
      const temps = { flour: 20, water: 10, room: 22 }

      const handMixTemp = DDTCalculator.predictDoughTemp(temps, 10, 'hand')
      const standMixTemp = DDTCalculator.predictDoughTemp(temps, 10, 'stand')
      const intensiveMixTemp = DDTCalculator.predictDoughTemp(temps, 10, 'intensive')

      expect(handMixTemp).toBeLessThan(standMixTemp)
      expect(standMixTemp).toBeLessThan(intensiveMixTemp)
    })
  })

  describe('calculateIceAmount - 비율 범위', () => {
    it('얼음 비율이 0%와 100% 사이여야 한다', () => {
      const result = DDTCalculator.calculateIceAmount(1000, 25, 5)
      expect(result.percentage).toBeGreaterThan(0)
      expect(result.percentage).toBeLessThan(100)
    })
  })

  describe('FRICTION_FACTORS - 논리 순서', () => {
    it('spiral < stand < planetary < intensive 순서를 가져야 한다', () => {
      expect(DDTCalculator.FRICTION_FACTORS['hand']).toBe(0)
      expect(DDTCalculator.FRICTION_FACTORS['spiral']).toBeLessThan(DDTCalculator.FRICTION_FACTORS['stand'])
      expect(DDTCalculator.FRICTION_FACTORS['stand']).toBeLessThan(DDTCalculator.FRICTION_FACTORS['planetary'])
      expect(DDTCalculator.FRICTION_FACTORS['planetary']).toBeLessThan(DDTCalculator.FRICTION_FACTORS['intensive'])
    })
  })

  describe('FRICTION_FACTORS_CELSIUS (C-5 결함 수정)', () => {
    it('모든 믹서 타입에 대한 섭씨 마찰열이 정의되어야 한다', () => {
      const mixerTypes: MixerType[] = ['hand', 'stand', 'spiral', 'planetary', 'intensive']

      mixerTypes.forEach(type => {
        expect(DDTCalculator.FRICTION_FACTORS_CELSIUS[type]).toBeDefined()
        expect(DDTCalculator.FRICTION_FACTORS_CELSIUS[type]).toBeGreaterThanOrEqual(0)
      })
    })

    it('손반죽 섭씨 마찰열은 0이어야 한다', () => {
      expect(DDTCalculator.FRICTION_FACTORS_CELSIUS['hand']).toBe(0)
    })

    it('섭씨 마찰열은 실측 권장 범위(stand 6~9, intensive 11~14) 내여야 한다', () => {
      // 제빵 이론(Hamelman, SFBI) 실측 기준 섭씨 마찰열 범위
      expect(DDTCalculator.FRICTION_FACTORS_CELSIUS['stand']).toBeGreaterThanOrEqual(6)
      expect(DDTCalculator.FRICTION_FACTORS_CELSIUS['stand']).toBeLessThanOrEqual(9)
      expect(DDTCalculator.FRICTION_FACTORS_CELSIUS['intensive']).toBeGreaterThanOrEqual(11)
      expect(DDTCalculator.FRICTION_FACTORS_CELSIUS['intensive']).toBeLessThanOrEqual(14)
    })

    it('섭씨 마찰열이 화씨 값보다 작아야 한다(과대 마찰열 방지)', () => {
      const mixerTypes: MixerType[] = ['stand', 'spiral', 'planetary', 'intensive']
      mixerTypes.forEach(type => {
        expect(DDTCalculator.FRICTION_FACTORS_CELSIUS[type])
          .toBeLessThan(DDTCalculator.FRICTION_FACTORS[type])
      })
    })

    it('섭씨 마찰열을 적용하면 여름철에도 물 온도가 비현실적 음수가 아니어야 한다', () => {
      // 여름철 시나리오: 목표 24°C, 밀가루 25°C, 실온 28°C, 스탠드 믹서(섭씨 8°C)
      const summerFriction = DDTCalculator.FRICTION_FACTORS_CELSIUS['stand']
      const waterTemp = DDTCalculator.calculateWaterTemp(24, 25, 28, summerFriction)
      // (24 * 3) - 25 - 28 - 8 = 72 - 61 = 11 (얼음 없이 실현 가능)
      expect(waterTemp).toBe(11)
      expect(waterTemp).toBeGreaterThan(0)
    })
  })

  describe('recommendFrictionFactorCelsius (C-5 결함 수정)', () => {
    it('손반죽은 항상 0을 반환해야 한다', () => {
      expect(DDTCalculator.recommendFrictionFactorCelsius('hand', 30, 90)).toBe(0)
    })

    it('스탠드 믹서 기본 섭씨 마찰열을 반환해야 한다', () => {
      const friction = DDTCalculator.recommendFrictionFactorCelsius('stand', 10, 65)
      expect(friction).toBe(DDTCalculator.FRICTION_FACTORS_CELSIUS['stand'])
    })

    it('긴 믹싱 시간에서 마찰열을 증가시켜야 한다', () => {
      const shortMix = DDTCalculator.recommendFrictionFactorCelsius('stand', 5, 65)
      const longMix = DDTCalculator.recommendFrictionFactorCelsius('stand', 20, 65)
      expect(longMix).toBeGreaterThan(shortMix)
    })

    it('높은 수화율에서 마찰열을 감소시켜야 한다', () => {
      const lowHydration = DDTCalculator.recommendFrictionFactorCelsius('stand', 10, 55)
      const highHydration = DDTCalculator.recommendFrictionFactorCelsius('stand', 10, 80)
      expect(highHydration).toBeLessThan(lowHydration)
    })

    it('반환값이 0 미만이 되지 않아야 한다', () => {
      const friction = DDTCalculator.recommendFrictionFactorCelsius('spiral', 3, 90)
      expect(friction).toBeGreaterThanOrEqual(0)
    })
  })

  describe('SEASONAL_DDT', () => {
    it('모든 계절에 대한 권장 DDT가 정의되어야 한다', () => {
      const seasons = ['spring', 'summer', 'autumn', 'winter']

      seasons.forEach(season => {
        expect(DDTCalculator.SEASONAL_DDT[season]).toBeDefined()
        expect(DDTCalculator.SEASONAL_DDT[season]).toBeGreaterThan(20)
        expect(DDTCalculator.SEASONAL_DDT[season]).toBeLessThan(30)
      })
    })

    it('여름이 가장 낮고 겨울이 가장 높아야 한다', () => {
      expect(DDTCalculator.SEASONAL_DDT['summer']).toBeLessThan(DDTCalculator.SEASONAL_DDT['spring'])
      expect(DDTCalculator.SEASONAL_DDT['summer']).toBeLessThan(DDTCalculator.SEASONAL_DDT['winter'])
      expect(DDTCalculator.SEASONAL_DDT['winter']).toBeGreaterThan(DDTCalculator.SEASONAL_DDT['autumn'])
    })
  })
})