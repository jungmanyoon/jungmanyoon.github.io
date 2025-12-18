/**
 * PhaseIngredientsView - 단계별 재료 표시 컴포넌트
 *
 * 기능:
 * - phases 배열이 있으면 단계별 섹션으로 표시
 * - phases가 없으면 ingredients를 flat하게 표시
 * - 변환 배율이 있으면 원본 → 변환 값을 인라인 표시
 */

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Recipe, Ingredient, IngredientPhase, PhaseType } from '@/types/recipe.types'

// 단계 타입별 메타데이터 (라벨은 i18n으로 동적 처리)
const PHASE_META: Record<PhaseType, { icon: string; color: string; labelKey: string }> = {
  preferment: { icon: '🧪', color: 'amber', labelKey: 'preferment' },
  tangzhong: { icon: '🍜', color: 'pink', labelKey: 'tangzhong' },
  autolyse: { icon: '⏳', color: 'purple', labelKey: 'autolyse' },
  main: { icon: '🍞', color: 'blue', labelKey: 'main' },
  topping: { icon: '✨', color: 'orange', labelKey: 'topping' },
  filling: { icon: '🎂', color: 'rose', labelKey: 'filling' },
  frosting: { icon: '🍰', color: 'indigo', labelKey: 'frosting' },
  glaze: { icon: '💧', color: 'cyan', labelKey: 'glaze' },
  other: { icon: '📦', color: 'gray', labelKey: 'other' },
}

// 카테고리별 아이콘
const CATEGORY_ICONS: Record<string, string> = {
  flour: '🌾',
  liquid: '💧',
  fat: '🧈',
  sugar: '🍯',
  egg: '🥚',
  dairy: '🥛',
  leavening: '🫧',
  salt: '🧂',
  flavoring: '🍋',
  nut: '🥜',
  fruit: '🍇',
  chocolate: '🍫',
  other: '📦',
}

interface PhaseIngredientsViewProps {
  recipe: Recipe
  multiplier?: number  // 변환 배율 (1이면 변환 없음)
  showConversion?: boolean  // 변환 표시 여부
  editable?: boolean  // 편집 가능 여부
  onIngredientChange?: (phaseId: string, ingredientId: string, field: string, value: any) => void
  compact?: boolean  // 컴팩트 모드
  className?: string
}

interface PhaseIngredientWithConversion extends Ingredient {
  convertedAmount?: number
  changePercent?: number
}

