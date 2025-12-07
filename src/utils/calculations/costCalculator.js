/**
 * 원가 계산 엔진
 * 레시피의 재료비, 인건비, 간접비를 포함한 총 원가 계산
 */

import { getPriceInfo } from '../../data/costing/ingredientPrices.js'
import { getNutritionInfo } from '../../data/nutrition/ingredientNutrition.js'

export class CostCalculator {
  /**
   * 재료비 계산
   */
  static calculateIngredientCost(ingredients, options = {}) {
    const { 
      useWholesalePrice = false, 
      wasteFactor = 1.05, // 5% 손실률 기본값
      currency = 'KRW' 
    } = options

    const costBreakdown = {
      totalCost: 0,
      items: [],
      currency,
      wasteFactor,
      estimatedItems: []
    }

    ingredients.forEach(ingredient => {
      const priceInfo = getPriceInfo(ingredient.name, useWholesalePrice)
      const nutritionInfo = getNutritionInfo(ingredient.name)
      
      // 재료량을 구매 단위로 변환
      const costPerUnit = this.calculateCostPerUnit(
        ingredient.amount, 
        ingredient.unit, 
        priceInfo, 
        nutritionInfo
      )
      
      // 손실률 적용
      const adjustedCost = costPerUnit * wasteFactor

      const itemCost = {
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        pricePerUnit: priceInfo.currentPrice,
        priceUnit: priceInfo.unit,
        costPerActualAmount: costPerUnit,
        adjustedCost: adjustedCost,
        supplier: priceInfo.supplier,
        isEstimated: priceInfo.isEstimated || false
      }

      costBreakdown.items.push(itemCost)
      costBreakdown.totalCost += adjustedCost

      if (priceInfo.isEstimated) {
        costBreakdown.estimatedItems.push(ingredient.name)
      }
    })

    // 총 재료비 반올림
    costBreakdown.totalCost = Math.round(costBreakdown.totalCost)

    return costBreakdown
  }

  /**
   * 단위당 비용 계산
   */
  static calculateCostPerUnit(amount, unit, priceInfo, nutritionInfo) {
    const pricePerBaseUnit = priceInfo.currentPrice
    const priceUnit = priceInfo.unit

    // 가격 단위와 레시피 단위 변환
    let usageInPriceUnit = 0

    if (priceUnit === 'kg') {
      // 가격이 kg 기준일 때
      switch (unit) {
        case 'g':
          usageInPriceUnit = amount / 1000
          break
        case 'kg':
          usageInPriceUnit = amount
          break
        case 'oz':
          usageInPriceUnit = (amount * 28.35) / 1000
          break
        case 'lb':
          usageInPriceUnit = (amount * 453.59) / 1000
          break
        case 'ml':
        case 'L':
          const volumeInL = unit === 'L' ? amount : amount / 1000
          const density = nutritionInfo.density || 1.0
          usageInPriceUnit = volumeInL * density
          break
        case 'cup':
          usageInPriceUnit = (amount * 240 * (nutritionInfo.density || 1.0)) / 1000
          break
        case 'tbsp':
          usageInPriceUnit = (amount * 15 * (nutritionInfo.density || 1.0)) / 1000
          break
        case 'tsp':
          usageInPriceUnit = (amount * 5 * (nutritionInfo.density || 1.0)) / 1000
          break
        case '개':
          if (priceInfo.averageWeight) {
            usageInPriceUnit = (amount * priceInfo.averageWeight) / 1000
          } else {
            usageInPriceUnit = (amount * 50) / 1000 // 기본값 50g
          }
          break
        default:
          usageInPriceUnit = amount / 1000 // 기본값
      }
    } else if (priceUnit === 'L') {
      // 가격이 L 기준일 때
      switch (unit) {
        case 'ml':
          usageInPriceUnit = amount / 1000
          break
        case 'L':
          usageInPriceUnit = amount
          break
        case 'cup':
          usageInPriceUnit = (amount * 240) / 1000
          break
        case 'tbsp':
          usageInPriceUnit = (amount * 15) / 1000
          break
        case 'tsp':
          usageInPriceUnit = (amount * 5) / 1000
          break
        default:
          // 고체 재료의 경우 밀도를 이용해 변환
          const density = nutritionInfo.density || 1.0
          if (unit === 'g') {
            usageInPriceUnit = (amount / 1000) / density
          } else if (unit === 'kg') {
            usageInPriceUnit = amount / density
          } else {
            usageInPriceUnit = amount / 1000
          }
      }
    } else if (priceUnit === '개') {
      // 개 단위 가격일 때
      usageInPriceUnit = unit === '개' ? amount : amount / 50 // 기본값 50g당 1개
    }

    return pricePerBaseUnit * usageInPriceUnit
  }

