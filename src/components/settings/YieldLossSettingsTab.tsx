/**
 * 수율 손실률 설정 탭
 * 카테고리별, 제품별 손실률 커스터마이징
 *
 * 적용: --persona-backend (수율 계산) + --persona-frontend (UI)
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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

// 공정 정보 (아이콘과 키만 저장, 이름은 번역 사용)
const PROCESS_STAGES: { key: keyof ProcessLossRates; icon: string }[] = [
  { key: 'mixing', icon: '🥣' },
  { key: 'fermentation', icon: '🍞' },
  { key: 'dividing', icon: '✂️' },
  { key: 'shaping', icon: '👐' },
  { key: 'baking', icon: '🔥' },
  { key: 'cooling', icon: '❄️' }
]

// 카테고리 정보 (키와 색상만 저장, 이름은 번역 사용)
const CATEGORIES = [
  { key: 'bread', color: 'bg-amber-100 border-amber-300' },
  { key: 'cake', color: 'bg-pink-100 border-pink-300' },
  { key: 'pastry', color: 'bg-blue-100 border-blue-300' },
  { key: 'cookie', color: 'bg-green-100 border-green-300' }
]

// 제품 목록 (손실률 오버라이드 가능) - 이름은 키로 저장
const PRODUCTS: Record<string, string[]> = {
  bread: ['pullman', 'mountain', 'brioche', 'baguette', 'ciabatta', 'sourdough'],
  cake: ['genoise', 'chiffon', 'pound', 'brownie', 'cheesecake'],
  pastry: ['croissant', 'danish', 'puff_pastry'],
  cookie: ['cookie', 'scone']
}

interface YieldLossSettingsTabProps {
  className?: string
}

export default function YieldLossSettingsTab({ className = '' }: YieldLossSettingsTabProps) {
  const { t } = useTranslation()
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
              {t(`settings.yieldLoss.stages.${stage.key}.name`)}
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
                {t('settings.yieldLoss.base')} {baseValue}%
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
            {t('settings.yieldLoss.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('settings.yieldLoss.titleDesc')}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm(t('settings.yieldLoss.resetConfirm'))) {
              resetToDefaults('yieldLoss')
            }
          }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          {t('settings.yieldLoss.resetToDefault')}
        </button>
      </div>

      {/* 환경 조정 토글 */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-800">{t('settings.yieldLoss.envAdjustment')}</div>
              <div className="text-xs text-gray-500">
                {t('settings.yieldLoss.envAdjustmentDesc')}
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
            {t('settings.yieldLoss.envAdjustmentNote')}
          </div>
        )}
      </div>

      {/* 카테고리별 설정 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">{t('settings.yieldLoss.categorySettings')}</h4>

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
                  <span className="font-medium text-gray-800">{t(`settings.yieldLoss.categories.${cat.key}`)}</span>
                  {hasOverrides && (
                    <span className="px-1.5 py-0.5 text-xs bg-orange-200 text-orange-700 rounded">
                      {t('settings.yieldLoss.custom')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono">
                    {t('settings.yieldLoss.totalLoss')}: <span className="font-bold">{totalLoss.toFixed(1)}%</span>
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
                          {t('common.save')}
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null)
                            setCategoryEditForm({})
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                        >
                          {t('common.cancel')}
                        </button>
                        {hasOverrides && (
                          <button
                            onClick={() => {
                              setCategoryLossOverride(cat.key, {})
                              setEditingCategory(null)
                            }}
                            className="px-3 py-1.5 text-red-600 text-sm hover:bg-red-50 rounded"
                          >
                            {t('settings.yieldLoss.resetToDefault')}
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
                            <div className="text-xs text-gray-500">{t(`settings.yieldLoss.stages.${stage.key}.name`)}</div>
                            <div className="font-mono font-medium">{rates[stage.key]}%</div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => startEditingCategory(cat.key)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {t('settings.yieldLoss.editLoss')}
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
          <h4 className="font-medium text-gray-700">{t('settings.yieldLoss.productOverride')}</h4>
          <select
            value={selectedProductCategory}
            onChange={(e) => setSelectedProductCategory(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.key} value={cat.key}>{t(`settings.yieldLoss.categories.${cat.key}`)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {PRODUCTS[selectedProductCategory]?.map(productKey => {
            const hasOverride = Boolean(yieldLoss.productOverrides[productKey])
            const isEditing = editingProduct === productKey
            const rates = getProductRates(productKey, selectedProductCategory)
            const totalLoss = calculateTotalLoss(rates)

            return (
              <div
                key={productKey}
                className={`border rounded-lg p-3 ${
                  hasOverride ? 'bg-orange-50 border-orange-200' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{t(`settings.yieldLoss.products.${productKey}`)}</span>
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
                          {t('common.save')}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(null)
                            setProductEditForm({})
                          }}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditingProduct(productKey)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {t('settings.yieldLoss.edit')}
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
                          setProductLossOverride(productKey, {})
                          setEditingProduct(null)
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700"
                      >
                        {t('settings.yieldLoss.removeOverride')}
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
          {t('settings.yieldLoss.guide')}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {PROCESS_STAGES.map(stage => (
            <div key={stage.key}>
              <div className="font-medium text-gray-600 mb-1">{stage.icon} {t(`settings.yieldLoss.stages.${stage.key}.name`)}</div>
              <div className="text-xs text-gray-500">{t(`settings.yieldLoss.stages.${stage.key}.range`)}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            {t('settings.yieldLoss.guideNote')}
          </span>
        </div>
      </div>
    </div>
  )
}
