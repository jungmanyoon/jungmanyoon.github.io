/**
 * RecipeDetailPanel.tsx
 *
 * 레시피 상세 패널 - 한 화면에 모든 정보
 * - 상단: 제목, 팬 선택, 제법 선택, 배수 조정
 * - 중단: 재료 목록 (왼쪽 40%) | 공정 단계 (오른쪽 60%)
 * - 하단: 메타 정보
 */

import React from 'react'
import type { Recipe } from '@/types/recipe.types'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { PAN_PRESETS } from '@/utils/calculations/realtimeCalculator'
import IngredientPanel from './IngredientPanel'
import ProcessPanel from './ProcessPanel'
import './RecipeDetailPanel.css'

interface RecipeDetailPanelProps {
  recipe: Recipe
}

export default function RecipeDetailPanel({ recipe }: RecipeDetailPanelProps) {
  const {
    selectedPanConfig,
    selectedMethod,
    calculationMode,
    batchMultiplier,
    calculatedIngredients,
    totalDoughWeight,
    changePan,
    changeMethod,
    setCalculationMode,
    setBatchMultiplier,
  } = useWorkspaceStore()

  const handlePanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const panId = e.target.value
    const newPan = PAN_PRESETS[panId]
    if (newPan) {
      changePan(newPan)
    }
  }

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeMethod(e.target.value as any)
  }

  const handleCalculationModeChange = (mode: typeof calculationMode) => {
    setCalculationMode(mode)
  }

  const handleBatchChange = (multiplier: number) => {
    setBatchMultiplier(multiplier)
  }

  return (
    <div className="recipe-detail-panel">
      {/* 헤더: 제목 + 컨트롤 */}
      <header className="recipe-header">
        <div className="recipe-title-section">
          <h1 className="recipe-title">{recipe.nameKo || recipe.name}</h1>
          <div className="recipe-controls">
            {/* 팬 선택 */}
            <div className="control-group">
              <label htmlFor="pan-select">팬 크기</label>
              <select
                id="pan-select"
                className="control-select"
                value={
                  Object.keys(PAN_PRESETS).find(
                    (key) => PAN_PRESETS[key].id === selectedPanConfig?.id
                  ) || ''
                }
                onChange={handlePanChange}
              >
                <option value="">원본 크기</option>
                {Object.entries(PAN_PRESETS).map(([key, pan]) => (
                  <option key={key} value={key}>
                    {pan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 제법 선택 */}
            <div className="control-group">
              <label htmlFor="method-select">제법</label>
              <select
                id="method-select"
                className="control-select"
                value={selectedMethod}
                onChange={handleMethodChange}
              >
                <option value="straight">직반죽</option>
                <option value="sponge">스펀지법</option>
                <option value="poolish">폴리시법</option>
                <option value="biga">비가법</option>
                <option value="overnight">냉장 숙성</option>
              </select>
            </div>

            {/* 배수 조정 */}
            <div className="control-group">
              <label>배수</label>
              <div className="batch-buttons">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    className={`batch-button ${
                      batchMultiplier === n ? 'active' : ''
                    }`}
                    onClick={() => handleBatchChange(n)}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            {/* 퍼센트 모드 */}
            <div className="control-group">
              <label>표시 방식</label>
              <div className="mode-buttons">
                <button
                  className={`mode-button ${
                    calculationMode === 'bakers' ? 'active' : ''
                  }`}
                  onClick={() => handleCalculationModeChange('bakers')}
                  title="베이커스 퍼센트 (밀가루 = 100%)"
                >
                  베이커스%
                </button>
                <button
                  className={`mode-button ${
                    calculationMode === 'weight' ? 'active' : ''
                  }`}
                  onClick={() => handleCalculationModeChange('weight')}
                  title="중량 퍼센트 (총 반죽량 = 100%)"
                >
                  중량%
                </button>
                <button
                  className={`mode-button ${
                    calculationMode === 'recipe' ? 'active' : ''
                  }`}
                  onClick={() => handleCalculationModeChange('recipe')}
                  title="레시피 퍼센트 (원본 비율)"
                >
                  레시피%
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 총 반죽량 표시 */}
        <div className="total-weight-display">
          <span className="total-label">총 반죽량</span>
          <span className="total-value">{totalDoughWeight}g</span>
        </div>
      </header>

      {/* 메인 컨텐츠: 재료 + 공정 */}
      <div className="recipe-content">
        <IngredientPanel
          ingredients={calculatedIngredients}
          calculationMode={calculationMode}
        />
        <ProcessPanel
          steps={recipe.steps || []}
          ovenSettings={recipe.ovenSettings}
          selectedMethod={selectedMethod}
          originalMethod={recipe.method?.method}
        />
      </div>

      {/* 푸터: 메타 정보 */}
      <footer className="recipe-footer">
        <div className="meta-item">
          <span className="meta-label">난이도:</span>
          <span className="meta-value">
            {'★'.repeat(recipe.difficulty || 1)}
            {'☆'.repeat(5 - (recipe.difficulty || 1))}
          </span>
        </div>
        {recipe.totalTime && (
          <div className="meta-item">
            <span className="meta-label">총 소요시간:</span>
            <span className="meta-value">{recipe.totalTime}분</span>
          </div>
        )}
        {recipe.category && (
          <div className="meta-item">
            <span className="meta-label">카테고리:</span>
            <span className="meta-value">{recipe.category}</span>
          </div>
        )}
      </footer>
    </div>
  )
}
