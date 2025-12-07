import { useState } from 'react'
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
  const [conversionType, setConversionType] = useState<ConversionType>('method')
  const [convertedRecipe, setConvertedRecipe] = useState<any>(null)
  const [lastConversionType, setLastConversionType] = useState<ConversionType | null>(null)

  if (!recipe) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          레시피가 선택되지 않았습니다. 좌측 상단의 레시피 탭에서 카드를 클릭하세요.
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

    const methodNames: Record<string, string> = {
      straight: '스트레이트법',
      sponge: '중종법',
      poolish: '폴리쉬법',
      biga: '비가법',
      coldFermentation: '저온숙성법',
      noTime: '노타임법',
      overnight: '저온숙성법',
      sourdough: '사워도우'
    }
    return methodNames[methodKey] || methodKey
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
          ← 레시피로 돌아가기
        </Button>
      </div>

      <div className="card mb-3">
        <h2 className="text-base font-semibold mb-2">레시피 변환: {recipe.name}</h2>

        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-3 flex-wrap" role="tablist" aria-label="변환 유형 선택">
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
              {type === 'method' && '제법 변환'}
              {type === 'pan' && '팬 크기 조정'}
              {type === 'advanced-pan' && '고급 팬 선택'}
              {type === 'ddt' && 'DDT 계산'}
              {type === 'environment' && '환경 보정'}
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
            <h3 className="text-base font-medium">원본 레시피: {recipe.name}</h3>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            제법: {getMethodName(recipe.method)}
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
              <h3 className="text-base font-medium">변환된 레시피: {recipe.name}</h3>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {lastConversionType === 'method' && `제법: ${getMethodName(convertedRecipe.method)}`}
              {lastConversionType === 'pan' && `팬 크기 조정: ${convertedRecipe.scalingFactor ? `${(convertedRecipe.scalingFactor * 100).toFixed(0)}%` : ''}`}
              {lastConversionType === 'environment' && '환경 보정 적용'}
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
              <p className="text-gray-500 text-sm">변환할 제법을 선택하고</p>
              <p className="text-gray-500 text-sm">"변환 계산" 버튼을 클릭하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* 새 레시피로 저장 버튼 */}
      {convertedRecipe && lastConversionType !== 'ddt' && lastConversionType !== 'advanced-pan' && (
        <div className="mt-3 text-center">
          <Button size="small" onClick={applyConversion}>
            새 레시피로 저장
          </Button>
        </div>
      )}
    </div>
  )
}

export default ConversionConsole
