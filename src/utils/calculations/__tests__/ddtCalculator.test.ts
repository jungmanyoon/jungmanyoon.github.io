/**
 * DDTCalculator 단위 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { DDTCalculator, MixerType } from '../ddtCalculator'
import { DDTState } from '@types/store.types'

describe('DDTCalculator', () => {
  describe('calculateWaterTemp', () => {
    it('기본 DDT 공식으로 물 온도를 정확하게 계산해야 함', () => {
      const waterTemp = DDTCalculator.calculateWaterTemp(25, 20, 22, 24)
      // (25 * 3) - 20 - 22 - 24 = 75 - 66 = 9
      expect(waterTemp).toBe(9)
    })

    it('여름철 시나리오에서 낮은 물 온도를 계산해야 함', () => {
      const waterTemp = DDTCalculator.calculateWaterTemp(23, 25, 28, 24)
      // (23 * 3) - 25 - 28 - 24 = 69 - 77 = -8
      expect(waterTemp).toBe(-8)
    })

    it('겨울철 시나리오에서 높은 물 온도를 계산해야 함', () => {
      const waterTemp = DDTCalculator.calculateWaterTemp(27, 15, 18, 24)
      // (27 * 3) - 15 - 18 - 24 = 81 - 57 = 24
      expect(waterTemp).toBe(24)
    })
  })

  describe('calculateWaterTempWithPreferment', () => {
    it('프리퍼먼트가 있을 때 물 온도를 정확하게 계산해야 함', () => {
      const temps = { flour: 20, room: 22, preferment: 25 }
      const waterTemp = DDTCalculator.calculateWaterTempWithPreferment(25, temps, 24)
      // (25 * 4) - 20 - 22 - 25 - 24 = 100 - 91 = 9
      expect(waterTemp).toBe(9)
    })

    it('프리퍼먼트가 없으면 기본 계산을 사용해야 함', () => {
      const temps = { flour: 20, room: 22 }
      const waterTemp = DDTCalculator.calculateWaterTempWithPreferment(25, temps, 24)
      // 기본 계산과 동일: (25 * 3) - 20 - 22 - 24 = 9
      expect(waterTemp).toBe(9)
    })
  })

  describe('calculateIceAmount', () => {
    it('물 온도가 목표보다 낮으면 얼음이 필요 없어야 함', () => {
      const result = DDTCalculator.calculateIceAmount(1000, 15, 20)
      expect(result.ice).toBe(0)
      expect(result.water).toBe(1000)
      expect(result.percentage).toBe(0)
    })

    it('물 온도가 목표보다 높으면 얼음 양을 계산해야 함', () => {
      const result = DDTCalculator.calculateIceAmount(1000, 30, 10)
      expect(result.ice).toBeGreaterThan(0)
      expect(result.water).toBeLessThan(1000)
      expect(result.ice + result.water).toBe(1000)
    })

    it('얼음과 물의 비율이 올바르게 계산되어야 함', () => {
      const result = DDTCalculator.calculateIceAmount(1000, 25, 5)
      const tempDiff = 25 - 5 // 20도 차이
      expect(result.percentage).toBeGreaterThan(0)
      expect(result.percentage).toBeLessThan(100)
    })
  })

  describe('predictDoughTemp', () => {
    it('반죽 최종 온도를 예측해야 함', () => {
      const temps = { flour: 20, water: 10, room: 22 }
      const predictedTemp = DDTCalculator.predictDoughTemp(temps, 10, 'stand')
      
      // 온도와 마찰계수를 고려한 예측
      expect(predictedTemp).toBeGreaterThan(0)
      expect(predictedTemp).toBeLessThan(30)
    })

    it('믹서 종류에 따라 다른 예측을 해야 함', () => {
      const temps = { flour: 20, water: 10, room: 22 }
      
      const handMixTemp = DDTCalculator.predictDoughTemp(temps, 10, 'hand')
      const standMixTemp = DDTCalculator.predictDoughTemp(temps, 10, 'stand')
      const intensiveMixTemp = DDTCalculator.predictDoughTemp(temps, 10, 'intensive')
      
      // 마찰계수가 높을수록 온도가 높아야 함
      expect(handMixTemp).toBeLessThan(standMixTemp)
      expect(standMixTemp).toBeLessThan(intensiveMixTemp)
    })

    it('믹싱 시간이 길수록 온도가 높아야 함', () => {
      const temps = { flour: 20, water: 10, room: 22 }
      
      const shortMix = DDTCalculator.predictDoughTemp(temps, 5, 'stand')
      const longMix = DDTCalculator.predictDoughTemp(temps, 15, 'stand')
      
      expect(shortMix).toBeLessThan(longMix)
    })
  })

  describe('calculate (전체 계산)', () => {
    it('정상적인 온도에서 경고가 없어야 함', () => {
      const state: DDTState = {
        targetTemp: 25,
        flourTemp: 20,
        roomTemp: 22,
        frictionFactor: 24,
        includePreferment: false,
        results: null
      }
      
      const result = DDTCalculator.calculate(state)
      
      expect(result.waterTemp).toBe(9)
      expect(result.warnings).toHaveLength(0)
    })

    it('매우 낮은 물 온도에 대해 경고해야 함', () => {
      const state: DDTState = {
        targetTemp: 20,
        flourTemp: 25,
        roomTemp: 28,
        frictionFactor: 24,
        includePreferment: false,
        results: null
      }
      
      const result = DDTCalculator.calculate(state)
      
      expect(result.waterTemp).toBeLessThan(0)
      expect(result.warnings).toContain('계산된 물 온도가 0°C 이하입니다. 얼음을 사용해야 합니다.')
    })

    it('높은 물 온도에 대해 경고해야 함', () => {
      const state: DDTState = {
        targetTemp: 35,
        flourTemp: 15,
        roomTemp: 15,
        frictionFactor: 24,
        includePreferment: false,
        results: null
      }
      
      const result = DDTCalculator.calculate(state)
      
      expect(result.waterTemp).toBeGreaterThan(40)
      expect(result.warnings).toContain('물 온도가 40°C를 초과합니다. 이스트 활성에 영향을 줄 수 있습니다.')
    })

    it('프리퍼먼트가 포함된 계산이 정확해야 함', () => {
      const state: DDTState = {
        targetTemp: 25,
        flourTemp: 20,
        roomTemp: 22,
        prefermentTemp: 24,
        frictionFactor: 24,
        includePreferment: true,
        results: null
      }
      
      const result = DDTCalculator.calculate(state)
      
      expect(result.waterTemp).toBeDefined()
      expect(result.warnings).toBeDefined()
      expect(result.recommendations).toBeDefined()
    })
  })

  describe('validateTemperatures', () => {
    it('정상 범위의 온도는 유효해야 함', () => {
      const temps = { flour: 20, room: 22, water: 15, preferment: 25 }
      const validation = DDTCalculator.validateTemperatures(temps)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('비정상적인 밀가루 온도를 감지해야 함', () => {
      const temps = { flour: -30, room: 22, water: 15 }
      const validation = DDTCalculator.validateTemperatures(temps)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('밀가루 온도가 비정상적입니다. (-20°C ~ 50°C)')
    })

    it('비정상적인 실온을 감지해야 함', () => {
      const temps = { flour: 20, room: 50, water: 15 }
      const validation = DDTCalculator.validateTemperatures(temps)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('실온이 비정상적입니다. (-10°C ~ 45°C)')
    })
  })

  describe('recommendFrictionFactor', () => {
    it('믹서 타입에 따른 기본 마찰계수를 반환해야 함', () => {
      const friction = DDTCalculator.recommendFrictionFactor('stand', 10, 65)
      expect(friction).toBe(24) // 스탠드 믹서 기본값
    })

    it('긴 믹싱 시간에서 마찰계수를 증가시켜야 함', () => {
      const shortMix = DDTCalculator.recommendFrictionFactor('stand', 5, 65)
      const longMix = DDTCalculator.recommendFrictionFactor('stand', 20, 65)
      
      expect(longMix).toBeGreaterThan(shortMix)
    })

    it('높은 수화율에서 마찰계수를 감소시켜야 함', () => {
      const lowHydration = DDTCalculator.recommendFrictionFactor('stand', 10, 55)
      const highHydration = DDTCalculator.recommendFrictionFactor('stand', 10, 80)
      
      expect(highHydration).toBeLessThan(lowHydration)
    })

    it('손반죽은 항상 0을 반환해야 함', () => {
      const friction = DDTCalculator.recommendFrictionFactor('hand', 30, 90)
      expect(friction).toBe(0)
    })
  })

  describe('FRICTION_FACTORS', () => {
    it('모든 믹서 타입에 대한 마찰계수가 정의되어야 함', () => {
      const mixerTypes: MixerType[] = ['hand', 'stand', 'spiral', 'planetary', 'intensive']
      
      mixerTypes.forEach(type => {
        expect(DDTCalculator.FRICTION_FACTORS[type]).toBeDefined()
        expect(DDTCalculator.FRICTION_FACTORS[type]).toBeGreaterThanOrEqual(0)
      })
    })

    it('마찰계수가 논리적인 순서를 가져야 함', () => {
      expect(DDTCalculator.FRICTION_FACTORS['hand']).toBe(0)
      expect(DDTCalculator.FRICTION_FACTORS['spiral']).toBeLessThan(DDTCalculator.FRICTION_FACTORS['stand'])
      expect(DDTCalculator.FRICTION_FACTORS['stand']).toBeLessThan(DDTCalculator.FRICTION_FACTORS['planetary'])
      expect(DDTCalculator.FRICTION_FACTORS['planetary']).toBeLessThan(DDTCalculator.FRICTION_FACTORS['intensive'])
    })
  })

  describe('SEASONAL_DDT', () => {
    it('모든 계절에 대한 권장 DDT가 정의되어야 함', () => {
      const seasons = ['spring', 'summer', 'autumn', 'winter']
      
      seasons.forEach(season => {
        expect(DDTCalculator.SEASONAL_DDT[season]).toBeDefined()
        expect(DDTCalculator.SEASONAL_DDT[season]).toBeGreaterThan(20)
        expect(DDTCalculator.SEASONAL_DDT[season]).toBeLessThan(30)
      })
    })

    it('여름이 가장 낮고 겨울이 가장 높아야 함', () => {
      expect(DDTCalculator.SEASONAL_DDT['summer']).toBeLessThan(DDTCalculator.SEASONAL_DDT['spring'])
      expect(DDTCalculator.SEASONAL_DDT['summer']).toBeLessThan(DDTCalculator.SEASONAL_DDT['winter'])
      expect(DDTCalculator.SEASONAL_DDT['winter']).toBeGreaterThan(DDTCalculator.SEASONAL_DDT['autumn'])
    })
  })
})