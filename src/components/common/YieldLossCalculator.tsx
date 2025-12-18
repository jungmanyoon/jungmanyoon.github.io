/**
 * 수율 손실 예측 컴포넌트
 * 투입 중량에서 예상 산출량을 계산하고 공정별 손실을 시각화
 * 공정별 선택 기능 지원
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  calculateYieldLoss,
  calculateRequiredInput,
  ProductCategory,
  YieldLossResult,
  ProcessStageSelection,
  DEFAULT_STAGE_SELECTION
} from '@/utils/calculations/yieldLoss'
import { ChevronDown, ChevronUp, TrendingDown, Scale, Info, AlertTriangle, Check } from 'lucide-react'

interface YieldLossCalculatorProps {
  /** 투입 중량 (g) - 외부에서 전달 */
  inputWeight?: number
  /** 제품 카테고리 */
  category?: ProductCategory
  /** 세부 제품 타입 */
  productType?: string
  /** 환경 요인 (습도, 온도) */
  environment?: {
    humidity?: number
    temperature?: number
  }
  /** 공정 선택 상태 (외부에서 전달) */
  stageSelection?: ProcessStageSelection
  /** 공정 선택 변경 시 콜백 */
  onStageSelectionChange?: (selection: ProcessStageSelection) => void
  /** 컴팩트 모드 (간략 표시) */
  compact?: boolean
  /** 클래스명 */
  className?: string
}

// 제품 카테고리 옵션 (keys for translation)
const CATEGORY_KEYS: { value: ProductCategory; key: string }[] = [
  { value: 'bread', key: 'bread' },
  { value: 'cake', key: 'cake' },
  { value: 'pastry', key: 'pastry' },
  { value: 'cookie', key: 'cookie' },
  { value: 'other', key: 'other' }
]

// 세부 제품 타입 옵션 (keys for translation)
const PRODUCT_TYPE_KEYS: Record<ProductCategory, { value: string; key: string }[]> = {
  bread: [
    { value: '', key: 'general_bread' },
    { value: 'pullman', key: 'pullman' },
    { value: 'mountain', key: 'mountain' },
    { value: 'brioche', key: 'brioche' },
    { value: 'baguette', key: 'baguette' },
    { value: 'ciabatta', key: 'ciabatta' },
    { value: 'sourdough', key: 'sourdough' }
  ],
  cake: [
    { value: '', key: 'general_cake' },
    { value: 'genoise', key: 'genoise' },
    { value: 'chiffon', key: 'chiffon' },
    { value: 'pound', key: 'pound' },
    { value: 'brownie', key: 'brownie' },
    { value: 'cheesecake', key: 'cheesecake' }
  ],
  pastry: [
    { value: '', key: 'general_pastry' },
    { value: 'croissant', key: 'croissant' },
    { value: 'danish', key: 'danish' },
    { value: 'puff_pastry', key: 'puff_pastry' }
  ],
  cookie: [
    { value: '', key: 'general_cookie' },
    { value: 'cookie', key: 'cookie' },
    { value: 'scone', key: 'scone' }
  ],
  other: [
    { value: '', key: 'general_other' },
    { value: 'tart', key: 'tart' }
  ]
}

// 공정 정보 (keys for translation)
const STAGE_KEYS: { key: keyof ProcessStageSelection; translationKey: string; icon: string }[] = [
  { key: 'mixing', translationKey: 'mixing', icon: '🥣' },
  { key: 'fermentation', translationKey: 'fermentation', icon: '🍞' },
  { key: 'dividing', translationKey: 'dividing', icon: '✂️' },
  { key: 'shaping', translationKey: 'shaping', icon: '👐' },
  { key: 'baking', translationKey: 'baking', icon: '🔥' },
  { key: 'cooling', translationKey: 'cooling', icon: '❄️' }
]

