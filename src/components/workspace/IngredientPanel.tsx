/**
 * IngredientPanel.tsx
 *
 * 재료 목록 패널
 * - 베이커스% / 중량% / 레시피% 표시
 * - 체크박스로 계량 완료 표시
 * - 큰 글씨로 가독성 확보
 */

import React, { useState } from 'react'
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
        <h2 className="panel-title">재료</h2>
        <span className="ingredient-count">{ingredients.length}개</span>
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
                  {ingredient.name || '재료'}
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
            <p>베이커스 퍼센트: 밀가루 = 100%</p>
          )}
          {calculationMode === 'weight' && (
            <p>중량 퍼센트: 총 반죽량 = 100%</p>
          )}
          {calculationMode === 'recipe' && <p>레시피 퍼센트: 원본 비율</p>}
        </div>
      </div>
    </div>
  )
}