  /**
   * 인건비 계산
   */
  static calculateLaborCost(recipe, laborRate = 15000) { // 시급 15,000원 기본값
    const totalTimeMinutes = recipe.prepTime + recipe.bakingTime
    const laborHours = totalTimeMinutes / 60
    
    return {
      totalTime: totalTimeMinutes,
      laborHours: Math.round(laborHours * 100) / 100,
      hourlyRate: laborRate,
      totalLaborCost: Math.round(laborHours * laborRate),
      currency: 'KRW'
    }
  }

  /**
   * 간접비 계산
   */
  static calculateOverheadCost(ingredientCost, laborCost, overheadRate = 0.3) {
    const baseCost = ingredientCost + laborCost
    const overheadCost = Math.round(baseCost * overheadRate)
    
    return {
      baseCost,
      overheadRate: overheadRate * 100, // 퍼센트로 표시
      overheadCost,
      includes: [
        '전기세, 가스비',
        '장비 감가상각',
        '임대료',
        '기타 운영비'
      ]
    }
  }

  /**
   * 총 원가 계산
   */
  static calculateTotalCost(recipe, options = {}) {
    const {
      useWholesalePrice = false,
      wasteFactor = 1.05,
      laborRate = 15000,
      overheadRate = 0.3,
      currency = 'KRW'
    } = options

    // 재료비 계산
    const ingredientCostData = this.calculateIngredientCost(
      recipe.ingredients, 
      { useWholesalePrice, wasteFactor, currency }
    )

    // 인건비 계산
    const laborCostData = this.calculateLaborCost(recipe, laborRate)

    // 간접비 계산
    const overheadCostData = this.calculateOverheadCost(
      ingredientCostData.totalCost,
      laborCostData.totalLaborCost,
      overheadRate
    )

    // 총 원가
    const totalCost = ingredientCostData.totalCost + 
                     laborCostData.totalLaborCost + 
                     overheadCostData.overheadCost

    return {
      recipeName: recipe.name,
      servings: recipe.servings || 1,
      
      // 상세 비용 내역
      ingredients: ingredientCostData,
      labor: laborCostData,
      overhead: overheadCostData,
      
      // 총계
      totalCost: Math.round(totalCost),
      costPerServing: Math.round(totalCost / (recipe.servings || 1)),
      currency,
      
      // 비율
      costBreakdown: {
        ingredientsPercent: Math.round((ingredientCostData.totalCost / totalCost) * 100),
        laborPercent: Math.round((laborCostData.totalLaborCost / totalCost) * 100),
        overheadPercent: Math.round((overheadCostData.overheadCost / totalCost) * 100)
      },
      
      // 계산 설정
      calculationSettings: {
        useWholesalePrice,
        wasteFactor,
        laborRate,
        overheadRate
      },
      
      calculatedAt: new Date().toISOString()
    }
  }

  /**
   * 판매 가격 및 마진 계산
   */
  static calculateSellingPrice(totalCost, targetMargin = 0.5) {
    const sellingPrice = Math.round(totalCost / (1 - targetMargin))
    const actualMargin = (sellingPrice - totalCost) / sellingPrice
    const markup = (sellingPrice - totalCost) / totalCost
    
    return {
      totalCost,
      targetMargin: targetMargin * 100,
      sellingPrice,
      actualMargin: Math.round(actualMargin * 100),
      markup: Math.round(markup * 100),
      profit: sellingPrice - totalCost,
      
      // 다양한 마진율에 따른 가격
      priceOptions: [
        {
          margin: 30,
          price: Math.round(totalCost / 0.7),
          profit: Math.round(totalCost / 0.7) - totalCost
        },
        {
          margin: 40,
          price: Math.round(totalCost / 0.6),
          profit: Math.round(totalCost / 0.6) - totalCost
        },
        {
          margin: 50,
          price: Math.round(totalCost / 0.5),
          profit: Math.round(totalCost / 0.5) - totalCost
        },
        {
          margin: 60,
          price: Math.round(totalCost / 0.4),
          profit: Math.round(totalCost / 0.4) - totalCost
        }
      ]
    }
  }

