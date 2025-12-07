import { describe, it, expect, beforeEach } from 'vitest'
import { BakersPercentage } from '@utils/calculations/bakersPercentage'
import { Ingredient } from '@types/recipe.types'
import { createMockRecipe } from '@/test/utils/test-utils'

describe('BakersPercentage', () => {
  let mockIngredients: Ingredient[]
  
  beforeEach(() => {
    const mockRecipe = createMockRecipe()
    mockIngredients = mockRecipe.ingredients
  })

  describe('toBakersPercentage', () => {
    it('밀가루 기준으로 베이커스 퍼센트를 올바르게 계산해야 한다', () => {
      const flourAmount = 500
      const result = BakersPercentage.toBakersPercentage(mockIngredients, flourAmount)
      
      expect(result).toHaveLength(2)
      
      // 밀가루는 100%
      const flour = result.find(ing => ing.name === '강력분')
      expect(flour?.percentage).toBe(100)
      expect(flour?.isBakersPercentage).toBe(true)
      
      // 물은 70% (350g / 500g * 100)
      const water = result.find(ing => ing.name === '물')
      expect(water?.percentage).toBe(70)
      expect(water?.isBakersPercentage).toBe(true)
    })

    it('밀가루 양이 0이거나 음수일 때 에러를 던져야 한다', () => {
      expect(() => BakersPercentage.toBakersPercentage(mockIngredients, 0))
        .toThrow('밀가루 양은 0보다 커야 합니다.')
      
      expect(() => BakersPercentage.toBakersPercentage(mockIngredients, -100))
        .toThrow('밀가루 양은 0보다 커야 합니다.')
    })
  })

  describe('toActualWeight', () => {
    it('베이커스 퍼센트를 실제 무게로 올바르게 변환해야 한다', () => {
      const flourAmount = 500
      const bakersIngredients = BakersPercentage.toBakersPercentage(mockIngredients, flourAmount)
      const targetFlourAmount = 1000
      
      const result = BakersPercentage.toActualWeight(bakersIngredients, targetFlourAmount)
      
      const flour = result.find(ing => ing.name === '강력분')
      expect(flour?.amount).toBe(1000) // 100% of 1000g
      expect(flour?.calculatedAmount).toBe(true)
      
      const water = result.find(ing => ing.name === '물')
      expect(water?.amount).toBe(700) // 70% of 1000g
      expect(water?.calculatedAmount).toBe(true)
    })
  })

  describe('calculateTotalWeight', () => {
    it('모든 재료의 총 무게를 올바르게 계산해야 한다', () => {
      const totalWeight = BakersPercentage.calculateTotalWeight(mockIngredients)
      expect(totalWeight).toBe(850) // 500g(flour) + 350g(water)
    })

    it('빈 배열의 경우 0을 반환해야 한다', () => {
      const totalWeight = BakersPercentage.calculateTotalWeight([])
      expect(totalWeight).toBe(0)
    })
  })

  describe('calculateHydration', () => {
    it('수화율을 올바르게 계산해야 한다', () => {
      const hydration = BakersPercentage.calculateHydration(mockIngredients)
      expect(hydration).toBe(70) // 350ml water / 500g flour * 100
    })

    it('밀가루가 없는 경우 0을 반환해야 한다', () => {
      const noFlourIngredients = mockIngredients.filter(ing => ing.category !== 'flour')
      const hydration = BakersPercentage.calculateHydration(noFlourIngredients)
      expect(hydration).toBe(0)
    })
  })

  describe('getTotalFlour', () => {
    it('밀가루 총량을 올바르게 계산해야 한다', () => {
      const flourTotal = BakersPercentage.getTotalFlour(mockIngredients)
      expect(flourTotal).toBe(500)
    })

    it('isFlour 속성이 true인 재료도 포함해야 한다', () => {
      const ingredientsWithCustomFlour = [
        ...mockIngredients,
        {
          id: 'custom-flour',
          name: '호밀가루',
          category: 'other' as const,
          amount: 100,
          unit: 'g' as const,
          isFlour: true
        }
      ]
      
      const flourTotal = BakersPercentage.getTotalFlour(ingredientsWithCustomFlour)
      expect(flourTotal).toBe(600) // 500g + 100g
    })
  })

  describe('getTotalLiquid', () => {
    it('액체 총량을 올바르게 계산해야 한다', () => {
      const liquidTotal = BakersPercentage.getTotalLiquid(mockIngredients)
      expect(liquidTotal).toBe(350)
    })

    it('계란류도 액체로 계산해야 한다', () => {
      const ingredientsWithEgg = [
        ...mockIngredients,
        {
          id: 'egg',
          name: '계란',
          category: 'egg' as const,
          amount: 100,
          unit: 'g' as const
        }
      ]
      
      const liquidTotal = BakersPercentage.getTotalLiquid(ingredientsWithEgg)
      expect(liquidTotal).toBe(450) // 350ml + 100g
    })
  })

  describe('scaleRecipe', () => {
    it('레시피를 올바른 비율로 스케일링해야 한다', () => {
      const scaleFactor = 2
      const scaledIngredients = BakersPercentage.scaleRecipe(mockIngredients, scaleFactor)
      
      const flour = scaledIngredients.find(ing => ing.name === '강력분')
      expect(flour?.amount).toBe(1000) // 500g * 2
      
      const water = scaledIngredients.find(ing => ing.name === '물')
      expect(water?.amount).toBe(700) // 350ml * 2
    })

    it('스케일 팩터가 0 이하일 때 에러를 던져야 한다', () => {
      expect(() => BakersPercentage.scaleRecipe(mockIngredients, 0))
        .toThrow('스케일 팩터는 0보다 커야 합니다.')
      
      expect(() => BakersPercentage.scaleRecipe(mockIngredients, -1))
        .toThrow('스케일 팩터는 0보다 커야 합니다.')
    })
  })

  describe('adjustToYield', () => {
    it('목표 생산량에 맞춰 레시피를 조정해야 한다', () => {
      const currentYield = 2
      const targetYield = 6
      
      const adjustedIngredients = BakersPercentage.adjustToYield(
        mockIngredients, 
        currentYield, 
        targetYield
      )
      
      const flour = adjustedIngredients.find(ing => ing.name === '강력분')
      expect(flour?.amount).toBe(1500) // 500g * 3
      
      const water = adjustedIngredients.find(ing => ing.name === '물')
      expect(water?.amount).toBe(1050) // 350ml * 3
    })
  })

  describe('adjustByPieceWeight', () => {
    it('개당 중량으로 레시피를 조정해야 한다', () => {
      const targetPieceWeight = 300 // 300g per piece
      const targetQuantity = 4 // 4 pieces
      // Target total: 1200g
      // Current total: 850g
      // Scale factor: 1200/850 ≈ 1.41
      
      const adjustedIngredients = BakersPercentage.adjustByPieceWeight(
        mockIngredients,
        targetPieceWeight,
        targetQuantity
      )
      
      const totalWeight = BakersPercentage.calculateTotalWeight(adjustedIngredients)
      expect(Math.round(totalWeight)).toBe(1200)
    })
  })

  describe('generateCalculation', () => {
    it('베이커스 퍼센트 계산 결과를 생성해야 한다', () => {
      const flourAmount = 500
      const calculation = BakersPercentage.generateCalculation(mockIngredients, flourAmount)
      
      expect(calculation.totalFlour).toBe(500)
      expect(calculation.ingredients).toHaveLength(2)
      expect(calculation.hydration).toBe(70)
      expect(calculation.totalPercentage).toBe(170) // 100% flour + 70% water
      
      const flourIngredient = calculation.ingredients.find(ing => ing.name === '강력분')
      expect(flourIngredient?.percentage).toBe(100)
      
      const waterIngredient = calculation.ingredients.find(ing => ing.name === '물')
      expect(waterIngredient?.percentage).toBe(70)
    })
  })

  describe('validateRatios', () => {
    it('정상적인 비율에서는 경고가 없어야 한다', () => {
      const normalIngredients = [
        {
          id: 'flour',
          name: '강력분',
          category: 'flour' as const,
          amount: 500,
          unit: 'g' as const,
          percentage: 100,
          isBakersPercentage: true
        },
        {
          id: 'water',
          name: '물',
          category: 'liquid' as const,
          amount: 350,
          unit: 'ml' as const,
          percentage: 70,
          isBakersPercentage: true
        },
        {
          id: 'salt',
          name: '소금',
          category: 'salt' as const,
          amount: 10,
          unit: 'g' as const,
          percentage: 2,
          isBakersPercentage: true
        },
        {
          id: 'yeast',
          name: '드라이이스트',
          category: 'leavening' as const,
          amount: 5,
          unit: 'g' as const,
          percentage: 1,
          isBakersPercentage: true
        }
      ]
      
      const validation = BakersPercentage.validateRatios(normalIngredients)
      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(0)
    })

    it('낮은 수화율에서 경고를 표시해야 한다', () => {
      const lowHydrationIngredients = [
        {
          id: 'flour',
          name: '강력분',
          category: 'flour' as const,
          amount: 500,
          unit: 'g' as const,
          percentage: 100,
          isBakersPercentage: true
        },
        {
          id: 'water',
          name: '물',
          category: 'liquid' as const,
          amount: 200, // 40% hydration
          unit: 'ml' as const,
          percentage: 40,
          isBakersPercentage: true
        }
      ]
      
      const validation = BakersPercentage.validateRatios(lowHydrationIngredients)
      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('수화율이 50% 미만입니다. 매우 단단한 반죽이 될 수 있습니다.')
    })

    it('높은 소금 비율에서 경고를 표시해야 한다', () => {
      const highSaltIngredients = [
        {
          id: 'flour',
          name: '강력분',
          category: 'flour' as const,
          amount: 500,
          unit: 'g' as const,
          percentage: 100,
          isBakersPercentage: true
        },
        {
          id: 'salt',
          name: '소금',
          category: 'salt' as const,
          amount: 20, // 4% salt
          unit: 'g' as const,
          percentage: 4,
          isBakersPercentage: true
        }
      ]
      
      const validation = BakersPercentage.validateRatios(highSaltIngredients)
      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toContain('소금 비율이 높습니다. 짠맛이 강할 수 있습니다.')
    })
  })
})