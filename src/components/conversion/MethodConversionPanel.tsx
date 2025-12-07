import { useState } from 'react'
import Button from '../common/Button.jsx'
import MethodSelector from './MethodSelector.jsx'
import IngredientComparisonTable from './IngredientComparisonTable'
import MethodConversion from '../../utils/calculations/methodConversion.js'
import { Recipe, Ingredient } from '@/types/recipe.types'

interface ConvertedRecipe {
  method: string
  conversionDetails?: {
    sponge?: Ingredient[]
    poolish?: Ingredient[]
    biga?: Ingredient[]
    mainDough?: Ingredient[]
    fermentationTime?: Record<string, string>
    instructions?: string[]
    notes?: string
    ingredients?: Ingredient[]
  }
  ingredients?: Ingredient[]
}

interface MethodConversionPanelProps {
  recipe: Recipe
  onConvert: (converted: ConvertedRecipe) => void
  onReset: () => void
}

export function MethodConversionPanel({
  recipe,
  onConvert,
  onReset
}: MethodConversionPanelProps) {

  const [selectedMethod, setSelectedMethod] = useState<string>('sponge')
  const [convertedRecipe, setConvertedRecipe] = useState<ConvertedRecipe | null>(null)

  const handleConversion = () => {
    let converted: any

    switch (selectedMethod) {
      case 'sponge':
        converted = MethodConversion.straightToSponge(recipe.ingredients)
        break
      case 'poolish':
        converted = MethodConversion.straightToPoolish(recipe.ingredients)
        break
      case 'biga':
        converted = MethodConversion.straightToBiga(recipe.ingredients)
        break
      case 'coldFermentation':
        converted = MethodConversion.straightToColdFermentation(recipe.ingredients)
        break
      case 'noTime':
        converted = MethodConversion.straightToNoTime(recipe.ingredients)
        break
      default:
        return
    }

    const newRecipe: ConvertedRecipe = {
      method: selectedMethod,
      conversionDetails: converted,
      ingredients: converted.ingredients || recipe.ingredients // Fallback to original ingredients if not present
    }

    setConvertedRecipe(newRecipe)
    onConvert(newRecipe)
  }

  const handleResetClick = () => {
    setSelectedMethod('sponge')
    setConvertedRecipe(null)
    onReset()
  }

  return (
    <div>
      <MethodSelector
        currentMethod={typeof recipe.method === 'string' ? recipe.method : recipe.method.method}
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
      />

      <div className="mt-3 flex gap-2">
        <Button size="small" onClick={handleConversion}>
          변환 계산
        </Button>
        <Button size="small" variant="secondary" onClick={handleResetClick}>
          초기화
        </Button>
      </div>

      {convertedRecipe && convertedRecipe.conversionDetails && (
        <div className="mt-4 p-4 bg-bread-50 rounded-lg">
          <h4 className="font-medium text-bread-700 mb-3">변환 결과</h4>

          {/* 중종/폴리쉬/비가 */}
          {convertedRecipe.conversionDetails.sponge && (
            <IngredientComparisonTable
              original={recipe.ingredients}
              converted={convertedRecipe.conversionDetails.sponge}
              title="중종"
            />
          )}
          {convertedRecipe.conversionDetails.poolish && (
            <IngredientComparisonTable
              original={recipe.ingredients}
              converted={convertedRecipe.conversionDetails.poolish}
              title="폴리쉬"
            />
          )}
          {convertedRecipe.conversionDetails.biga && (
            <IngredientComparisonTable
              original={recipe.ingredients}
              converted={convertedRecipe.conversionDetails.biga}
              title="비가"
            />
          )}

          {/* 본반죽 */}
          {convertedRecipe.conversionDetails.mainDough && (
            <IngredientComparisonTable
              original={recipe.ingredients}
              converted={convertedRecipe.conversionDetails.mainDough}
              title="본반죽"
            />
          )}

          {/* 단순 재료 변환 (저온숙성, 노타임) */}
          {convertedRecipe.conversionDetails.ingredients && (
            <IngredientComparisonTable
              original={recipe.ingredients}
              converted={convertedRecipe.conversionDetails.ingredients}
              showDifferences={true}
            />
          )}

          {/* 발효 시간 */}
          {convertedRecipe.conversionDetails.fermentationTime && (
            <div className="mt-3 p-2 bg-yellow-50 rounded">
              <p className="font-medium mb-1 text-sm">발효 시간:</p>
              {Object.entries(convertedRecipe.conversionDetails.fermentationTime).map(([key, value]) => (
                <p key={key} className="text-xs">
                  {key === 'sponge' && '중종 발효: '}
                  {key === 'poolish' && '폴리쉬 발효: '}
                  {key === 'biga' && '비가 발효: '}
                  {key === 'mainDough' && '본반죽 발효: '}
                  {key === 'cold' && '저온 발효: '}
                  {key === 'room' && '실온 적응: '}
                  {key === 'total' && '전체 발효: '}
                  {value}
                </p>
              ))}
            </div>
          )}

          {/* 만드는 방법 */}
          {convertedRecipe.conversionDetails.instructions && (
            <div className="mt-3">
              <p className="font-medium mb-1 text-sm">만드는 방법:</p>
              <ol className="list-decimal list-inside text-xs space-y-1">
                {convertedRecipe.conversionDetails.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {/* 참고사항 */}
          {convertedRecipe.conversionDetails.notes && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
              <p className="text-xs text-amber-800">
                <strong>참고:</strong> {convertedRecipe.conversionDetails.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MethodConversionPanel
