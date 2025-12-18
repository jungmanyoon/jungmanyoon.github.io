/**
 * IngredientPanel.tsx
 *
 * 재료 목록 패널
 * - 베이커스% / 중량% / 레시피% 표시
 * - 체크박스로 계량 완료 표시
 * - 큰 글씨로 가독성 확보
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Ingredient } from '@/types/recipe.types'
import {
  calculateBakersPercentage,
  calculateWeightPercentage,
} from '@/stores/useWorkspaceStore'
import type { CalculationMode } from '@/stores/useWorkspaceStore'
import './IngredientPanel.css'

interface IngredientPanelProps {
  ingredients: Ingredient[]
  calculationMode: CalculationMode
}

export default function IngredientPanel({
  ingredients,
  calculationMode,
}: IngredientPanelProps) {
  const { t } = useTranslation()
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // 퍼센트 계산
  const ingredientsWithPercentage = React.useMemo(() => {
    switch (calculationMode) {
      case 'bakers':
        return calculateBakersPercentage(ingredients)
      case 'weight':
        return calculateWeightPercentage(ingredients)
      case 'recipe':
        return ingredients // 원본 퍼센트 유지
      default:
        return ingredients
    }
  }, [ingredients, calculationMode])

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getPercentageValue = (ingredient: Ingredient): number | null => {
    switch (calculationMode) {
      case 'bakers':
        return ingredient.bakersPercentage || null
      case 'weight':
        return ingredient.weightPercentage || null
      case 'recipe':
        return ingredient.bakersPercentage || null // 원본 값
      default:
        return null
    }
  }

  return (
    <div className="ingredient-panel">
      <div className="panel-header">
        <h2 className="panel-title">{t('components.ingredientPanel.title')}</h2>
        <span className="ingredient-count">{t('components.ingredientPanel.count', { count: ingredients.length })}</span>
      </div>

      <div className="ingredient-list">
        {ingredientsWithPercentage.map((ingredient, index) => {
          const isChecked = checkedItems.has(ingredient.id || `ing-${index}`)
          const percentage = getPercentageValue(ingredient)

          return (
            <div
              key={ingredient.id || `ing-${index}`}
              className={`ingredient-item ${isChecked ? 'checked' : ''}`}
            >
              <label className="ingredient-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    toggleCheck(ingredient.id || `ing-${index}`)
                  }
                />
                <span className="checkbox-custom"></span>
              </label>

              <div className="ingredient-info">
                <span className="ingredient-name">
                  {ingredient.name || t('components.ingredientPanel.defaultName')}
                </span>
                <div className="ingredient-amounts">
                  <span className="ingredient-weight">
                    {ingredient.amount}
                    {ingredient.unit || 'g'}
                  </span>
                  {percentage !== null && (
                    <span className="ingredient-percentage">
                      ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 퍼센트 모드 설명 */}
      <div className="panel-footer">
        <div className="mode-explanation">
          {calculationMode === 'bakers' && (
            <p>{t('components.ingredientPanel.bakersExplain')}</p>
          )}
          {calculationMode === 'weight' && (
            <p>{t('components.ingredientPanel.weightExplain')}</p>
          )}
          {calculationMode === 'recipe' && <p>{t('components.ingredientPanel.recipeExplain')}</p>}
        </div>
      </div>
    </div>
  )
}
