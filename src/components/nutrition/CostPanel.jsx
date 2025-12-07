import React, { useState, useMemo } from 'react'
import { DollarSign, TrendingDown, AlertCircle, BarChart3, Settings } from 'lucide-react'
import CostCalculator from '../../utils/calculations/costCalculator.js'

const CostPanel = ({ recipe }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [settings, setSettings] = useState({
    useWholesalePrice: false,
    wasteFactor: 1.05,
    laborRate: 15000,
    overheadRate: 0.3,
    targetMargin: 0.5
  })
  const [showSettings, setShowSettings] = useState(false)

  const costData = useMemo(() => {
    if (!recipe || !recipe.ingredients) return null

    try {
      const totalCost = CostCalculator.calculateTotalCost(recipe, settings)
      const sellingPrice = CostCalculator.calculateSellingPrice(totalCost.totalCost, settings.targetMargin)
      const reductionAnalysis = CostCalculator.analyzeCostReduction(totalCost)

      return {
        total: totalCost,
        selling: sellingPrice,
        reduction: reductionAnalysis
      }
    } catch (error) {
      console.error('원가 계산 오류:', error)
      return null
    }
  }, [recipe, settings])

  if (!costData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center text-gray-500">
          <DollarSign className="w-5 h-5 mr-2" />
          <span>원가 정보를 계산할 수 없습니다</span>
        </div>
      </div>
    )
  }

  const { total, selling, reduction } = costData

  const formatCurrency = (amount) => `₩${amount.toLocaleString()}`

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">원가 분석</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="계산 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showDetails ? '간단히' : '자세히'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 설정 패널 */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">계산 설정</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={settings.useWholesalePrice}
                    onChange={(e) => setSettings(prev => ({ ...prev, useWholesalePrice: e.target.checked }))}
                    className="mr-2"
                  />
                  도매가격 사용
                </label>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">손실률 (%)</label>
                <input
                  type="number"
                  value={(settings.wasteFactor - 1) * 100}
                  onChange={(e) => setSettings(prev => ({ ...prev, wasteFactor: 1 + (e.target.value / 100) }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="0"
                  max="50"
                  step="1"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">시급 (원)</label>
                <input
                  type="number"
                  value={settings.laborRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, laborRate: parseInt(e.target.value) || 15000 }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="10000"
                  max="50000"
                  step="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">간접비율 (%)</label>
                <input
                  type="number"
                  value={settings.overheadRate * 100}
                  onChange={(e) => setSettings(prev => ({ ...prev, overheadRate: e.target.value / 100 }))}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="10"
                  max="100"
                  step="5"
                />
              </div>
            </div>
          </div>
        )}

        {/* 기본 원가 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(total.totalCost)}
            </div>
            <div className="text-sm text-gray-600">총 원가</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-600">
              {formatCurrency(total.costPerServing)}
            </div>
            <div className="text-sm text-gray-600">개당 원가</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-green-600">
              {formatCurrency(selling.sellingPrice)}
            </div>
            <div className="text-sm text-gray-600">권장 판매가</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-amber-600">
              {selling.actualMargin}%
            </div>
            <div className="text-sm text-gray-600">마진율</div>
          </div>
        </div>

        {/* 원가 구성 */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">원가 구성</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-16 text-sm text-gray-600 mr-2">재료비</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="h-3 rounded-full bg-blue-500"
                  style={{ width: `${total.costBreakdown.ingredientsPercent}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-20 text-right">
                {formatCurrency(total.ingredients.totalCost)} ({total.costBreakdown.ingredientsPercent}%)
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="w-16 text-sm text-gray-600 mr-2">인건비</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${total.costBreakdown.laborPercent}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-20 text-right">
                {formatCurrency(total.labor.totalLaborCost)} ({total.costBreakdown.laborPercent}%)
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="w-16 text-sm text-gray-600 mr-2">간접비</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="h-3 rounded-full bg-orange-500"
                  style={{ width: `${total.costBreakdown.overheadPercent}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-20 text-right">
                {formatCurrency(total.overhead.overheadCost)} ({total.costBreakdown.overheadPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* 절감 제안 */}
        {reduction.suggestions.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingDown className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">원가 절감 기회</span>
            </div>
            <div className="text-sm text-yellow-700">
              최대 <strong>{reduction.totalSavingPotential.percentReduction}%</strong> 
              ({formatCurrency(reduction.totalSavingPotential.amountReduction)}) 절감 가능
            </div>
          </div>
        )}

        {/* 상세 정보 */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* 재료별 원가 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">재료별 원가</h4>
              <div className="space-y-2">
                {total.ingredients.items
                  .sort((a, b) => b.adjustedCost - a.adjustedCost)
                  .slice(0, 5)
                  .map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className={item.isEstimated ? 'text-orange-700' : 'text-gray-700'}>
                        {item.name}
                      </span>
                      {item.isEstimated && (
                        <AlertCircle className="w-3 h-3 text-orange-500 ml-1" title="추정 가격" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(Math.round(item.adjustedCost))}</div>
                      <div className="text-xs text-gray-500">
                        {item.amount}{item.unit} × {formatCurrency(Math.round(item.pricePerUnit))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {total.ingredients.estimatedItems.length > 0 && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                  <span className="text-orange-800">
                    추정 가격 재료: {total.ingredients.estimatedItems.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* 판매가 옵션 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">마진별 판매가</h4>
              <div className="grid grid-cols-2 gap-2">
                {selling.priceOptions.map((option, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span>{option.margin}% 마진</span>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(option.price)}</div>
                      <div className="text-xs text-gray-500">이익: {formatCurrency(option.profit)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 절감 제안 상세 */}
            {reduction.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">절감 제안</h4>
                <div className="space-y-2">
                  {reduction.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="flex items-start">
                        <div className={`w-2 h-2 rounded-full mr-2 mt-1.5 ${
                          suggestion.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-blue-800">{suggestion.suggestion}</p>
                          {suggestion.ingredient && (
                            <p className="text-blue-600 text-xs mt-1">
                              현재 비용: {formatCurrency(Math.round(suggestion.currentCost))} 
                              ({suggestion.percentage}%)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 작업 시간 분석 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">작업 시간</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">준비 시간</span>
                    <span>{recipe.prepTime}분</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">굽기 시간</span>
                    <span>{recipe.bakingTime}분</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 시간</span>
                    <span>{total.labor.totalTime}분</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">인건비</span>
                    <span>{formatCurrency(total.labor.totalLaborCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CostPanel