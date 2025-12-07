/**
 * 영양 정보 계산 엔진
 * 레시피의 총 영양 성분과 1인분 영양 성분을 계산
 */

import { getNutritionInfo } from '../../data/nutrition/ingredientNutrition.js'

export class NutritionCalculator {
  /**
   * 레시피의 총 영양 성분 계산
   */
  static calculateTotalNutrition(ingredients) {
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      estimatedComponents: [] // 추정치 재료 목록
    }

    ingredients.forEach(ingredient => {
      const nutritionInfo = getNutritionInfo(ingredient.name)
      const weight = this.convertToGrams(ingredient.amount, ingredient.unit, nutritionInfo)
      
      // 100g 기준 → 실제 사용량 기준으로 계산
      const multiplier = weight / 100

      totalNutrition.calories += nutritionInfo.calories * multiplier
      totalNutrition.protein += nutritionInfo.protein * multiplier
      totalNutrition.carbohydrates += nutritionInfo.carbohydrates * multiplier
      totalNutrition.fat += nutritionInfo.fat * multiplier
      totalNutrition.fiber += nutritionInfo.fiber * multiplier
      totalNutrition.sugar += nutritionInfo.sugar * multiplier
      totalNutrition.sodium += nutritionInfo.sodium * multiplier
      totalNutrition.cholesterol += nutritionInfo.cholesterol * multiplier

      // 추정치 재료 기록
      if (nutritionInfo.isEstimated) {
        totalNutrition.estimatedComponents.push(ingredient.name)
      }
    })

    // 소수점 반올림
    Object.keys(totalNutrition).forEach(key => {
      if (typeof totalNutrition[key] === 'number') {
        totalNutrition[key] = Math.round(totalNutrition[key] * 100) / 100
      }
    })