export default function YieldLossCalculator({
  inputWeight: externalInputWeight,
  category: externalCategory,
  productType: externalProductType,
  environment: externalEnvironment,
  stageSelection: externalStageSelection,
  onStageSelectionChange,
  compact = false,
  className = ''
}: YieldLossCalculatorProps) {
  const { t } = useTranslation()
  // 내부 상태 (외부 prop이 없을 때 사용)
  const [internalInputWeight, setInternalInputWeight] = useState(1000)
  const [internalCategory, setInternalCategory] = useState<ProductCategory>('bread')
  const [internalProductType, setInternalProductType] = useState('')
  const [humidity, setHumidity] = useState(60)
  const [temperature, setTemperature] = useState(25)
  const [showDetails, setShowDetails] = useState(!compact)
  const [showEnvironment, setShowEnvironment] = useState(false)
  const [showStageSelection, setShowStageSelection] = useState(true)
  const [mode, setMode] = useState<'forward' | 'reverse'>('forward')
  const [targetOutput, setTargetOutput] = useState(800)
  const [internalStageSelection, setInternalStageSelection] = useState<ProcessStageSelection>(DEFAULT_STAGE_SELECTION)

  // 외부 prop 우선, 없으면 내부 상태 사용
  const inputWeight = externalInputWeight ?? internalInputWeight
  const category = externalCategory ?? internalCategory
  const productType = externalProductType ?? internalProductType
  const environment = externalEnvironment ?? { humidity, temperature }
  const stageSelection = externalStageSelection ?? internalStageSelection

  // 공정 선택 변경 핸들러
  const handleStageToggle = useCallback((stageKey: keyof ProcessStageSelection) => {
    const newSelection = {
      ...stageSelection,
      [stageKey]: !stageSelection[stageKey]
    }

    if (onStageSelectionChange) {
      onStageSelectionChange(newSelection)
    } else {
      setInternalStageSelection(newSelection)
    }
  }, [stageSelection, onStageSelectionChange])

  // 전체 선택/해제
  const handleSelectAll = useCallback((selectAll: boolean) => {
    const newSelection: ProcessStageSelection = {
      mixing: selectAll,
      fermentation: selectAll,
      dividing: selectAll,
      shaping: selectAll,
      baking: selectAll,
      cooling: selectAll
    }

    if (onStageSelectionChange) {
      onStageSelectionChange(newSelection)
    } else {
      setInternalStageSelection(newSelection)
    }
  }, [onStageSelectionChange])

  // 선택된 공정 수 계산
  const selectedCount = useMemo(() => {
    return Object.values(stageSelection).filter(Boolean).length
  }, [stageSelection])

  // 수율 계산
  const result = useMemo<YieldLossResult | null>(() => {
    if (inputWeight <= 0) return null
    return calculateYieldLoss(inputWeight, category, productType || undefined, environment, stageSelection)
  }, [inputWeight, category, productType, environment, stageSelection])

  // 역산 계산 (목표 산출량 → 필요 투입량)
  const requiredInput = useMemo(() => {
    if (targetOutput <= 0) return 0
    return calculateRequiredInput(targetOutput, category, productType || undefined, environment, stageSelection)
  }, [targetOutput, category, productType, environment, stageSelection])

  // 손실률 색상
  const getLossColor = (percent: number) => {
    if (percent >= 15) return 'text-red-600'
    if (percent >= 10) return 'text-orange-500'
    if (percent >= 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  // 컴팩트 모드
  if (compact && result) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <TrendingDown className="w-4 h-4 text-orange-500" />
        <span>
          {t('components.yieldLoss.expectedOutput')}: <b className="text-blue-600">{result.outputWeight.toLocaleString()}g</b>
          <span className={`ml-1 ${getLossColor(result.totalLossPercent)}`}>
            (-{result.totalLossPercent}%)
          </span>
          {selectedCount < 6 && (
            <span className="ml-1 text-gray-400 text-xs">({selectedCount}{t('components.yieldLoss.processes')})</span>
          )}
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-800">{t('components.yieldLoss.title')}</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('forward')}
            className={`px-2 py-1 text-xs rounded ${mode === 'forward' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {t('components.yieldLoss.inputToOutput')}
          </button>
          <button
            onClick={() => setMode('reverse')}
            className={`px-2 py-1 text-xs rounded ${mode === 'reverse' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {t('components.yieldLoss.outputToInput')}
          </button>
        </div>
      </div>

      {/* 입력 섹션 */}
      <div className="p-3 space-y-3">
        {/* 제품 선택 (외부 prop이 없을 때만 표시) */}
        {!externalCategory && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('components.yieldLoss.productType')}</label>
              <select
                value={internalCategory}
                onChange={(e) => {
                  setInternalCategory(e.target.value as ProductCategory)
                  setInternalProductType('')
                }}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                {CATEGORY_KEYS.map(opt => (
                  <option key={opt.value} value={opt.value}>{t(`components.yieldLoss.categories.${opt.key}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('components.yieldLoss.detailProduct')}</label>
              <select
                value={internalProductType}
                onChange={(e) => setInternalProductType(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                {PRODUCT_TYPE_KEYS[internalCategory].map(opt => (
                  <option key={opt.value} value={opt.value}>{t(`components.yieldLoss.products.${opt.key}`)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 공정 선택 */}
        <div>
          <button
            onClick={() => setShowStageSelection(!showStageSelection)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 mb-2"
          >
            {showStageSelection ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span className="font-medium">{t('components.yieldLoss.processSelection')}</span>
            <span className="text-gray-400">({selectedCount}/6 {t('components.yieldLoss.selectedProcesses')})</span>
          </button>

          {showStageSelection && (
            <div className="p-2 bg-gray-50 rounded space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{t('components.yieldLoss.selectProcessesForCalc')}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    {t('components.yieldLoss.selectAll')}
                  </button>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    {t('components.yieldLoss.deselectAll')}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {STAGE_KEYS.map(stage => (
                  <button
                    key={stage.key}
                    onClick={() => handleStageToggle(stage.key)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
                      stageSelection[stage.key]
                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                        : 'bg-white text-gray-400 border border-gray-200 line-through'
                    }`}
                  >
                    <span>{stage.icon}</span>
                    <span>{t(`components.yieldLoss.stages.${stage.translationKey}`)}</span>
                    {stageSelection[stage.key] && (
                      <Check className="w-3 h-3 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              {selectedCount < 6 && (
                <div className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {t('components.yieldLoss.processesExcluded', { count: 6 - selectedCount })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 중량 입력 */}
        <div className="flex items-center gap-3">
          {mode === 'forward' ? (
            <>
              {/* 투입→산출 모드 */}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('components.yieldLoss.inputWeight')} (g)</label>
                <input
                  type="number"
                  value={externalInputWeight ?? internalInputWeight}
                  onChange={(e) => !externalInputWeight && setInternalInputWeight(parseInt(e.target.value) || 0)}
                  disabled={!!externalInputWeight}
                  className="w-full px-2 py-1.5 text-sm border rounded text-right font-mono"
                />
              </div>
              <div className="flex items-center pt-5">
                <span className="text-gray-400">→</span>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  {t('components.yieldLoss.expectedOutput')} (g)
                  {selectedCount < 6 && <span className="text-orange-500 ml-1">*{selectedCount}{t('components.yieldLoss.processes')}</span>}
                </label>
                <div className="px-2 py-1.5 text-sm bg-blue-50 border border-blue-200 rounded text-right font-mono font-semibold text-blue-700">
                  {result?.outputWeight.toLocaleString() ?? '-'}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 산출→투입 모드 (역산) */}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('components.yieldLoss.targetOutput')} (g)</label>
                <input
                  type="number"
                  value={targetOutput}
                  onChange={(e) => setTargetOutput(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-sm border rounded text-right font-mono"
                />
              </div>
              <div className="flex items-center pt-5">
                <span className="text-gray-400">←</span>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('components.yieldLoss.requiredInput')} (g)</label>
                <div className="px-2 py-1.5 text-sm bg-green-50 border border-green-200 rounded text-right font-mono font-semibold text-green-700">
                  {requiredInput.toLocaleString()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 수율 요약 */}
        {mode === 'forward' && result && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{t('components.yieldLoss.yield')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-blue-600">{result.yieldPercent}%</span>
              <span className={`text-sm ${getLossColor(result.totalLossPercent)}`}>
                ({t('components.yieldLoss.loss')} {result.totalLossPercent}% / {result.totalLossWeight.toLocaleString()}g)
              </span>
            </div>
          </div>
        )}

        {/* 환경 설정 토글 */}
        {!externalEnvironment && (
          <button
            onClick={() => setShowEnvironment(!showEnvironment)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            {showEnvironment ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {t('components.yieldLoss.envSettings')}
          </button>
        )}

        {/* 환경 설정 */}
        {showEnvironment && !externalEnvironment && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('components.yieldLoss.humidity')} (%)</label>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(parseInt(e.target.value) || 60)}
                min={20}
                max={90}
                className="w-full px-2 py-1 text-sm border rounded text-right"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('components.yieldLoss.roomTemp')} (°C)</label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value) || 25)}
                min={15}
                max={40}
                className="w-full px-2 py-1 text-sm border rounded text-right"
              />
            </div>
            {(humidity !== 60 || temperature !== 25) && (
              <div className="col-span-2 flex items-start gap-1 text-xs text-orange-600">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{t('components.yieldLoss.envNote')}</span>
              </div>
            )}
          </div>
        )}

        {/* 상세 토글 */}
        {mode === 'forward' && result && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {t('components.yieldLoss.processDetails')}
          </button>
        )}

        {/* 공정별 손실 상세 */}
        {showDetails && mode === 'forward' && result && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-2">{t('components.yieldLoss.processDetailsDesc')}</div>
            {result.processLosses.map((loss, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-12 text-gray-600">{loss.stage}</div>
                <div className="flex-1 mx-2">
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className={`h-full ${loss.lossPercent >= 10 ? 'bg-red-400' : loss.lossPercent >= 5 ? 'bg-orange-400' : 'bg-yellow-400'}`}
                      style={{ width: `${Math.min(loss.lossPercent * 5, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-gray-500">-{loss.lossPercent}%</div>
                <div className="w-20 text-right font-mono text-gray-600">-{loss.lossWeight}g</div>
                <div className="w-24 text-right font-mono text-gray-400">→ {loss.remainingWeight.toLocaleString()}g</div>
              </div>
            ))}
          </div>
        )}

        {/* 팁 */}
        {result && result.tips.length > 0 && (
          <div className="p-2 bg-blue-50 rounded text-xs">
            <div className="flex items-center gap-1 text-blue-700 font-medium mb-1">
              <Info className="w-3 h-3" />
              {t('components.yieldLoss.minimizeLossTips')}
            </div>
            <ul className="list-disc list-inside text-blue-600 space-y-0.5">
              {result.tips.slice(0, 3).map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