export default function PhaseIngredientsView({
  recipe,
  multiplier = 1,
  showConversion = true,
  editable = false,
  onIngredientChange,
  compact = false,
  className = ''
}: PhaseIngredientsViewProps) {
  const { t } = useTranslation()
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['main', 'all']))

  // phases가 있으면 사용, 없으면 ingredients를 'main' phase로 래핑
  const phases: IngredientPhase[] = useMemo(() => {
    if (recipe.phases && recipe.phases.length > 0) {
      return recipe.phases.sort((a, b) => a.order - b.order)
    }
    // phases가 없으면 모든 재료를 'main' phase로
    return [{
      id: 'main',
      name: t('components.phaseIngredients.phases.main'),
      nameKo: t('components.phaseIngredients.phases.main'),
      type: 'main' as PhaseType,
      ingredients: recipe.ingredients,
      order: 0
    }]
  }, [recipe.phases, recipe.ingredients, t])

  // 밀가루 총량 계산 (베이커스 퍼센트용)
  const totalFlour = useMemo(() => {
    return phases.reduce((sum, phase) => {
      return sum + phase.ingredients
        .filter(ing => ing.isFlour || ing.category === 'flour')
        .reduce((s, ing) => s + (ing.amount || 0), 0)
    }, 0)
  }, [phases])

  // 변환된 재료 계산
  const convertedPhases = useMemo(() => {
    return phases.map(phase => ({
      ...phase,
      ingredients: phase.ingredients.map(ing => {
        const converted = Math.round((ing.amount || 0) * multiplier * 10) / 10
        const changePercent = multiplier !== 1
          ? Math.round((multiplier - 1) * 100)
          : 0
        return {
          ...ing,
          convertedAmount: converted,
          changePercent
        } as PhaseIngredientWithConversion
      }),
      totalOriginal: phase.ingredients.reduce((s, i) => s + (i.amount || 0), 0),
      totalConverted: Math.round(phase.ingredients.reduce((s, i) => s + (i.amount || 0), 0) * multiplier)
    }))
  }, [phases, multiplier])

  // 전체 합계
  const totals = useMemo(() => {
    const original = convertedPhases.reduce((s, p) => s + p.totalOriginal, 0)
    return {
      original,
      converted: Math.round(original * multiplier),
      changePercent: Math.round((multiplier - 1) * 100)
    }
  }, [convertedPhases, multiplier])

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  const getColorClasses = (color: string, variant: 'bg' | 'border' | 'text' | 'header') => {
    const colors: Record<string, Record<string, string>> = {
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', header: 'bg-amber-100' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', header: 'bg-pink-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', header: 'bg-purple-100' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', header: 'bg-blue-100' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', header: 'bg-orange-100' },
      rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', header: 'bg-rose-100' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', header: 'bg-indigo-100' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', header: 'bg-cyan-100' },
      gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', header: 'bg-gray-100' },
    }
    return colors[color]?.[variant] || colors.gray[variant]
  }

  const renderChangeIndicator = (changePercent: number) => {
    if (changePercent === 0) return null

    if (changePercent > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-green-600 text-[10px]">
          <TrendingUp className="w-3 h-3" />
          +{changePercent}%
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-red-600 text-[10px]">
        <TrendingDown className="w-3 h-3" />
        {changePercent}%
      </span>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {convertedPhases.map(phase => {
        const meta = PHASE_META[phase.type] || PHASE_META.other
        const isExpanded = expandedPhases.has(phase.id) || expandedPhases.has('all')

        return (
          <div
            key={phase.id}
            className={`rounded-lg border ${getColorClasses(meta.color, 'border')} overflow-hidden`}
          >
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phase.id)}
              className={`w-full flex items-center justify-between px-3 py-2 ${getColorClasses(meta.color, 'header')} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-lg">{meta.icon}</span>
                <span className={`font-semibold ${getColorClasses(meta.color, 'text')} ${compact ? 'text-xs' : 'text-sm'}`}>
                  {phase.nameKo || phase.name || t(`components.phaseIngredients.phases.${meta.labelKey}`)}
                </span>
                <span className="text-xs text-gray-500">
                  ({t('components.phaseIngredients.ingredientCount', { count: phase.ingredients.length })})
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {showConversion && multiplier !== 1 ? (
                  <>
                    <span className="text-gray-500">{phase.totalOriginal}g</span>
                    <span className="text-gray-400">→</span>
                    <span className={`font-semibold ${getColorClasses(meta.color, 'text')}`}>
                      {phase.totalConverted}g
                    </span>
                    {renderChangeIndicator(totals.changePercent)}
                  </>
                ) : (
                  <span className={`font-semibold ${getColorClasses(meta.color, 'text')}`}>
                    {phase.totalOriginal}g
                  </span>
                )}
              </div>
            </button>

            {/* Phase Ingredients */}
            {isExpanded && (
              <div className={getColorClasses(meta.color, 'bg')}>
                <table className="w-full">
                  <thead>
                    <tr className={`text-xs ${getColorClasses(meta.color, 'text')} border-b ${getColorClasses(meta.color, 'border')}`}>
                      <th className="px-3 py-1.5 text-left w-8"></th>
                      <th className="px-2 py-1.5 text-left">{t('components.phaseIngredients.ingredient')}</th>
                      <th className="px-2 py-1.5 text-right w-14">B%</th>
                      {showConversion && multiplier !== 1 ? (
                        <>
                          <th className="px-2 py-1.5 text-right w-16">{t('components.phaseIngredients.original')}</th>
                          <th className="px-2 py-1.5 text-center w-6">→</th>
                          <th className="px-2 py-1.5 text-right w-16">{t('components.phaseIngredients.converted')}</th>
                        </>
                      ) : (
                        <th className="px-2 py-1.5 text-right w-16">{t('components.phaseIngredients.weight')}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {phase.ingredients.map((ing: PhaseIngredientWithConversion) => {
                      const bakersPercent = totalFlour > 0
                        ? Math.round(((ing.amount || 0) / totalFlour) * 1000) / 10
                        : 0
                      const categoryIcon = CATEGORY_ICONS[ing.category || 'other'] || '📦'

                      return (
                        <tr
                          key={ing.id}
                          className={`border-b ${getColorClasses(meta.color, 'border')} last:border-b-0 hover:bg-white/50 transition-colors`}
                        >
                          <td className="px-3 py-1.5 text-center">
                            <span title={ing.category}>{categoryIcon}</span>
                          </td>
                          <td className={`px-2 py-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
                            {ing.name}
                            {ing.isFlour && (
                              <span className="ml-1 text-[10px] text-blue-500">({t('components.phaseIngredients.reference')})</span>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-right text-xs font-mono text-gray-500">
                            {bakersPercent > 0 ? `${bakersPercent}%` : '-'}
                          </td>
                          {showConversion && multiplier !== 1 ? (
                            <>
                              <td className="px-2 py-1.5 text-right text-xs font-mono text-gray-500">
                                {ing.amount}g
                              </td>
                              <td className="px-2 py-1.5 text-center text-gray-400">→</td>
                              <td className={`px-2 py-1.5 text-right text-sm font-mono font-semibold ${getColorClasses(meta.color, 'text')}`}>
                                {ing.convertedAmount}g
                              </td>
                            </>
                          ) : (
                            <td className={`px-2 py-1.5 text-right text-sm font-mono font-semibold ${getColorClasses(meta.color, 'text')}`}>
                              {ing.amount}g
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {/* Total Summary */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">
            📊 {t('components.phaseIngredients.totalSummary')}
          </span>
          <div className="flex items-center gap-3">
            {showConversion && multiplier !== 1 ? (
              <>
                <span className="text-gray-500">{totals.original}g</span>
                <span className="text-gray-400">→</span>
                <span className="font-bold text-gray-900 text-lg">{totals.converted}g</span>
                {renderChangeIndicator(totals.changePercent)}
              </>
            ) : (
              <span className="font-bold text-gray-900 text-lg">{totals.original}g</span>
            )}
          </div>
        </div>
        {multiplier !== 1 && (
          <div className="text-xs text-gray-500 mt-1">
            {t('components.phaseIngredients.multiplier')}: ×{multiplier.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}
