/**
 * 웹 워커를 통한 무거운 계산 처리
 * 메인 스레드 블로킹 없이 복잡한 계산 수행
 */

import { BakersPercentage } from '@utils/calculations/bakersPercentage'
import { DDTCalculator } from '@utils/calculations/ddtCalculator'
import { Ingredient, Recipe } from '@types/recipe.types'

export type WorkerMessage = 
  | { type: 'BAKERS_PERCENTAGE'; data: BakersPercentageInput }
  | { type: 'DDT_CALCULATION'; data: DDTInput }
  | { type: 'SCALE_RECIPE'; data: ScaleRecipeInput }
  | { type: 'BATCH_CALCULATION'; data: BatchCalculationInput }

export interface BakersPercentageInput {
  ingredients: Ingredient[]
  flourAmount: number
}

export interface DDTInput {
  targetTemp: number
  flourTemp: number
  roomTemp: number
  prefermentTemp?: number
  frictionFactor: number
}

export interface ScaleRecipeInput {
  recipe: Recipe
  scaleFactor: number
}

export interface BatchCalculationInput {
  calculations: Array<{
    id: string
    type: 'bakers' | 'ddt' | 'scale'
    data: any
  }>
}

// 워커 메시지 핸들러
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data
  
  try {
    switch (type) {
      case 'BAKERS_PERCENTAGE': {
        const result = handleBakersPercentage(data as BakersPercentageInput)
        self.postMessage({ type: 'BAKERS_PERCENTAGE_RESULT', result })
        break
      }
      
      case 'DDT_CALCULATION': {
        const result = handleDDTCalculation(data as DDTInput)
        self.postMessage({ type: 'DDT_CALCULATION_RESULT', result })
        break
      }
      
      case 'SCALE_RECIPE': {
        const result = handleScaleRecipe(data as ScaleRecipeInput)
        self.postMessage({ type: 'SCALE_RECIPE_RESULT', result })
        break
      }
      
      case 'BATCH_CALCULATION': {
        const results = await handleBatchCalculation(data as BatchCalculationInput)
        self.postMessage({ type: 'BATCH_CALCULATION_RESULT', results })
        break
      }
      
      default:
        self.postMessage({ 
          type: 'ERROR', 
          error: `Unknown message type: ${type}` 
        })
    }
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// 베이커스 퍼센트 계산
function handleBakersPercentage(input: BakersPercentageInput) {
  const { ingredients, flourAmount } = input
  
  // 베이커스 퍼센트 계산
  const withPercentages = BakersPercentage.toBakersPercentage(ingredients, flourAmount)
  
  // 수화율 계산
  const hydration = BakersPercentage.calculateHydration(ingredients)
  
  // 총 중량 계산
  const totalWeight = BakersPercentage.calculateTotalWeight(ingredients)
  
  // 실제 수분량 계산
  const totalMoisture = BakersPercentage.getTotalMoisture(ingredients)
  
  // 비율 검증
  const validation = BakersPercentage.validateRatios(withPercentages)
  
  return {
    ingredients: withPercentages,
    hydration,
    totalWeight,
    totalMoisture,
    validation,
    statistics: {
      flourAmount,
      liquidAmount: BakersPercentage.getTotalLiquid(ingredients),
      ingredientCount: ingredients.length
    }
  }
}

// DDT 계산
function handleDDTCalculation(input: DDTInput) {
  const { targetTemp, flourTemp, roomTemp, prefermentTemp, frictionFactor } = input
  
  let waterTemp: number
  
  if (prefermentTemp) {
    waterTemp = DDTCalculator.calculateWaterTempWithPreferment(
      targetTemp,
      { flour: flourTemp, room: roomTemp, preferment: prefermentTemp },
      frictionFactor
    )
  } else {
    waterTemp = DDTCalculator.calculateWaterTemp(
      targetTemp,
      flourTemp,
      roomTemp,
      frictionFactor
    )
  }
  
  // 얼음 계산 (필요한 경우)
  let iceCalculation = null
  if (waterTemp < 0) {
    iceCalculation = DDTCalculator.calculateIceAmount(
      1000, // 기본 물량 1kg
      20,   // 일반 수돗물 온도
      Math.max(waterTemp, 0)
    )
  }
  
  // 최종 온도 예측
  const predictedTemp = DDTCalculator.predictDoughTemp(
    { flour: flourTemp, water: waterTemp, room: roomTemp, preferment: prefermentTemp },
    10, // 기본 믹싱 시간
    'stand'
  )
  
  return {
    waterTemp,
    iceCalculation,
    predictedTemp,
    warnings: generateDDTWarnings(waterTemp),
    recommendations: generateDDTRecommendations(targetTemp, waterTemp)
  }
}

// 레시피 스케일링
function handleScaleRecipe(input: ScaleRecipeInput) {
  const { recipe, scaleFactor } = input
  
  // 재료 스케일링
  const scaledIngredients = BakersPercentage.scaleRecipe(
    recipe.ingredients,
    scaleFactor
  )
  
  // 새로운 총 중량
  const newTotalWeight = BakersPercentage.calculateTotalWeight(scaledIngredients)
  
  // 팬 크기 조정 계산
  const panAdjustment = calculatePanAdjustment(
    recipe.totalWeight || 0,
    newTotalWeight
  )
  
  // 시간 조정 계산
  const timeAdjustment = calculateTimeAdjustment(scaleFactor)
  
  return {
    scaledRecipe: {
      ...recipe,
      ingredients: scaledIngredients,
      totalWeight: newTotalWeight,
      servings: Math.round(recipe.servings * scaleFactor),
      bakingTime: Math.round(recipe.bakingTime * timeAdjustment),
      yield: {
        ...recipe.yield,
        quantity: Math.round(recipe.yield.quantity * scaleFactor)
      }
    },
    adjustments: {
      panSize: panAdjustment,
      timeMultiplier: timeAdjustment,
      temperatureAdjustment: calculateTemperatureAdjustment(scaleFactor)
    },
    warnings: generateScalingWarnings(scaleFactor)
  }
}

// 배치 계산 처리
async function handleBatchCalculation(input: BatchCalculationInput) {
  const results = []
  
  for (const calc of input.calculations) {
    await new Promise(resolve => setTimeout(resolve, 10)) // 짧은 지연으로 UI 반응성 유지
    
    let result
    switch (calc.type) {
      case 'bakers':
        result = handleBakersPercentage(calc.data)
        break
      case 'ddt':
        result = handleDDTCalculation(calc.data)
        break
      case 'scale':
        result = handleScaleRecipe(calc.data)
        break
      default:
        result = { error: 'Unknown calculation type' }
    }
    
    results.push({ id: calc.id, result })
  }
  
  return results
}

// 헬퍼 함수들
function generateDDTWarnings(waterTemp: number): string[] {
  const warnings = []
  
  if (waterTemp < 0) {
    warnings.push('물 온도가 0°C 이하입니다. 얼음을 사용해야 합니다.')
  } else if (waterTemp < 5) {
    warnings.push('물 온도가 매우 낮습니다. 냉장 보관된 물을 사용하세요.')
  } else if (waterTemp > 40) {
    warnings.push('물 온도가 40°C를 초과합니다. 이스트 활성에 영향을 줄 수 있습니다.')
  }
  
  return warnings
}

function generateDDTRecommendations(targetTemp: number, waterTemp: number): string[] {
  const recommendations = []
  
  if (waterTemp < 0) {
    recommendations.push('얼음과 찬물을 혼합하여 사용하세요.')
  }
  
  if (waterTemp > 35) {
    recommendations.push('물 온도를 35°C 이하로 조정하는 것을 권장합니다.')
  }
  
  // 계절별 권장사항
  const month = new Date().getMonth()
  const season = month >= 2 && month <= 4 ? '봄' :
                month >= 5 && month <= 7 ? '여름' :
                month >= 8 && month <= 10 ? '가을' : '겨울'
  
  const seasonalDDT = {
    '봄': 25,
    '여름': 23,
    '가을': 25,
    '겨울': 27
  }
  
  if (Math.abs(targetTemp - seasonalDDT[season]) > 3) {
    recommendations.push(
      `현재 계절(${season}) 권장 DDT는 ${seasonalDDT[season]}°C입니다.`
    )
  }
  
  return recommendations
}

function calculatePanAdjustment(originalWeight: number, newWeight: number): string {
  const ratio = newWeight / originalWeight
  
  if (ratio < 0.5) {
    return '절반 크기의 팬을 사용하세요.'
  } else if (ratio < 0.75) {
    return '한 단계 작은 팬을 사용하세요.'
  } else if (ratio > 2) {
    return '두 배 크기의 팬을 사용하거나 나누어 굽기를 권장합니다.'
  } else if (ratio > 1.5) {
    return '한 단계 큰 팬을 사용하세요.'
  }
  
  return '현재 팬 크기를 유지해도 됩니다.'
}

function calculateTimeAdjustment(scaleFactor: number): number {
  // 크기에 따른 굽기 시간 조정 (제곱근 법칙)
  return Math.sqrt(scaleFactor)
}

function calculateTemperatureAdjustment(scaleFactor: number): number {
  // 크기에 따른 온도 조정
  if (scaleFactor < 0.5) {
    return 5 // 5도 높이기
  } else if (scaleFactor > 2) {
    return -5 // 5도 낮추기
  }
  return 0
}

function generateScalingWarnings(scaleFactor: number): string[] {
  const warnings = []
  
  if (scaleFactor < 0.25) {
    warnings.push('매우 작은 크기로 변환됩니다. 레시피가 제대로 작동하지 않을 수 있습니다.')
  } else if (scaleFactor > 4) {
    warnings.push('매우 큰 크기로 변환됩니다. 믹서 용량과 오븐 크기를 확인하세요.')
  }
  
  if (scaleFactor !== Math.round(scaleFactor)) {
    warnings.push('소수점 배율입니다. 일부 재료의 정확한 계량이 어려울 수 있습니다.')
  }
  
  return warnings
}

export default null