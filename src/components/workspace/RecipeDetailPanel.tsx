/**
 * RecipeDetailPanel.tsx
 *
 * 레시피 상세 패널 - 한 화면에 모든 정보
 * - 상단: 제목, 팬 선택, 제법 선택, 배수 조정
 * - 중단: 재료 목록 (왼쪽 40%) | 공정 단계 (오른쪽 60%)
 * - 하단: 메타 정보
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
              <label htmlFor="pan-select">{t('components.recipeDetail.panSize')}</label>
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
                <option value="">{t('components.recipeDetail.originalSize')}</option>
                {Object.entries(PAN_PRESETS).map(([key, pan]) => (
                  <option key={key} value={key}>
                    {pan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 제법 선택 */}
            <div className="control-group">
              <label htmlFor="method-select">{t('components.recipeDetail.method')}</label>
              <select
                id="method-select"
                className="control-select"
                value={selectedMethod}
                onChange={handleMethodChange}
              >
                <option value="straight">{t('components.recipeDetail.methods.straight')}</option>
                <option value="sponge">{t('components.recipeDetail.methods.sponge')}</option>
                <option value="poolish">{t('components.recipeDetail.methods.poolish')}</option>
                <option value="biga">{t('components.recipeDetail.methods.biga')}</option>
                <option value="overnight">{t('components.recipeDetail.methods.overnight')}</option>
              </select>
            </div>

            {/* 배수 조정 */}
            <div className="control-group">
              <label>{t('components.recipeDetail.multiplier')}</label>
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
              <label>{t('components.recipeDetail.displayMode')}</label>
              <div className="mode-buttons">
                <button
                  className={`mode-button ${
                    calculationMode === 'bakers' ? 'active' : ''
                  }`}
                  onClick={() => handleCalculationModeChange('bakers')}
                  title={t('components.recipeDetail.bakersPercentTitle')}
                >
                  {t('components.recipeDetail.bakersPercent')}
                </button>
                <button
                  className={`mode-button ${
                    calculationMode === 'weight' ? 'active' : ''
                  }`}
                  onClick={() => handleCalculationModeChange('weight')}
                  title={t('components.recipeDetail.weightPercentTitle')}
                >
                  {t('components.recipeDetail.weightPercent')}
                </button>
                <button
                  className={`mode-button ${
                    calculationMode === 'recipe' ? 'active' : ''
                  }`}
                  onClick={() => handleCalculationModeChange('recipe')}
                  title={t('components.recipeDetail.recipePercentTitle')}
                >
                  {t('components.recipeDetail.recipePercent')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 총 반죽량 표시 */}
        <div className="total-weight-display">
          <span className="total-label">{t('components.recipeDetail.totalDough')}</span>
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
          <span className="meta-label">{t('components.recipeDetail.difficulty')}</span>
          <span className="meta-value">
            {'★'.repeat(recipe.difficulty || 1)}
            {'☆'.repeat(5 - (recipe.difficulty || 1))}
          </span>
        </div>
        {recipe.totalTime && (
          <div className="meta-item">
            <span className="meta-label">{t('components.recipeDetail.totalTime')}</span>
            <span className="meta-value">{recipe.totalTime}{t('components.recipeListSidebar.timeUnit')}</span>
          </div>
        )}
        {recipe.category && (
          <div className="meta-item">
            <span className="meta-label">{t('components.recipeDetail.category')}</span>
            <span className="meta-value">{recipe.category}</span>
          </div>
        )}
      </footer>
    </div>
  )
}
