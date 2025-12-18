import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'
import AdvancedPanSelector from './AdvancedPanSelector.jsx'
import DDTCalculator from './DDTCalculator.tsx'
import MethodConversionPanel from './MethodConversionPanel'
import PanConversionPanel from './PanConversionPanel'
import EnvironmentAdjustmentPanel from './EnvironmentAdjustmentPanel'
import IngredientComparisonTable from './IngredientComparisonTable'
import { Recipe } from '@/types/recipe.types'

interface ConversionConsoleProps {
  recipe: Recipe | null
  onUpdate: (recipe: any) => void
  onBack: () => void
}

type ConversionType = 'method' | 'pan' | 'advanced-pan' | 'ddt' | 'environment'

function ConversionConsole({ recipe, onUpdate, onBack }: ConversionConsoleProps) {
  const { t } = useTranslation()
  const [conversionType, setConversionType] = useState<ConversionType>('method')
  const [convertedRecipe, setConvertedRecipe] = useState<any>(null)
  const [lastConversionType, setLastConversionType] = useState<ConversionType | null>(null)

  if (!recipe) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {t('components.conversionConsole.noRecipeSelected')}
        </p>
      </div>
    )
  }

  const handleConversion = (converted: any, type: ConversionType) => {
    const newRecipe = {
      ...recipe,
      ...converted,
      convertedFrom: typeof recipe.method === 'string' ? recipe.method : recipe.method.method
    }
    setConvertedRecipe(newRecipe)
    setLastConversionType(type)
  }

  const handleReset = () => {
    setConvertedRecipe(null)
    setLastConversionType(null)
  }

  const applyConversion = () => {
    if (convertedRecipe) {
      onUpdate(convertedRecipe)
    }
  }

  const getMethodName = (method: string | { method: string }) => {
    const methodKey = typeof method === 'string' ? method : method.method;
    return t(`components.conversionConsole.methodNames.${methodKey}`, { defaultValue: methodKey })
  }

  const renderConversionPanel = () => {
    switch (conversionType) {
      case 'method':
        return (
          <MethodConversionPanel
            recipe={recipe}
            onConvert={(converted) => handleConversion(converted, 'method')}
            onReset={handleReset}
          />
        )
      case 'pan':
        return (
          <PanConversionPanel
            recipe={recipe}
            onConvert={(converted) => handleConversion(converted, 'pan')}
            onReset={handleReset}
          />
        )
      case 'advanced-pan':
        return <AdvancedPanSelector recipe={recipe} onPanSelect={() => { }} />
      case 'ddt':
        return (
          <DDTCalculator
            recipe={recipe}
            environment={{ temp: 25, humidity: 60 }}
          />
        )
      case 'environment':
        return (
          <EnvironmentAdjustmentPanel
            recipe={recipe}
            onConvert={(converted) => handleConversion(converted, 'environment')}
            onReset={handleReset}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-2">
        <Button variant="secondary" size="small" onClick={onBack}>
          {t('components.conversionConsole.backToRecipe')}
        </Button>
      </div>

      <div className="card mb-3">
        <h2 className="text-base font-semibold mb-2">{t('components.conversionConsole.recipeConversion')} {recipe.name}</h2>

        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-3 flex-wrap" role="tablist" aria-label={t('components.conversionConsole.selectConversionType')}>
          {(['method', 'pan', 'advanced-pan', 'ddt', 'environment'] as const).map((type) => (
            <button
              key={type}
              role="tab"
              aria-selected={conversionType === type}
              aria-controls={`${type}-panel`}
              onClick={() => setConversionType(type)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${conversionType === type
                ? 'bg-bread-500 text-white'
                : 'bg-bread-200 text-bread-700 hover:bg-bread-300'
                }`}
            >
              {type === 'method' && t('components.conversionConsole.tabs.method')}
              {type === 'pan' && t('components.conversionConsole.tabs.pan')}
              {type === 'advanced-pan' && t('components.conversionConsole.tabs.advancedPan')}
              {type === 'ddt' && t('components.conversionConsole.tabs.ddt')}
              {type === 'environment' && t('components.conversionConsole.tabs.environment')}
            </button>
          ))}
        </div>

        {/* 변환 패널 */}
        {renderConversionPanel()}
      </div>

      {/* 레시피 비교 뷰 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 원본 레시피 */}
        <div className="card border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📋</span>
            <h3 className="text-base font-medium">{t('components.conversionConsole.originalRecipe')} {recipe.name}</h3>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {t('components.conversionConsole.method')} {getMethodName(recipe.method)}
          </p>
          <IngredientComparisonTable
            original={recipe.ingredients}
            converted={recipe.ingredients}
          />
        </div>

        {/* 변환된 레시피 */}
        {convertedRecipe && lastConversionType !== 'ddt' && lastConversionType !== 'advanced-pan' ? (
          <div className="card border-2 border-bread-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔄</span>
              <h3 className="text-base font-medium">{t('components.conversionConsole.convertedRecipe')} {recipe.name}</h3>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {lastConversionType === 'method' && `${t('components.conversionConsole.method')} ${getMethodName(convertedRecipe.method)}`}
              {lastConversionType === 'pan' && `${t('components.conversionConsole.panScaling')} ${convertedRecipe.scalingFactor ? `${(convertedRecipe.scalingFactor * 100).toFixed(0)}%` : ''}`}
              {lastConversionType === 'environment' && t('components.conversionConsole.environmentApplied')}
            </p>
            <IngredientComparisonTable
              original={recipe.ingredients}
              converted={convertedRecipe.ingredients || recipe.ingredients}
              showDifferences={lastConversionType === 'pan' || lastConversionType === 'environment'}
            />
          </div>
        ) : (
          <div className="card border-2 border-dashed border-gray-300">
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">🔄</span>
              <p className="text-gray-500 text-sm">{t('components.conversionConsole.emptyState.line1')}</p>
              <p className="text-gray-500 text-sm">{t('components.conversionConsole.emptyState.line2')}</p>
            </div>
          </div>
        )}
      </div>

      {/* 새 레시피로 저장 버튼 */}
      {convertedRecipe && lastConversionType !== 'ddt' && lastConversionType !== 'advanced-pan' && (
        <div className="mt-3 text-center">
          <Button size="small" onClick={applyConversion}>
            {t('components.conversionConsole.saveAsNew')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ConversionConsole
