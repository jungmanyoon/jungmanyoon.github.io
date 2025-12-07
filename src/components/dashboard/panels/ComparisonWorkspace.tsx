/**
 * ComparisonWorkspace.tsx
 * 원본 vs 변환 레시피 비교 워크스페이스
 * 좌우 패널로 실시간 비교 제공
 */

import React from 'react'
import {
  ArrowRight,
  Scale,
  Percent,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import type { Recipe, Ingredient } from '@/types/recipe.types'
import type { ComparisonWorkspaceProps, ConversionDiff, ConversionSummary } from '@/types/dashboard.types'

const ComparisonWorkspace: React.FC<ComparisonWorkspaceProps> = ({
  sourceRecipe,
  convertedRecipe,
  diffs,
  summary,
  isCalculating,
}) => {
  // 레시피가 없는 경우
  if (!sourceRecipe) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-4xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            레시피를 선택해주세요
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            왼쪽 패널에서 레시피를 선택하면 여기에서 변환 작업을 시작할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Summary Bar */}
      {summary && summary.activeConversions.length > 0 && (
        <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ConversionSummaryBar summary={summary} isCalculating={isCalculating} />
        </div>
      )}

      {/* Main Comparison Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-7xl mx-auto">
          {/* Original Recipe Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">📥</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  원본 레시피
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {sourceRecipe.name}
              </p>
            </div>
            <div className="p-4">
              <RecipeDetails recipe={sourceRecipe} type="original" />
              <IngredientTable
                ingredients={sourceRecipe.ingredients}
                diffs={[]}
                type="original"
              />
            </div>
          </div>

          {/* Conversion Arrow (Desktop) */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
              {isCalculating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6" />
              )}
            </div>
          </div>

          {/* Converted Recipe Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-blue-500 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">📤</span>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  변환 결과
                </h3>
                {isCalculating && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                {summary?.scaleFactor !== 1
                  ? `${summary?.scaleFactor.toFixed(2)}배 적용됨`
                  : '변환 없음'}
              </p>
            </div>
            <div className="p-4">
              {convertedRecipe && (
                <>
                  <RecipeDetails recipe={convertedRecipe} type="converted" />
                  <IngredientTable
                    ingredients={convertedRecipe.ingredients}
                    diffs={diffs}
                    type="converted"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 변환 요약 바
const ConversionSummaryBar: React.FC<{
  summary: ConversionSummary
  isCalculating: boolean
}> = ({ summary, isCalculating }) => {
  const percentChange = Math.round(
    ((summary.totalConvertedWeight - summary.totalOriginalWeight) /
      summary.totalOriginalWeight) *
      100
  )

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Scale Factor */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
        <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          ×{summary.scaleFactor.toFixed(2)}
        </span>
      </div>

      {/* Weight Change */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {summary.totalOriginalWeight.toLocaleString()}g
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {summary.totalConvertedWeight.toLocaleString()}g
        </span>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            percentChange > 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              : percentChange < 0
              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {percentChange > 0 ? '+' : ''}
          {percentChange}%
        </span>
      </div>

      {/* Hydration */}
      <div className="flex items-center gap-2">
        <Percent className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          수분율: {summary.hydrationConverted}%
        </span>
      </div>

      {/* Active Conversions */}
      <div className="flex items-center gap-2 ml-auto">
        {summary.activeConversions.map((conv, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
          >
            <span>{conv.icon}</span>
            <span>{conv.labelKo}</span>
          </span>
        ))}
      </div>

      {/* Warnings */}
      {summary.warnings.length > 0 && (
        <div className="flex items-center gap-1 text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{summary.warnings.length}개 주의사항</span>
        </div>
      )}
    </div>
  )
}

// 레시피 상세 정보
const RecipeDetails: React.FC<{
  recipe: Recipe
  type: 'original' | 'converted'
}> = ({ recipe, type }) => {
  const methodNames: Record<string, string> = {
    straight: '스트레이트법',
    sponge: '중종법',
    poolish: '폴리쉬법',
    biga: '비가법',
    overnight: '저온숙성법',
    'no-time': '노타임법',
    sourdough: '사워도우',
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">틀 크기</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {recipe.panConfig?.name || '미지정'}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">제법</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {methodNames[recipe.method?.method] || recipe.method?.method || '미지정'}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">생산량</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {recipe.yield?.quantity}
            {recipe.yield?.unit}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">총 시간</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {recipe.totalTime}분
          </p>
        </div>
      </div>
    </div>
  )
}

// 재료 테이블
const IngredientTable: React.FC<{
  ingredients: Ingredient[]
  diffs: ConversionDiff[]
  type: 'original' | 'converted'
}> = ({ ingredients, diffs, type }) => {
  // 밀가루 총량 계산 (베이커스 퍼센트용)
  const totalFlour = ingredients
    .filter((i) => i.category === 'flour' || i.isFlour)
    .reduce((sum, i) => sum + (i.amount || 0), 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
              재료
            </th>
            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
              중량
            </th>
            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
              B%
            </th>
            {type === 'converted' && (
              <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                변화
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {ingredients.map((ing, idx) => {
            const diff = diffs.find((d) => d.ingredientId === ing.id)
            const bakersPercent =
              totalFlour > 0
                ? Math.round((ing.amount / totalFlour) * 1000) / 10
                : 0

            return (
              <tr
                key={ing.id || idx}
                className={`
                  ${diff?.changeType === 'increase' ? 'bg-green-50 dark:bg-green-900/20' : ''}
                  ${diff?.changeType === 'decrease' ? 'bg-red-50 dark:bg-red-900/20' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700/50
                `}
              >
                <td className="py-2 px-3 text-gray-900 dark:text-white">
                  <span className="flex items-center gap-2">
                    {getCategoryIcon(ing.category)}
                    {ing.name}
                    {ing.isFlour && (
                      <span className="text-xs text-blue-500">(기준)</span>
                    )}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono text-gray-900 dark:text-white">
                  {ing.amount.toLocaleString()}{ing.unit}
                </td>
                <td className="py-2 px-3 text-right font-mono text-gray-500 dark:text-gray-400">
                  {bakersPercent > 0 ? `${bakersPercent}%` : '-'}
                </td>
                {type === 'converted' && (
                  <td className="py-2 px-3 text-right">
                    {diff && (
                      <DiffIndicator
                        changeType={diff.changeType}
                        percentChange={diff.percentChange}
                      />
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        <tfoot className="border-t-2 border-gray-300 dark:border-gray-600">
          <tr className="font-semibold">
            <td className="py-2 px-3 text-gray-900 dark:text-white">합계</td>
            <td className="py-2 px-3 text-right font-mono text-gray-900 dark:text-white">
              {ingredients
                .reduce((sum, i) => sum + (i.amount || 0), 0)
                .toLocaleString()}
              g
            </td>
            <td className="py-2 px-3 text-right font-mono text-gray-500">-</td>
            {type === 'converted' && <td className="py-2 px-3"></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// 카테고리 아이콘
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    flour: '🌾',
    liquid: '💧',
    fat: '🧈',
    sugar: '🍯',
    egg: '🥚',
    dairy: '🥛',
    leavening: '🫧',
    salt: '🧂',
    flavoring: '🍋',
    other: '📦',
  }
  return icons[category] || '📦'
}

// 변화량 표시
const DiffIndicator: React.FC<{
  changeType: 'increase' | 'decrease' | 'unchanged' | 'new' | 'removed'
  percentChange: number
}> = ({ changeType, percentChange }) => {
  if (changeType === 'unchanged') {
    return <Minus className="w-4 h-4 text-gray-400 inline" />
  }

  if (changeType === 'increase') {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
        <TrendingUp className="w-4 h-4" />
        <span className="text-xs font-medium">+{percentChange}%</span>
      </span>
    )
  }

  if (changeType === 'decrease') {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
        <TrendingDown className="w-4 h-4" />
        <span className="text-xs font-medium">{percentChange}%</span>
      </span>
    )
  }

  return null
}

export default ComparisonWorkspace
