/**
 * 수율 손실률 설정 탭
 * 카테고리별, 제품별 손실률 커스터마이징
 *
 * 적용: --persona-backend (수율 계산) + --persona-frontend (UI)
 */

import { useState, useCallback } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { ProcessLossRates } from '@/types/settings.types'
import {
  TrendingDown,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  AlertTriangle,
  Info,
  Settings2,
  Check
} from 'lucide-react'

// 기본 손실률 데이터
const DEFAULT_LOSS_RATES: Record<string, ProcessLossRates> = {
  bread: {
    mixing: 1.0,
    fermentation: 1.5,
    dividing: 2.0,
    shaping: 1.0,
    baking: 12.0,
    cooling: 2.0
  },
  cake: {
    mixing: 0.5,
    fermentation: 0,
    dividing: 0.5,
    shaping: 0.5,
    baking: 8.0,
    cooling: 1.0
  },
  pastry: {
    mixing: 1.0,
    fermentation: 1.0,
    dividing: 2.5,
    shaping: 1.5,
    baking: 10.0,
    cooling: 1.5
  },
  cookie: {
    mixing: 0.5,
    fermentation: 0,
    dividing: 1.0,
    shaping: 0.5,
    baking: 6.0,
    cooling: 0.5
  }
}

// 공정 정보
const PROCESS_STAGES: { key: keyof ProcessLossRates; name: string; icon: string; description: string }[] = [
  { key: 'mixing', name: '믹싱', icon: '🥣', description: '재료 혼합 시 용기/도구 부착' },
  { key: 'fermentation', name: '발효', icon: '🍞', description: '발효 중 수분 증발' },
  { key: 'dividing', name: '분할', icon: '✂️', description: '분할 시 손실 및 밀가루 사용' },
  { key: 'shaping', name: '성형', icon: '👐', description: '성형 시 손실 및 밀가루 사용' },
  { key: 'baking', name: '굽기', icon: '🔥', description: '굽기 중 수분 증발' },
  { key: 'cooling', name: '냉각', icon: '❄️', description: '냉각 중 수분 증발 및 손실' }
]

// 카테고리 정보
const CATEGORIES = [
  { key: 'bread', name: '빵류', color: 'bg-amber-100 border-amber-300' },
  { key: 'cake', name: '케이크', color: 'bg-pink-100 border-pink-300' },
  { key: 'pastry', name: '페이스트리', color: 'bg-blue-100 border-blue-300' },
  { key: 'cookie', name: '쿠키', color: 'bg-green-100 border-green-300' }
]

// 제품 목록 (손실률 오버라이드 가능)
const PRODUCTS: Record<string, { name: string; category: string }[]> = {
  bread: [
    { name: 'pullman', category: '풀먼식빵' },
    { name: 'mountain', category: '산형식빵' },
    { name: 'brioche', category: '브리오슈' },
    { name: 'baguette', category: '바게트' },
    { name: 'ciabatta', category: '치아바타' },
    { name: 'sourdough', category: '사워도우' }
  ],
  cake: [
    { name: 'genoise', category: '제누와즈' },
    { name: 'chiffon', category: '쉬폰' },
    { name: 'pound', category: '파운드' },
    { name: 'brownie', category: '브라우니' },
    { name: 'cheesecake', category: '치즈케이크' }
  ],
  pastry: [
    { name: 'croissant', category: '크루아상' },
    { name: 'danish', category: '데니쉬' },
    { name: 'puff_pastry', category: '퍼프페이스트리' }
  ],
  cookie: [
    { name: 'cookie', category: '쿠키' },
    { name: 'scone', category: '스콘' }
  ]
}

interface YieldLossSettingsTabProps {
  className?: string
}