  /**
   * 원가 절감 분석
   */
  static analyzeCostReduction(costData) {
    const suggestions = []
    const { ingredients } = costData

    // 가장 비싼 재료 상위 3개 식별
    const sortedIngredients = ingredients.items
      .sort((a, b) => b.adjustedCost - a.adjustedCost)
      .slice(0, 3)

    sortedIngredients.forEach((item, index) => {
      const costPercent = (item.adjustedCost / ingredients.totalCost * 100).toFixed(1)
      
      if (costPercent > 20) {
        suggestions.push({
          priority: 'high',
          ingredient: item.name,
          currentCost: item.adjustedCost,
          percentage: costPercent,
          suggestion: `${item.name}이 총 재료비의 ${costPercent}%를 차지합니다. 대량구매 또는 대체재료를 고려해보세요.`
        })
      } else if (costPercent > 10) {
        suggestions.push({
          priority: 'medium',
          ingredient: item.name,
          currentCost: item.adjustedCost,
          percentage: costPercent,
          suggestion: `${item.name} 구매처를 비교해보시거나 품질 대비 가격을 재검토해보세요.`
        })
      }
    })

    // 손실률 개선 제안
    if (ingredients.wasteFactor > 1.1) {
      suggestions.push({
        priority: 'medium',
        category: 'waste',
        suggestion: `현재 손실률이 ${((ingredients.wasteFactor - 1) * 100).toFixed(0)}%입니다. 재료 보관 및 사용 효율성을 개선하면 비용을 절감할 수 있습니다.`
      })
    }

    // 인건비 효율성 제안
    const laborPercent = costData.costBreakdown.laborPercent
    if (laborPercent > 40) {
      suggestions.push({
        priority: 'medium',
        category: 'labor',
        suggestion: `인건비 비율이 ${laborPercent}%로 높습니다. 공정 개선이나 배치 생산을 통해 효율성을 높여보세요.`
      })
    }

    return {
      totalSavingPotential: this.estimateSavingPotential(costData),
      suggestions,
      implementationDifficulty: this.assessImplementationDifficulty(suggestions),
      estimatedTimeframe: '1-3개월'
    }
  }

  /**
   * 절감 잠재력 추정
   */
  static estimateSavingPotential(costData) {
    let savingPercent = 0
    
    // 재료비 절감 (5-15%)
    savingPercent += 10
    
    // 손실률 개선 (현재 손실률 - 3%)
    savingPercent += Math.max(0, (costData.ingredients.wasteFactor - 1.03) * 100)
    
    // 인건비 효율성 (2-8%)
    if (costData.costBreakdown.laborPercent > 35) {
      savingPercent += 5
    }
    
    const maxSaving = Math.min(savingPercent, 25) // 최대 25% 절감
    const estimatedSaving = Math.round(costData.totalCost * (maxSaving / 100))
    
    return {
      percentReduction: maxSaving,
      amountReduction: estimatedSaving,
      newTotalCost: costData.totalCost - estimatedSaving
    }
  }

  /**
   * 구현 난이도 평가
   */
  static assessImplementationDifficulty(suggestions) {
    const highPriority = suggestions.filter(s => s.priority === 'high').length
    const mediumPriority = suggestions.filter(s => s.priority === 'medium').length
    
    if (highPriority >= 2) return 'challenging'
    if (mediumPriority >= 3) return 'moderate'
    return 'easy'
  }

  /**
   * 경쟁사 가격 비교 (향후 구현)
   */
  static compareMarketPrices(recipeName, costPerServing) {
    // 실제 구현시 시장 가격 데이터베이스 연동
    return {
      recipeName,
      ourPrice: costPerServing,
      marketAverage: costPerServing * 1.2,
      competitivePosition: 'below_average', // above_average, average, below_average
      priceAdvantage: '시장 평균보다 저렴합니다.',
      recommendation: '적정한 가격 경쟁력을 보유하고 있습니다.'
    }
  }
}

export default CostCalculator