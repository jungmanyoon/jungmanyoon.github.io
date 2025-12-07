import React, { useState, useMemo } from 'react'
import { Activity, Info, AlertTriangle, TrendingUp } from 'lucide-react'
import NutritionCalculator from '../../utils/calculations/nutritionCalculator.js'

const NutritionPanel = ({ recipe, servings }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  const nutritionData = useMemo(() => {
    if (!recipe || !recipe.ingredients) return null

    const totalNutrition = NutritionCalculator.calculateTotalNutrition(recipe.ingredients)
    const perServing = NutritionCalculator.calculatePerServingNutrition(totalNutrition, servings || recipe.servings || 1)
    const nutritionLabel = NutritionCalculator.generateNutritionLabel(totalNutrition, perServing, 100)
    const densityAnalysis = NutritionCalculator.analyzeNutritionDensity(perServing)
    const bakingAnalysis = NutritionCalculator.analyzeBakingNutrition(recipe.ingredients, totalNutrition)

    return {
      total: totalNutrition,
      perServing,
      label: nutritionLabel,
      density: densityAnalysis,
      baking: bakingAnalysis
    }
  }, [recipe, servings])

  if (!nutritionData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center text-gray-500">
          <Activity className="w-5 h-5 mr-2" />
          <span>영양 정보를 계산할 수 없습니다</span>
        </div>
      </div>
    )
  }

  const { perServing, label, density, baking } = nutritionData

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">영양 정보</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showDetails ? '간단히' : '자세히'}
        </button>
      </div>

      <div className="p-4">
        {/* 기본 영양 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(perServing.calories)}
            </div>
            <div className="text-sm text-gray-600">칼로리</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-600">
              {perServing.protein.toFixed(1)}g
            </div>
            <div className="text-sm text-gray-600">단백질</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-amber-600">
              {perServing.carbohydrates.toFixed(1)}g
            </div>
            <div className="text-sm text-gray-600">탄수화물</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-red-600">
              {perServing.fat.toFixed(1)}g
            </div>
            <div className="text-sm text-gray-600">지방</div>
          </div>
        </div>

        {/* 영양 점수 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">영양 점수</span>
            <span className="text-sm text-gray-600">{density.healthScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                density.healthScore >= 70 ? 'bg-green-500' :
                density.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${density.healthScore}%` }}
            />
          </div>
        </div>

        {/* 경고사항 */}
        {(nutritionData.total.estimatedComponents.length > 0 || baking.recommendations.length > 0) && (
          <div className="mb-4">
            {nutritionData.total.estimatedComponents.length > 0 && (
              <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-2">
                <Info className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800">
                    일부 재료의 영양 정보가 추정치입니다: {nutritionData.total.estimatedComponents.join(', ')}
                  </p>
                </div>
              </div>
            )}
            
            {baking.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        )}

        {/* 상세 정보 */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* 상세 영양소 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">상세 영양소</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">식이섬유</span>
                    <span>{perServing.fiber.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">당분</span>
                    <span>{perServing.sugar.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">나트륨</span>
                    <span>{perServing.sodium.toFixed(1)}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">콜레스테롤</span>
                    <span>{perServing.cholesterol.toFixed(1)}mg</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">영양 밀도</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">단백질 비율</span>
                    <span>{density.proteinPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">탄수화물 비율</span>
                    <span>{density.carbPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">지방 비율</span>
                    <span>{density.fatPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">100kcal당 식이섬유</span>
                    <span>{density.fiberDensity.toFixed(1)}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 제빵 분석 */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">제빵 분석</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">밀가루 구성</p>
                  {baking.flourTypes.map((flour, index) => (
                    <div key={index} className="flex justify-between text-xs mb-1">
                      <span className={flour.isWholeGrain ? 'text-green-700' : 'text-gray-700'}>
                        {flour.name}
                      </span>
                      <span>{Math.round(flour.weight)}g</span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">설탕 함량</span>
                    <span>{Math.round(baking.sugarContent)}g</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">유지 함량</span>
                    <span>{Math.round(baking.fatContent)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">통곡물 비율</span>
                    <span>{Math.round((baking.wholeGrains / (baking.wholeGrains + baking.refinedFlours)) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 일일권장량 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">일일권장량 대비 (%)</h4>
              <div className="space-y-2">
                {[
                  { name: '지방', value: label.totalFat.dailyValue, color: 'bg-red-500' },
                  { name: '나트륨', value: label.sodium.dailyValue, color: 'bg-orange-500' },
                  { name: '탄수화물', value: label.totalCarbohydrates.dailyValue, color: 'bg-yellow-500' },
                  { name: '식이섬유', value: label.dietaryFiber.dailyValue, color: 'bg-green-500' },
                  { name: '단백질', value: label.protein.dailyValue, color: 'bg-blue-500' }
                ].map((nutrient, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-16 text-sm text-gray-600 mr-2">{nutrient.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${nutrient.color}`}
                        style={{ width: `${Math.min(nutrient.value, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {nutrient.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NutritionPanel