export default function YieldLossSettingsTab({ className = '' }: YieldLossSettingsTabProps) {
  const {
    yieldLoss,
    setCategoryLossOverride,
    setProductLossOverride,
    setEnvironmentAdjustment,
    resetToDefaults
  } = useSettingsStore()

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [categoryEditForm, setCategoryEditForm] = useState<Partial<ProcessLossRates>>({})
  const [productEditForm, setProductEditForm] = useState<Partial<ProcessLossRates>>({})
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('bread')

  // 카테고리별 현재 적용되는 손실률
  const getCategoryRates = useCallback((cat: string): ProcessLossRates => {
    const baseRates = DEFAULT_LOSS_RATES[cat] || DEFAULT_LOSS_RATES.bread
    const overrides = yieldLoss.categoryOverrides[cat as keyof typeof yieldLoss.categoryOverrides] || {}
    return { ...baseRates, ...overrides }
  }, [yieldLoss.categoryOverrides])

  // 제품별 현재 적용되는 손실률
  const getProductRates = useCallback((product: string, cat: string): ProcessLossRates => {
    const categoryRates = getCategoryRates(cat)
    const overrides = yieldLoss.productOverrides[product] || {}
    return { ...categoryRates, ...overrides }
  }, [getCategoryRates, yieldLoss.productOverrides])

  // 총 손실률 계산
  const calculateTotalLoss = useCallback((rates: ProcessLossRates): number => {
    return Object.values(rates).reduce((sum, val) => sum + val, 0)
  }, [])

  // 카테고리 편집 시작
  const startEditingCategory = useCallback((cat: string) => {
    setCategoryEditForm(yieldLoss.categoryOverrides[cat as keyof typeof yieldLoss.categoryOverrides] || {})
    setEditingCategory(cat)
    setExpandedCategory(cat)
  }, [yieldLoss.categoryOverrides])

  // 카테고리 저장
  const handleSaveCategory = useCallback(() => {
    if (!editingCategory) return
    setCategoryLossOverride(editingCategory, categoryEditForm)
    setEditingCategory(null)
    setCategoryEditForm({})
  }, [editingCategory, categoryEditForm, setCategoryLossOverride])

  // 제품 편집 시작
  const startEditingProduct = useCallback((product: string) => {
    setProductEditForm(yieldLoss.productOverrides[product] || {})
    setEditingProduct(product)
  }, [yieldLoss.productOverrides])

  // 제품 저장
  const handleSaveProduct = useCallback(() => {
    if (!editingProduct) return
    setProductLossOverride(editingProduct, productEditForm)
    setEditingProduct(null)
    setProductEditForm({})
  }, [editingProduct, productEditForm, setProductLossOverride])

  // 손실률 입력 렌더링
  const renderRateInputs = (
    rates: Partial<ProcessLossRates>,
    baseRates: ProcessLossRates,
    onChange: (key: keyof ProcessLossRates, value: number | undefined) => void,
    showDiff: boolean = false
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {PROCESS_STAGES.map(stage => {
        const currentValue = rates[stage.key]
        const baseValue = baseRates[stage.key]
        const displayValue = currentValue !== undefined ? currentValue : baseValue
        const isOverridden = currentValue !== undefined

        return (
          <div key={stage.key} className="relative">
            <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span>{stage.icon}</span>
              {stage.name}
              {isOverridden && (
                <span className="text-orange-500">*</span>
              )}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={displayValue}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  onChange(stage.key, isNaN(val) ? undefined : val)
                }}
                className={`w-full px-2 py-1.5 text-sm border rounded text-right font-mono ${
                  isOverridden ? 'bg-orange-50 border-orange-200' : 'bg-white'
                }`}
                min="0"
                max="30"
                step="0.5"
              />
              <span className="text-xs text-gray-400">%</span>
            </div>
            {showDiff && isOverridden && (
              <div className={`text-xs mt-0.5 ${
                currentValue! > baseValue ? 'text-red-500' : 'text-green-500'
              }`}>
                기본 {baseValue}%
                {currentValue! > baseValue ? ' ↑' : ' ↓'}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            수율 손실률 설정
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            공정별 손실률을 카테고리 또는 제품별로 커스터마이징합니다.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('모든 손실률 설정을 기본값으로 초기화하시겠습니까?')) {
              resetToDefaults('yieldLoss')
            }
          }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          기본값으로
        </button>
      </div>

      {/* 환경 조정 토글 */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-800">환경 조정 활성화</div>
              <div className="text-xs text-gray-500">
                온도/습도에 따라 굽기 손실률을 자동 조정합니다
              </div>
            </div>
          </div>
          <div
            className={`w-12 h-6 rounded-full transition-colors ${
              yieldLoss.enableEnvironmentAdjustment ? 'bg-blue-500' : 'bg-gray-300'
            } relative cursor-pointer`}
            onClick={() => setEnvironmentAdjustment(!yieldLoss.enableEnvironmentAdjustment)}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                yieldLoss.enableEnvironmentAdjustment ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </div>
        </label>
        {yieldLoss.enableEnvironmentAdjustment && (
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
            <Info className="w-3 h-3" />
            습도 60% / 온도 25°C 기준, 차이에 따라 ±0~3% 조정
          </div>
        )}
      </div>

      {/* 카테고리별 설정 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">카테고리별 기본 손실률</h4>

        {CATEGORIES.map(cat => {
          const isExpanded = expandedCategory === cat.key
          const isEditing = editingCategory === cat.key
          const rates = getCategoryRates(cat.key)
          const totalLoss = calculateTotalLoss(rates)
          const hasOverrides = Object.keys(yieldLoss.categoryOverrides[cat.key as keyof typeof yieldLoss.categoryOverrides] || {}).length > 0

          return (
            <div key={cat.key} className={`border rounded-lg overflow-hidden ${cat.color}`}>
              {/* 카테고리 헤더 */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  {hasOverrides && (
                    <span className="px-1.5 py-0.5 text-xs bg-orange-200 text-orange-700 rounded">
                      커스텀
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono">
                    총 손실률: <span className="font-bold">{totalLoss.toFixed(1)}%</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* 카테고리 상세 */}
              {isExpanded && (
                <div className="p-4 bg-white border-t space-y-4">
                  {isEditing ? (
                    // 편집 모드
                    <>
                      {renderRateInputs(
                        categoryEditForm,
                        DEFAULT_LOSS_RATES[cat.key],
                        (key, value) => setCategoryEditForm(prev => ({ ...prev, [key]: value })),
                        true
                      )}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveCategory}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          <Save className="w-4 h-4" />
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null)
                            setCategoryEditForm({})
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                        >
                          취소
                        </button>
                        {hasOverrides && (
                          <button
                            onClick={() => {
                              setCategoryLossOverride(cat.key, {})
                              setEditingCategory(null)
                            }}
                            className="px-3 py-1.5 text-red-600 text-sm hover:bg-red-50 rounded"
                          >
                            기본값으로
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    // 보기 모드
                    <>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                        {PROCESS_STAGES.map(stage => (
                          <div key={stage.key} className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-lg">{stage.icon}</div>
                            <div className="text-xs text-gray-500">{stage.name}</div>
                            <div className="font-mono font-medium">{rates[stage.key]}%</div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => startEditingCategory(cat.key)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        손실률 수정 →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 제품별 오버라이드 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">제품별 손실률 오버라이드</h4>
          <select
            value={selectedProductCategory}
            onChange={(e) => setSelectedProductCategory(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {PRODUCTS[selectedProductCategory]?.map(product => {
            const hasOverride = Boolean(yieldLoss.productOverrides[product.name])
            const isEditing = editingProduct === product.name
            const rates = getProductRates(product.name, selectedProductCategory)
            const totalLoss = calculateTotalLoss(rates)

            return (
              <div
                key={product.name}
                className={`border rounded-lg p-3 ${
                  hasOverride ? 'bg-orange-50 border-orange-200' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{product.category}</span>
                    {hasOverride && (
                      <Check className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-600">
                      {totalLoss.toFixed(1)}%
                    </span>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveProduct}
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(null)
                            setProductEditForm({})
                          }}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditingProduct(product.name)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        수정
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3 pt-3 border-t">
                    {renderRateInputs(
                      productEditForm,
                      getCategoryRates(selectedProductCategory),
                      (key, value) => setProductEditForm(prev => ({ ...prev, [key]: value })),
                      true
                    )}
                    {hasOverride && (
                      <button
                        onClick={() => {
                          setProductLossOverride(product.name, {})
                          setEditingProduct(null)
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700"
                      >
                        오버라이드 제거
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 손실률 가이드 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          손실률 참고 가이드
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-600 mb-1">🥣 믹싱</div>
            <div className="text-xs text-gray-500">0.5~2% (도구 부착량)</div>
          </div>
          <div>
            <div className="font-medium text-gray-600 mb-1">🍞 발효</div>
            <div className="text-xs text-gray-500">0~2% (수분 증발)</div>
          </div>
          <div>
            <div className="font-medium text-gray-600 mb-1">✂️ 분할</div>
            <div className="text-xs text-gray-500">1~3% (덧밀가루 + 손실)</div>
          </div>
          <div>
            <div className="font-medium text-gray-600 mb-1">👐 성형</div>
            <div className="text-xs text-gray-500">0.5~2% (덧밀가루)</div>
          </div>
          <div>
            <div className="font-medium text-gray-600 mb-1">🔥 굽기</div>
            <div className="text-xs text-gray-500">6~15% (수분 증발)</div>
          </div>
          <div>
            <div className="font-medium text-gray-600 mb-1">❄️ 냉각</div>
            <div className="text-xs text-gray-500">0.5~2% (추가 증발)</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            손실률은 작업 환경, 숙련도, 재료 상태에 따라 달라질 수 있습니다.
            실제 경험을 바탕으로 조정하세요.
          </span>
        </div>
      </div>
    </div>
  )
}
