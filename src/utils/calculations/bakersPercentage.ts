/**
 * 베이커스 퍼센트 계산 모듈
 * 모든 재료를 밀가루 대비 백분율로 표현하는 제빵 업계 표준 방식
 */

import { 
  Ingredient, 
  BakersPercentageCalculation,
  RecipeYield 
} from '@types/recipe.types'
import { 
  BakersPercentageResult,
  CalculatorIngredient 
} from '@types/store.types'
import { calculateMoisture, isLiquidIngredient } from '../data/ingredientMoisture'

interface BakersIngredient extends Ingredient {
  percentage?: number
  isBakersPercentage?: boolean
  calculatedAmount?: boolean
}

export class BakersPercentage {
  /**
   * 재료 목록을 베이커스 퍼센트로 변환
   */
  static toBakersPercentage(
    ingredients: Ingredient[], 
    flourAmount: number
  ): BakersIngredient[] {
    if (!flourAmount || flourAmount <= 0) {
      throw new Error('밀가루 양은 0보다 커야 합니다.')
    }

    return ingredients.map(ingredient => ({
      ...ingredient,
      percentage: (ingredient.amount / flourAmount) * 100,
      isBakersPercentage: true
    }))
  }

  /**
   * 베이커스 퍼센트를 실제 무게로 변환
   */
  static toActualWeight(
    ingredients: BakersIngredient[], 
    targetFlourAmount: number
  ): BakersIngredient[] {
    return ingredients.map(ingredient => ({
      ...ingredient,
      amount: (ingredient.percentage! / 100) * targetFlourAmount,
      calculatedAmount: true
    }))
  }

  /**
   * 레시피 총량 계산
   */
  static calculateTotalWeight(ingredients: Ingredient[]): number {
    return ingredients.reduce((total, ingredient) => {
      return total + (ingredient.amount || 0)
    }, 0)
  }

  /**
   * 수화율(Hydration) 계산
   */
  static calculateHydration(ingredients: Ingredient[]): number {
    const flourAmount = this.getTotalFlour(ingredients)
    const liquidAmount = this.getTotalLiquid(ingredients)
    
    if (flourAmount === 0) return 0
    return (liquidAmount / flourAmount) * 100
  }

  /**
   * 밀가루 총량 계산
   */
  static getTotalFlour(ingredients: Ingredient[]): number {
    return ingredients
      .filter(ingredient => 
        ingredient.category === 'flour' || 
        ingredient.isFlour === true
      )
      .reduce((total, ingredient) => total + (ingredient.amount || 0), 0)
  }

  /**
   * 액체 총량 계산
   */
  static getTotalLiquid(ingredients: Ingredient[]): number {
    return ingredients
      .filter(ingredient => 
        ingredient.category === 'liquid' || 
        ingredient.category === 'egg'
      )
      .reduce((total, ingredient) => total + (ingredient.amount || 0), 0)
  }

  /**
   * 실제 수분량 계산 (재료의 수분 함량 고려)
   */
  static getTotalMoisture(ingredients: Ingredient[]): number {
    return ingredients.reduce((total, ingredient) => {
      const amount = ingredient.amount || 0
      const moisture = calculateMoisture(ingredient.name, amount)
      return total + moisture
    }, 0)
  }

  /**
   * 레시피 스케일링 (비율 유지하며 크기 조정)
   */
  static scaleRecipe(
    ingredients: Ingredient[], 
    scaleFactor: number
  ): Ingredient[] {
    if (scaleFactor <= 0) {
      throw new Error('스케일 팩터는 0보다 커야 합니다.')
    }

    return ingredients.map(ingredient => ({
      ...ingredient,
      amount: ingredient.amount * scaleFactor
    }))
  }

  /**
   * 목표 생산량에 맞춰 레시피 조정
   */
  static adjustToYield(
    ingredients: Ingredient[],
    currentYield: number,
    targetYield: number
  ): Ingredient[] {
    const scaleFactor = targetYield / currentYield
    return this.scaleRecipe(ingredients, scaleFactor)
  }

  /**
   * 개당 중량으로 레시피 조정
   */
  static adjustByPieceWeight(
    ingredients: Ingredient[],
    targetPieceWeight: number,
    targetQuantity: number
  ): Ingredient[] {
    const currentTotal = this.calculateTotalWeight(ingredients)
    const targetTotal = targetPieceWeight * targetQuantity
    const scaleFactor = targetTotal / currentTotal
    
    return this.scaleRecipe(ingredients, scaleFactor)
  }

  /**
   * 베이커스 퍼센트 계산 결과 생성
   */
  static generateCalculation(
    ingredients: Ingredient[],
    flourAmount: number
  ): BakersPercentageCalculation {
    const withPercentages = this.toBakersPercentage(ingredients, flourAmount)
    const totalWeight = this.calculateTotalWeight(ingredients)
    const hydration = this.calculateHydration(ingredients)
    const totalPercentage = withPercentages.reduce(
      (sum, ing) => sum + (ing.percentage || 0), 
      0
    )

    return {
      totalFlour: flourAmount,
      ingredients: withPercentages.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        percentage: ing.percentage || 0
      })),
      totalPercentage,
      hydration
    }
  }

  /**
   * 계산기용 결과 생성
   */
  static generateCalculatorResult(
    ingredients: CalculatorIngredient[],
    flourAmount: number
  ): BakersPercentageResult {
    const totalWeight = ingredients.reduce(
      (sum, ing) => sum + ing.amount, 
      0
    )
    const liquidIngredients = ingredients.filter(ing => ing.isLiquid)
    const liquidAmount = liquidIngredients.reduce(
      (sum, ing) => sum + ing.amount, 
      0
    )
    const hydration = flourAmount > 0 ? (liquidAmount / flourAmount) * 100 : 0

    return {
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        percentage: ing.percentage
      })),
      totalWeight,
      hydration,
      yield: totalWeight
    }
  }

  /**
   * 재료 비율 검증
   */
  static validateRatios(ingredients: BakersIngredient[]): {
    isValid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []
    const hydration = this.calculateHydration(ingredients)
    
    // 수화율 검증
    if (hydration < 50) {
      warnings.push('수화율이 50% 미만입니다. 매우 단단한 반죽이 될 수 있습니다.')
    } else if (hydration > 100) {
      warnings.push('수화율이 100%를 초과합니다. 매우 묽은 반죽이 될 수 있습니다.')
    }
    
    // 소금 비율 검증
    const saltIngredient = ingredients.find(ing => 
      ing.name.toLowerCase().includes('소금') || 
      ing.name.toLowerCase().includes('salt')
    )
    if (saltIngredient && saltIngredient.percentage) {
      if (saltIngredient.percentage < 1.5) {
        warnings.push('소금 비율이 낮습니다. 맛이 싱거울 수 있습니다.')
      } else if (saltIngredient.percentage > 3) {
        warnings.push('소금 비율이 높습니다. 짠맛이 강할 수 있습니다.')
      }
    }
    
    // 이스트 비율 검증
    const yeastIngredient = ingredients.find(ing => 
      ing.name.toLowerCase().includes('이스트') || 
      ing.name.toLowerCase().includes('yeast')
    )
    if (yeastIngredient && yeastIngredient.percentage) {
      if (yeastIngredient.percentage < 0.5) {
        warnings.push('이스트 비율이 낮습니다. 발효 시간이 길어질 수 있습니다.')
      } else if (yeastIngredient.percentage > 3) {
        warnings.push('이스트 비율이 높습니다. 이스트 향이 강할 수 있습니다.')
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    }
  }
}