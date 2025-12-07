/**
 * BakersPercentage 단위 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BakersPercentage } from '../bakersPercentage'
import { Ingredient } from '@types/recipe.types'

describe('BakersPercentage', () => {
  let testIngredients: Ingredient[]

  beforeEach(() => {
    testIngredients = [
      {
        id: '1',
        name: '강력분',
        category: 'flour',
        amount: 1000,
        unit: 'g',
        isFlour: true
      },
      {
        id: '2',
        name: '물',
        category: 'liquid',
        amount: 650,
        unit: 'g'
      },
      {
        id: '3',
        name: '소금',
        category: 'salt',
        amount: 20,
        unit: 'g'
      },
      {
        id: '4',
        name: '이스트',
        category: 'leavening',
        amount: 10,
        unit: 'g'
      },
      {
        id: '5',
        name: '설탕',
        category: 'sugar',
        amount: 50,
        unit: 'g'
      }
    ]
  })

  describe('toBakersPercentage', () => {
    it('모든 재료를 베이커스 퍼센트로 올바르게 변환해야 함', () => {
      const result = BakersPercentage.toBakersPercentage(testIngredients, 1000)
      
      expect(result[0].percentage).toBe(100) // 밀가루
      expect(result[1].percentage).toBe(65)  // 물
      expect(result[2].percentage).toBe(2)   // 소금
      expect(result[3].percentage).toBe(1)   // 이스트
      expect(result[4].percentage).toBe(5)   // 설탕
    })

    it('밀가루 양이 0이면 에러를 발생시켜야 함', () => {
      expect(() => {
        BakersPercentage.toBakersPercentage(testIngredients, 0)
      }).toThrow('밀가루 양은 0보다 커야 합니다.')
    })

    it('음수 밀가루 양이면 에러를 발생시켜야 함', () => {
      expect(() => {
        BakersPercentage.toBakersPercentage(testIngredients, -100)
      }).toThrow('밀가루 양은 0보다 커야 합니다.')
    })
  })

  describe('toActualWeight', () => {
    it('베이커스 퍼센트를 실제 무게로 정확하게 변환해야 함', () => {
      const withPercentages = BakersPercentage.toBakersPercentage(testIngredients, 1000)
      const result = BakersPercentage.toActualWeight(withPercentages, 500)
      
      expect(result[0].amount).toBe(500)   // 밀가루
      expect(result[1].amount).toBe(325)   // 물
      expect(result[2].amount).toBe(10)    // 소금
      expect(result[3].amount).toBe(5)     // 이스트
      expect(result[4].amount).toBe(25)    // 설탕
    })
  })

  describe('calculateHydration', () => {
    it('수화율을 정확하게 계산해야 함', () => {
      const hydration = BakersPercentage.calculateHydration(testIngredients)
      expect(hydration).toBe(65) // 물 650g / 밀가루 1000g * 100
    })

    it('밀가루가 없으면 수화율은 0이어야 함', () => {
      const noFlour: Ingredient[] = [
        {
          id: '1',
          name: '물',
          category: 'liquid',
          amount: 100,
          unit: 'g'
        }
      ]
      const hydration = BakersPercentage.calculateHydration(noFlour)
      expect(hydration).toBe(0)
    })

    it('여러 종류의 밀가루와 액체를 고려해야 함', () => {
      const complexIngredients: Ingredient[] = [
        {
          id: '1',
          name: '강력분',
          category: 'flour',
          amount: 800,
          unit: 'g',
          isFlour: true
        },
        {
          id: '2',
          name: '박력분',
          category: 'flour',
          amount: 200,
          unit: 'g',
          isFlour: true
        },
        {
          id: '3',
          name: '물',
          category: 'liquid',
          amount: 500,
          unit: 'g'
        },
        {
          id: '4',
          name: '우유',
          category: 'liquid',
          amount: 200,
          unit: 'g'
        }
      ]
      const hydration = BakersPercentage.calculateHydration(complexIngredients)
      expect(hydration).toBe(70) // (500+200) / (800+200) * 100
    })
  })

  describe('calculateTotalWeight', () => {
    it('총 중량을 정확하게 계산해야 함', () => {
      const total = BakersPercentage.calculateTotalWeight(testIngredients)
      expect(total).toBe(1730) // 1000 + 650 + 20 + 10 + 50
    })

    it('빈 배열에서는 0을 반환해야 함', () => {
      const total = BakersPercentage.calculateTotalWeight([])
      expect(total).toBe(0)
    })
  })

  describe('scaleRecipe', () => {
    it('레시피를 정확한 비율로 스케일링해야 함', () => {
      const scaled = BakersPercentage.scaleRecipe(testIngredients, 0.5)
      
      expect(scaled[0].amount).toBe(500)   // 밀가루
      expect(scaled[1].amount).toBe(325)   // 물
      expect(scaled[2].amount).toBe(10)    // 소금
      expect(scaled[3].amount).toBe(5)     // 이스트
      expect(scaled[4].amount).toBe(25)    // 설탕
    })

    it('스케일 팩터가 0이면 에러를 발생시켜야 함', () => {
      expect(() => {
        BakersPercentage.scaleRecipe(testIngredients, 0)
      }).toThrow('스케일 팩터는 0보다 커야 합니다.')
    })

    it('2배 스케일링이 정확해야 함', () => {
      const scaled = BakersPercentage.scaleRecipe(testIngredients, 2)
      
      expect(scaled[0].amount).toBe(2000)  // 밀가루
      expect(scaled[1].amount).toBe(1300)  // 물
      expect(scaled[2].amount).toBe(40)    // 소금
      expect(scaled[3].amount).toBe(20)    // 이스트
      expect(scaled[4].amount).toBe(100)   // 설탕
    })
  })

  describe('validateRatios', () => {
    it('정상적인 비율에서는 경고가 없어야 함', () => {
      const withPercentages = BakersPercentage.toBakersPercentage(testIngredients, 1000)
      const validation = BakersPercentage.validateRatios(withPercentages)
      
      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(0)
    })

    it('낮은 수화율에 대해 경고해야 함', () => {
      const dryIngredients: Ingredient[] = [
        {
          id: '1',
          name: '강력분',
          category: 'flour',
          amount: 1000,
          unit: 'g',
          isFlour: true
        },
        {
          id: '2',
          name: '물',
          category: 'liquid',
          amount: 400,
          unit: 'g'
        }
      ]
      
      const withPercentages = BakersPercentage.toBakersPercentage(dryIngredients, 1000)
      const validation = BakersPercentage.validateRatios(withPercentages)
      
      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('수화율이 50% 미만입니다. 매우 단단한 반죽이 될 수 있습니다.')
    })

    it('높은 수화율에 대해 경고해야 함', () => {
      const wetIngredients: Ingredient[] = [
        {
          id: '1',
          name: '강력분',
          category: 'flour',
          amount: 1000,
          unit: 'g',
          isFlour: true
        },
        {
          id: '2',
          name: '물',
          category: 'liquid',
          amount: 1200,
          unit: 'g'
        }
      ]
      
      const withPercentages = BakersPercentage.toBakersPercentage(wetIngredients, 1000)
      const validation = BakersPercentage.validateRatios(withPercentages)
      
      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('수화율이 100%를 초과합니다. 매우 묽은 반죽이 될 수 있습니다.')
    })
  })

  describe('adjustToYield', () => {
    it('목표 생산량에 맞춰 레시피를 조정해야 함', () => {
      const adjusted = BakersPercentage.adjustToYield(testIngredients, 10, 20)
      
      // 2배로 조정되어야 함
      expect(adjusted[0].amount).toBe(2000)  // 밀가루
      expect(adjusted[1].amount).toBe(1300)  // 물
    })
  })

  describe('adjustByPieceWeight', () => {
    it('개당 중량으로 레시피를 조정해야 함', () => {
      // 총 중량 1730g, 목표: 100g x 10개 = 1000g
      const adjusted = BakersPercentage.adjustByPieceWeight(testIngredients, 100, 10)
      const totalWeight = BakersPercentage.calculateTotalWeight(adjusted)
      
      expect(Math.round(totalWeight)).toBe(1000)
    })
  })
})