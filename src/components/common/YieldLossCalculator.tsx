/**
 * 수율 손실 예측 컴포넌트
 * 투입 중량에서 예상 산출량을 계산하고 공정별 손실을 시각화
 * 공정별 선택 기능 지원
 */

import React, { useState, useMemo, useCallback } from 'react'
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

// 제품 카테고리 옵션
const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'bread', label: '빵류' },
  { value: 'cake', label: '케이크' },
  { value: 'pastry', label: '페이스트리' },
  { value: 'cookie', label: '쿠키' },
  { value: 'other', label: '기타' }
]

// 세부 제품 타입 옵션
const PRODUCT_TYPE_OPTIONS: Record<ProductCategory, { value: string; label: string }[]> = {
  bread: [
    { value: '', label: '일반 빵' },
    { value: 'pullman', label: '풀먼식빵' },
    { value: 'mountain', label: '산형식빵' },
    { value: 'brioche', label: '브리오슈' },
    { value: 'baguette', label: '바게트' },
    { value: 'ciabatta', label: '치아바타' },
    { value: 'sourdough', label: '사워도우' }
  ],
  cake: [
    { value: '', label: '일반 케이크' },
    { value: 'genoise', label: '제누와즈' },
    { value: 'chiffon', label: '쉬폰' },
    { value: 'pound', label: '파운드' },
    { value: 'brownie', label: '브라우니' },
    { value: 'cheesecake', label: '치즈케이크' }
  ],
  pastry: [
    { value: '', label: '일반 페이스트리' },
    { value: 'croissant', label: '크루아상' },
    { value: 'danish', label: '데니쉬' },
    { value: 'puff_pastry', label: '퍼프페이스트리' }
  ],
  cookie: [
    { value: '', label: '일반 쿠키' },
    { value: 'cookie', label: '쿠키' },
    { value: 'scone', label: '스콘' }
  ],
  other: [
    { value: '', label: '기타' },
    { value: 'tart', label: '타르트' }
  ]
}

// 공정 정보
const STAGE_INFO: { key: keyof ProcessStageSelection; name: string; icon: string }[] = [
  { key: 'mixing', name: '믹싱', icon: '🥣' },
  { key: 'fermentation', name: '발효', icon: '🍞' },
  { key: 'dividing', name: '분할', icon: '✂️' },
  { key: 'shaping', name: '성형', icon: '👐' },
  { key: 'baking', name: '굽기', icon: '🔥' },
  { key: 'cooling', name: '냉각', icon: '❄️' }
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
          예상 산출: <b className="text-blue-600">{result.outputWeight.toLocaleString()}g</b>
          <span className={`ml-1 ${getLossColor(result.totalLossPercent)}`}>
            (-{result.totalLossPercent}%)
          </span>
          {selectedCount < 6 && (
            <span className="ml-1 text-gray-400 text-xs">({selectedCount}개 공정)</span>
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
          <h3 className="font-semibold text-gray-800">수율 손실 예측</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('forward')}
            className={`px-2 py-1 text-xs rounded ${mode === 'forward' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            투입→산출
          </button>
          <button
            onClick={() => setMode('reverse')}
            className={`px-2 py-1 text-xs rounded ${mode === 'reverse' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            산출→투입
          </button>
        </div>
      </div>

      {/* 입력 섹션 */}
      <div className="p-3 space-y-3">
        {/* 제품 선택 (외부 prop이 없을 때만 표시) */}
        {!externalCategory && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">제품 종류</label>
              <select
                value={internalCategory}
                onChange={(e) => {
                  setInternalCategory(e.target.value as ProductCategory)
                  setInternalProductType('')
                }}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">세부 제품</label>
              <select
                value={internalProductType}
                onChange={(e) => setInternalProductType(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded"
              >
                {PRODUCT_TYPE_OPTIONS[internalCategory].map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
            <span className="font-medium">공정 선택</span>
            <span className="text-gray-400">({selectedCount}/6개 선택)</span>
          </button>

          {showStageSelection && (
            <div className="p-2 bg-gray-50 rounded space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">계산에 포함할 공정을 선택하세요</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    전체선택
                  </button>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    전체해제
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {STAGE_INFO.map(stage => (
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
                    <span>{stage.name}</span>
                    {stageSelection[stage.key] && (
                      <Check className="w-3 h-3 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              {selectedCount < 6 && (
                <div className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {6 - selectedCount}개 공정이 제외됨 - 해당 단계까지의 중량이 표시됩니다
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
                <label className="block text-xs text-gray-500 mb-1">투입 중량 (g)</label>
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
                  예상 산출 (g)
                  {selectedCount < 6 && <span className="text-orange-500 ml-1">*{selectedCount}개 공정</span>}
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
                <label className="block text-xs text-gray-500 mb-1">목표 산출 (g)</label>
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
                <label className="block text-xs text-gray-500 mb-1">필요 투입 (g)</label>
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
              <span className="text-sm text-gray-600">수율</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-blue-600">{result.yieldPercent}%</span>
              <span className={`text-sm ${getLossColor(result.totalLossPercent)}`}>
                (손실 {result.totalLossPercent}% / {result.totalLossWeight.toLocaleString()}g)
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
            환경 설정 (습도/온도)
          </button>
        )}

        {/* 환경 설정 */}
        {showEnvironment && !externalEnvironment && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded">
            <div>
              <label className="block text-xs text-gray-500 mb-1">습도 (%)</label>
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
              <label className="block text-xs text-gray-500 mb-1">실온 (°C)</label>
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
                <span>환경 조건이 기준(습도60%, 온도25°C)과 다르면 굽기 손실이 조정됩니다.</span>
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
            공정별 손실 상세
          </button>
        )}

        {/* 공정별 손실 상세 */}
        {showDetails && mode === 'forward' && result && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-2">공정별 손실 내역 (선택된 공정만)</div>
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
              손실 최소화 팁
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