    return totalNutrition
  }

  /**
   * 1인분 영양 성분 계산
   */
  static calculatePerServingNutrition(totalNutrition, servings) {
    if (!servings || servings <= 0) {
      throw new Error('서빙 수는 0보다 커야 합니다.')
    }

    const perServing = {}
    
    Object.keys(totalNutrition).forEach(key => {
      if (typeof totalNutrition[key] === 'number') {
        perServing[key] = Math.round((totalNutrition[key] / servings) * 100) / 100
      } else {
        perServing[key] = totalNutrition[key] // 배열이나 다른 타입은 그대로
      }
    })

    return perServing
  }

  /**
   * 영양성분표 생성 (한국 식품의약품안전처 기준)
   */
  static generateNutritionLabel(totalNutrition, perServing, servingSize = 100) {
    return {
      servingSize: `${servingSize}g`,
      servingsPerContainer: Math.ceil(this.getTotalWeight(totalNutrition) / servingSize),
      calories: Math.round(perServing.calories),
      
      // 주요 영양소 (% 일일권장량 기준)
      totalFat: {
        amount: `${perServing.fat.toFixed(1)}g`,
        dailyValue: this.calculateDailyValue(perServing.fat, 65) // 성인 기준 65g
      },
      cholesterol: {
        amount: `${perServing.cholesterol.toFixed(1)}mg`,
        dailyValue: this.calculateDailyValue(perServing.cholesterol, 300) // 300mg 기준
      },
      sodium: {
        amount: `${perServing.sodium.toFixed(1)}mg`,
        dailyValue: this.calculateDailyValue(perServing.sodium, 2000) // 2000mg 기준
      },
      totalCarbohydrates: {
        amount: `${perServing.carbohydrates.toFixed(1)}g`,
        dailyValue: this.calculateDailyValue(perServing.carbohydrates, 324) // 성인 기준
      },
      dietaryFiber: {
        amount: `${perServing.fiber.toFixed(1)}g`,
        dailyValue: this.calculateDailyValue(perServing.fiber, 25) // 25g 기준
      },
      totalSugars: {
        amount: `${perServing.sugar.toFixed(1)}g`,
        dailyValue: null // 일일권장량 없음
      },
      protein: {
        amount: `${perServing.protein.toFixed(1)}g`,
        dailyValue: this.calculateDailyValue(perServing.protein, 55) // 55g 기준
      },
      
      // 추가 정보
      estimatedComponents: totalNutrition.estimatedComponents,
      calculatedAt: new Date().toISOString()
    }
  }

  /**
   * 단위를 그램으로 변환
   */
  static convertToGrams(amount, unit, nutritionInfo) {
    switch (unit) {
      case 'g':
        return amount
      
      case 'kg':
        return amount * 1000
      
      case 'oz':
        return amount * 28.35
      
      case 'lb':
        return amount * 453.59
      
      case 'ml':
      case 'L':
        const volumeInMl = unit === 'L' ? amount * 1000 : amount
        return volumeInMl * (nutritionInfo.density || 1.0)
      
      case 'cup':
        return amount * 240 * (nutritionInfo.density || 1.0) // 1컵 = 240ml
      
      case 'tbsp':
        return amount * 15 * (nutritionInfo.density || 1.0) // 1큰술 = 15ml
      
      case 'tsp':
        return amount * 5 * (nutritionInfo.density || 1.0) // 1작은술 = 5ml
      
      case '개':
        if (nutritionInfo.averageWeight) {
          return amount * nutritionInfo.averageWeight
        }
        return amount * 50 // 기본값 50g per 개
      
      default:
        console.warn(`알 수 없는 단위: ${unit}, 기본값 사용`)
        return amount
    }
  }

  /**
   * 일일권장량 대비 퍼센트 계산
   */
  static calculateDailyValue(amount, dailyRecommendation) {
    if (!dailyRecommendation) return null
    return Math.round((amount / dailyRecommendation) * 100)
  }

  /**
   * 총 중량 계산 (추정)
   */
  static getTotalWeight(totalNutrition) {
    // 대략적인 계산: 칼로리 기준으로 추정
    return Math.round(totalNutrition.calories * 2.5) // 1g당 평균 0.4kcal 가정
  }

  /**
   * 영양 밀도 분석
   */
  static analyzeNutritionDensity(perServing) {
    const analysis = {
      caloriesPerGram: perServing.calories / 100,
      proteinPercent: (perServing.protein * 4) / perServing.calories * 100, // 단백질 칼로리 비율
      carbPercent: (perServing.carbohydrates * 4) / perServing.calories * 100,
      fatPercent: (perServing.fat * 9) / perServing.calories * 100,
      fiberDensity: perServing.fiber / (perServing.calories / 100), // 100kcal당 식이섬유
      sodiumDensity: perServing.sodium / (perServing.calories / 100), // 100kcal당 나트륨
      healthScore: 0
    }

    // 건강 점수 계산 (0-100)
    let score = 50 // 기본 점수

    // 단백질 비율 (10-30% 권장)
    if (analysis.proteinPercent >= 10 && analysis.proteinPercent <= 30) {
      score += 10
    }

    // 식이섬유 (높을수록 좋음, 최대 +20점)
    score += Math.min(analysis.fiberDensity * 2, 20)

    // 나트륨 (낮을수록 좋음, 최대 -30점)
    score -= Math.min(analysis.sodiumDensity / 10, 30)

    // 설탕 비율 (낮을수록 좋음, 최대 -20점)
    const sugarPercent = (perServing.sugar * 4) / perServing.calories * 100
    score -= Math.min(sugarPercent / 2, 20)

    analysis.healthScore = Math.max(0, Math.min(100, Math.round(score)))

    return analysis
  }

  /**
   * 베이킹 특화 영양 분석
   */
  static analyzeBakingNutrition(ingredients, totalNutrition) {
    const analysis = {
      flourTypes: [],
      sugarContent: 0,
      fatContent: 0,
      proteinSources: [],
      addedSugars: 0,
      refinedFlours: 0,
      wholeGrains: 0,
      recommendations: []
    }

    ingredients.forEach(ingredient => {
      const nutritionInfo = getNutritionInfo(ingredient.name)
      const weight = this.convertToGrams(ingredient.amount, ingredient.unit, nutritionInfo)

      if (nutritionInfo.category === 'flour') {
        analysis.flourTypes.push({
          name: ingredient.name,
          weight: weight,
          isWholeGrain: ingredient.name.includes('통') || ingredient.name.includes('whole')
        })

        if (ingredient.name.includes('통') || ingredient.name.includes('whole')) {
          analysis.wholeGrains += weight
        } else {
          analysis.refinedFlours += weight
        }
      }

      if (nutritionInfo.category === 'sugar') {
        analysis.sugarContent += weight
        analysis.addedSugars += nutritionInfo.sugar * (weight / 100)
      }

      if (nutritionInfo.category === 'fat') {
        analysis.fatContent += weight
      }

      if (nutritionInfo.protein > 10) {
        analysis.proteinSources.push({
          name: ingredient.name,
          protein: nutritionInfo.protein * (weight / 100)
        })
      }
    })

    // 추천사항 생성
    if (analysis.refinedFlours > analysis.wholeGrains * 2) {
      analysis.recommendations.push('통밀가루 비율을 늘려 식이섬유와 영양소를 증가시켜보세요.')
    }

    if (analysis.addedSugars > totalNutrition.calories * 0.1 / 4) { // 칼로리의 10% 이상이 설탕
      analysis.recommendations.push('설탕 함량이 높습니다. 자연 감미료나 과일을 활용해보세요.')
    }

    if (totalNutrition.sodium > 400) { // 100g당 400mg 이상
      analysis.recommendations.push('나트륨 함량이 높습니다. 소금을 줄이고 허브나 향신료로 풍미를 더해보세요.')
    }

    return analysis
  }

  /**
   * 영양 정보 비교 분석
   */
  static compareNutrition(nutrition1, nutrition2, label1 = 'Recipe 1', label2 = 'Recipe 2') {
    const comparison = {
      labels: [label1, label2],
      differences: {},
      winner: {},
      summary: []
    }

    const nutrients = ['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sodium', 'cholesterol']

    nutrients.forEach(nutrient => {
      const value1 = nutrition1[nutrient] || 0
      const value2 = nutrition2[nutrient] || 0
      const diff = ((value2 - value1) / value1 * 100).toFixed(1)

      comparison.differences[nutrient] = {
        [label1]: value1,
        [label2]: value2,
        difference: `${diff}%`,
        winner: this.determineNutrientWinner(nutrient, value1, value2)
      }
    })

    return comparison
  }

  /**
   * 영양소별 우승자 결정 (건강 기준)
   */
  static determineNutrientWinner(nutrient, value1, value2) {
    // 높을수록 좋은 영양소
    const higherIsBetter = ['protein', 'fiber']
    // 낮을수록 좋은 영양소
    const lowerIsBetter = ['sodium', 'cholesterol', 'sugar']

    if (higherIsBetter.includes(nutrient)) {
      return value1 > value2 ? 0 : 1
    } else if (lowerIsBetter.includes(nutrient)) {
      return value1 < value2 ? 0 : 1
    } else {
      return null // 중립
    }
  }
}

export default NutritionCalculator