import { useState } from 'react'
import Button from '../common/Button.jsx'
import PanSelector from './PanSelector.jsx'
import IngredientComparisonTable from './IngredientComparisonTable'
import { BakersPercentage } from '../../utils/calculations/bakersPercentage.ts'
import PanScaling from '../../utils/calculations/panScaling.js'
import PanScalingTS from '../../utils/calculations/panScaling'
import { Recipe, Ingredient, PanConfig, PanType } from '@/types/recipe.types'

interface ConvertedRecipe {
  ingredients: Ingredient[]
  pan?: PanConfig
  scalingFactor?: number
  conversionDetails?: null
}

interface PanConversionPanelProps {
  recipe: Recipe
  onConvert: (converted: ConvertedRecipe) => void
  onReset: () => void
}

export function PanConversionPanel({
  recipe,
  onConvert,
  onReset
}: PanConversionPanelProps) {
  const [targetPan, setTargetPan] = useState<PanConfig | null>(null)
  const [convertedRecipe, setConvertedRecipe] = useState<ConvertedRecipe | null>(null)
  const [conversionLog, setConversionLog] = useState<string>('')

  const handleConversion = () => {
    if (!targetPan) return

    // 현재 레시피의 반죽 총량(g)을 부피(cm³)로 변환하여 현재 팬 부피로 사용
    const totalWeight = recipe.ingredients.reduce(
      (sum, ing) => sum + parseFloat(String(ing.amount) || '0'),
      0
    )

    const doughVolume = (PanScalingTS && PanScalingTS.weightToVolume)
      ? PanScalingTS.weightToVolume(totalWeight)
      : PanScaling.weightToVolume(totalWeight)

    const currentVolume = doughVolume
    const targetVolume = PanScaling.calculatePanVolume(targetPan)
    const scalingFactor = targetVolume / currentVolume

    const logMessage = `현재부피: ${currentVolume.toFixed(0)}cm³ → 목표부피: ${targetVolume.toFixed(0)}cm³, 배율: ${(scalingFactor * 100).toFixed(0)}%`
    setConversionLog(logMessage)

    const scaledIngredients = BakersPercentage.scaleRecipe(
      recipe.ingredients,
      scalingFactor
    )

    const newRecipe: ConvertedRecipe = {
      ingredients: scaledIngredients,
      pan: targetPan,
      scalingFactor,
      conversionDetails: null
    }

    setConvertedRecipe(newRecipe)
    onConvert(newRecipe)
  }

  const handleResetClick = () => {
    setTargetPan(null)
    setConvertedRecipe(null)
    setConversionLog('')
    onReset()
  }

  return (
    <div>
      <PanSelector onPanSelect={setTargetPan} />

      <div className="mt-3 flex gap-2">
        <Button size="small" onClick={handleConversion}>
          변환 계산
        </Button>
        <Button size="small" variant="secondary" onClick={handleResetClick}>
          초기화
        </Button>
      </div>

      {conversionLog && (
        <div className="mt-3 p-2 bg-blue-50 rounded">
          <p className="text-xs font-medium text-blue-700">팬 변환 정보</p>
          <p className="text-xs text-blue-600 mt-1">{conversionLog}</p>
        </div>
      )}

      {convertedRecipe && (
        <div className="mt-4 p-4 bg-bread-50 rounded-lg">
          <h4 className="font-medium text-bread-700 mb-3">
            변환 결과 ({convertedRecipe.scalingFactor && `${(convertedRecipe.scalingFactor * 100).toFixed(0)}%`})
          </h4>

          <IngredientComparisonTable
            original={recipe.ingredients}
            converted={convertedRecipe.ingredients}
            showDifferences={true}
          />

          {convertedRecipe.pan && (
            <div className="mt-3 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700">선택된 팬:</p>
              <p className="text-xs text-gray-600 mt-1">
                타입: {convertedRecipe.pan.type}
              </p>
              {convertedRecipe.pan.dimensions.diameter && (
                <p className="text-xs text-gray-600">
                  지름: {convertedRecipe.pan.dimensions.diameter}cm,
                  높이: {convertedRecipe.pan.dimensions.height}cm
                </p>
              )}
              {convertedRecipe.pan.dimensions.length && (
                <p className="text-xs text-gray-600">
                  크기: {convertedRecipe.pan.dimensions.length}cm × {convertedRecipe.pan.dimensions.width}cm × {convertedRecipe.pan.dimensions.height}cm
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PanConversionPanel
