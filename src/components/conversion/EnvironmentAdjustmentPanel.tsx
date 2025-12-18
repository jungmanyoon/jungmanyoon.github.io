import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'
import EnvironmentControls from './EnvironmentControls.jsx'
import IngredientComparisonTable from './IngredientComparisonTable'
import Environmental from '../../utils/calculations/environmental.js'
import EnvironmentalTS from '../../utils/calculations/environmental'
import { Recipe, Ingredient } from '@/types/recipe.types'

interface Environment {
  temp: number
  humidity: number
  altitude: number
}

interface ConvertedRecipe {
  ingredients: Ingredient[]
  bakingTemp?: number
  bakingTime?: number
  adjustments?: {
    temperature?: {
      pressure: number
      boilingPoint: number
    }
    humidity?: {
      humidity: number
    }
    altitude?: {
      altitude: number
    }
  }
}

interface EnvironmentAdjustmentPanelProps {
  recipe: Recipe
  onConvert: (converted: ConvertedRecipe) => void
  onReset: () => void
}

export function EnvironmentAdjustmentPanel({
  recipe,
  onConvert,
  onReset
}: EnvironmentAdjustmentPanelProps) {
  const { t } = useTranslation()
  const [environment, setEnvironment] = useState<Environment>({
    temp: 25,
    humidity: 60,
    altitude: 0
  })
  const [convertedRecipe, setConvertedRecipe] = useState<ConvertedRecipe | null>(null)

  const handleAdjustment = () => {
    const adjusted = (EnvironmentalTS && EnvironmentalTS.adjustRecipeForEnvironment)
      ? EnvironmentalTS.adjustRecipeForEnvironment(recipe, environment)
      : Environmental.adjustRecipeForEnvironment(recipe, environment)

    setConvertedRecipe(adjusted)
    onConvert(adjusted)
  }

  const handleResetClick = () => {
    setEnvironment({ temp: 25, humidity: 60, altitude: 0 })
    setConvertedRecipe(null)
    onReset()
  }



  return (
    <div>
      <EnvironmentControls
        environment={environment}
        onChange={setEnvironment}
      />

      <div className="mt-3 flex gap-2">
        <Button size="small" onClick={handleAdjustment}>
          {t('components.environmentAdjustmentPanel.convert')}
        </Button>
        <Button size="small" variant="secondary" onClick={handleResetClick}>
          {t('components.environmentAdjustmentPanel.reset')}
        </Button>
      </div>

      {convertedRecipe && (
        <div className="mt-4 p-4 bg-bread-50 rounded-lg">
          <h4 className="font-medium text-bread-700 mb-3">{t('components.environmentAdjustmentPanel.adjustmentResult')}</h4>

          <IngredientComparisonTable
            original={recipe.ingredients}
            converted={convertedRecipe.ingredients}
            showDifferences={true}
          />

          {convertedRecipe.adjustments && (
            <div className="mt-3 p-2 bg-bread-100 rounded">
              <p className="text-xs font-medium text-bread-700 mb-2">{t('components.environmentAdjustmentPanel.adjustmentDetails')}</p>

              {/* 온도 보정 */}
              {convertedRecipe.adjustments.temperature && (
                <div className="mb-2">
                  <p className="text-xs text-gray-700">
                    <strong>{t('components.environmentAdjustmentPanel.temperature')}</strong> {environment.temp}°C
                  </p>
                  {convertedRecipe.adjustments.temperature.pressure && (
                    <p className="text-xs text-gray-600">
                      {t('components.environmentAdjustmentPanel.pressure')} {convertedRecipe.adjustments.temperature.pressure.toFixed(2)} kPa
                    </p>
                  )}
                  {convertedRecipe.adjustments.temperature.boilingPoint && (
                    <p className="text-xs text-gray-600">
                      {t('components.environmentAdjustmentPanel.boilingPoint')} {convertedRecipe.adjustments.temperature.boilingPoint.toFixed(1)}°C
                    </p>
                  )}
                </div>
              )}

              {/* 습도 보정 */}
              {convertedRecipe.adjustments.humidity && (
                <div className="mb-2">
                  <p className="text-xs text-gray-700">
                    <strong>{t('components.environmentAdjustmentPanel.humidity')}</strong> {convertedRecipe.adjustments.humidity.humidity}%
                  </p>
                  {environment.humidity <= 40 && (
                    <p className="text-xs text-amber-700">
                      {t('components.environmentAdjustmentPanel.dryEnv')}
                    </p>
                  )}
                  {environment.humidity >= 70 && (
                    <p className="text-xs text-blue-700">
                      {t('components.environmentAdjustmentPanel.wetEnv')}
                    </p>
                  )}
                </div>
              )}

              {/* 고도 보정 */}
              {convertedRecipe.adjustments.altitude && environment.altitude > 0 && (
                <div>
                  <p className="text-xs text-gray-700">
                    <strong>{t('components.environmentAdjustmentPanel.altitude')}</strong> {convertedRecipe.adjustments.altitude.altitude}m
                  </p>
                  {environment.altitude > 1000 && (
                    <>
                      <p className="text-xs text-amber-700">
                        {t('components.environmentAdjustmentPanel.highAltitude')}
                      </p>
                      <p className="text-xs text-amber-700">
                        {t('components.environmentAdjustmentPanel.highAltitudeTime')}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 베이킹 설정 변화 */}
          {(convertedRecipe.bakingTemp || convertedRecipe.bakingTime) && (
            <div className="mt-3 p-2 bg-orange-50 rounded">
              <p className="text-xs font-medium text-orange-700 mb-1">{t('components.environmentAdjustmentPanel.bakingSettings')}</p>
              {convertedRecipe.bakingTemp && (
                <p className="text-xs text-orange-600">
                  {t('components.environmentAdjustmentPanel.tempValue', { temp: convertedRecipe.bakingTemp })}
                  {recipe.ovenSettings?.temperature && recipe.ovenSettings.temperature !== convertedRecipe.bakingTemp && (
                    <span className="ml-1">
                      {t('components.environmentAdjustmentPanel.tempOriginal', { temp: recipe.ovenSettings.temperature })}
                    </span>
                  )}
                </p>
              )}
              {convertedRecipe.bakingTime && (
                <p className="text-xs text-orange-600">
                  {t('components.environmentAdjustmentPanel.timeValue', { time: convertedRecipe.bakingTime })}
                  {recipe.bakingTime && recipe.bakingTime !== convertedRecipe.bakingTime && (
                    <span className="ml-1">
                      {t('components.environmentAdjustmentPanel.timeOriginal', { time: recipe.bakingTime })}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* 환경 요약 */}
          <div className="mt-3 p-2 bg-gray-50 rounded">
            <p className="text-xs font-medium text-gray-700 mb-1">{t('components.environmentAdjustmentPanel.currentEnv')}</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">{t('components.environmentAdjustmentPanel.temperature')}</span> {environment.temp}°C
              </div>
              <div>
                <span className="font-medium">{t('components.environmentAdjustmentPanel.humidity')}</span> {environment.humidity}%
              </div>
              <div>
                <span className="font-medium">{t('components.environmentAdjustmentPanel.altitude')}</span> {environment.altitude}m
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvironmentAdjustmentPanel
