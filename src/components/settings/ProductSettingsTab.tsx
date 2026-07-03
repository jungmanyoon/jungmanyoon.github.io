/**
 * 제품 비용적 설정 탭
 * 빵/케이크의 비용적(Specific Volume)을 관리하고 커스텀 제품 추가
 *
 * 적용: --persona-frontend (UI) + --persona-backend (계산)
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { ProductVolumeSettings } from '@/types/settings.types'
import {
  Cake,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  Info,
  RefreshCw,
  Wheat,
  Scale
} from 'lucide-react'

// 기본 빵 비용적 (틀을 사용하는 제품만 - cm³/g)
// 비용적 = 틀 부피 ÷ 반죽 무게, 틀 없이 굽는 빵(바게트, 치아바타 등)은 해당 없음
const DEFAULT_BREAD_VOLUMES: Record<string, number> = {
  // 식빵류 (식빵틀/풀먼틀)
  '풀먼식빵': 3.4,
  '산형식빵': 4.2,
  '우유식빵': 4.0,
  '버터식빵': 3.8,
  '호밀식빵': 3.2,
  '통밀식빵': 3.0,
  '데니쉬식빵': 4.5,
  '브리오슈식빵': 3.8,
  // 브리오슈류 (브리오슈틀)
  '브리오슈': 3.5,
  '브리오슈아테트': 3.6,
  // 파운드형 빵 (파운드틀)
  '파운드빵': 3.2
}

// 기본 케이크 비용적 (틀을 사용하는 제품 - cm³/g)
const DEFAULT_CAKE_VOLUMES: Record<string, number> = {
  // 버터케이크류 (원형팬/파운드틀)
  '파운드케이크': 1.8,
  '버터케이크': 2.0,
  '마블케이크': 1.9,
  // 스펀지류 (원형팬)
  '레이어케이크': 2.8,
  '스펀지케이크': 3.5,
  '제누와즈': 3.2,
  // 폼케이크류 (쉬폰틀/원형팬)
  '쉬폰케이크': 4.5,
  '엔젤푸드케이크': 4.2,
  // 무스/치즈류 (무스링/원형팬)
  '무스케이크': 2.0,
  '치즈케이크': 1.5,
  '바스크치즈케이크': 1.3,
  '수플레치즈케이크': 2.5,
  // 롤케이크 (롤케이크팬)
  '롤케이크': 3.0,
  // 구움과자류 (전용틀)
  '브라우니': 1.2,
  '마들렌': 2.2,
  '피낭시에': 1.8,
  '카스테라': 2.8
}

// 제품 카테고리
const PRODUCT_CATEGORIES: { value: ProductVolumeSettings['customProducts'][0]['category']; icon: string }[] = [
  { value: 'bread', icon: '🍞' },
  { value: 'cake', icon: '🎂' },
  { value: 'pastry', icon: '🥐' },
  { value: 'other', icon: '🧁' }
]

interface ProductSettingsTabProps {
  className?: string
}

// 모든 기본 제품 이름 목록 (번역 키로 사용)
const ALL_DEFAULT_PRODUCTS = [
  ...Object.keys(DEFAULT_BREAD_VOLUMES),
  ...Object.keys(DEFAULT_CAKE_VOLUMES)
]

export default function ProductSettingsTab({ className = '' }: ProductSettingsTabProps) {
  const { t } = useTranslation()

  // 제품 표시 이름 가져오기 (기본 제품은 번역, 사용자 제품은 그대로)
  const getProductDisplayName = useCallback((name: string) => {
    if (ALL_DEFAULT_PRODUCTS.includes(name)) {
      const translated = t(`settings.product.productNames.${name}`, { defaultValue: '' })
      return translated || name
    }
    return name
  }, [t])
  const {
    product,
    setVolumeOverride,
    deleteVolumeOverride,
    addCustomProduct,
    deleteCustomProduct
  } = useSettingsStore()

  const [activeSection, setActiveSection] = useState<'bread' | 'cake' | 'custom'>('bread')
  const [searchTerm, setSearchTerm] = useState('')

  // 커스텀 제품 폼
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm] = useState<{
    name: string
    specificVolume: number
    category: ProductVolumeSettings['customProducts'][0]['category']
  }>({
    name: '',
    specificVolume: 3.5,
    category: 'bread'
  })

  // 필터링된 제품 목록
  const filteredBreadProducts = useMemo(() => {
    const products = Object.entries(DEFAULT_BREAD_VOLUMES)
    if (!searchTerm) return products
    return products.filter(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const filteredCakeProducts = useMemo(() => {
    const products = Object.entries(DEFAULT_CAKE_VOLUMES)
    if (!searchTerm) return products
    return products.filter(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  // 입력 중 로컬 상태 (빈칸/0 입력 시 즉시 기본값으로 덮어쓰지 않도록 자유 입력 허용)
  const [editingVolumes, setEditingVolumes] = useState<Record<string, string>>({})

  // 비용적 입력 변경: 유효한 양수일 때만 오버라이드 반영, 그 외에는 로컬 문자열 상태만 유지
  const handleVolumeInputChange = useCallback((category: 'bread' | 'cake', productName: string, raw: string) => {
    const key = `${category}:${productName}`
    setEditingVolumes(prev => ({ ...prev, [key]: raw }))
    const parsed = parseFloat(raw)
    if (raw.trim() !== '' && !isNaN(parsed) && parsed > 0) {
      setVolumeOverride(category, productName, parsed)
    }
  }, [setVolumeOverride])

  // 편집 종료: 빈칸/무효/0 이하로 끝냈으면 오버라이드 제거해 기본값 복원
  const handleVolumeBlur = useCallback((category: 'bread' | 'cake', productName: string) => {
    const key = `${category}:${productName}`
    setEditingVolumes(prev => {
      if (!(key in prev)) return prev
      const raw = prev[key]
      const parsed = parseFloat(raw)
      if (raw.trim() === '' || isNaN(parsed) || parsed <= 0) {
        deleteVolumeOverride(category, productName)
      }
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [deleteVolumeOverride])

  // 커스텀 제품 저장
  const handleSaveCustom = useCallback(() => {
    if (!customForm.name.trim()) {
      alert(t('settings.product.alerts.nameRequired'))
      return
    }
    if (customForm.specificVolume <= 0) {
      alert(t('settings.product.alerts.volumeRequired'))
      return
    }

    addCustomProduct({
      id: '',  // Store에서 자동 생성
      name: customForm.name,
      specificVolume: customForm.specificVolume,
      category: customForm.category
    })

    setCustomForm({
      name: '',
      specificVolume: 3.5,
      category: 'bread'
    })
    setShowCustomForm(false)
  }, [customForm, addCustomProduct, t])

  // 현재 값 가져오기 (오버라이드 또는 기본값)
  const getBreadVolume = useCallback((name: string): number => {
    return product.breadVolumes[name] ?? DEFAULT_BREAD_VOLUMES[name] ?? 3.5
  }, [product.breadVolumes])

  const getCakeVolume = useCallback((name: string): number => {
    return product.cakeVolumes[name] ?? DEFAULT_CAKE_VOLUMES[name] ?? 2.5
  }, [product.cakeVolumes])

  const isOverridden = useCallback((category: 'bread' | 'cake', name: string): boolean => {
    if (category === 'bread') {
      return product.breadVolumes[name] !== undefined
    }
    return product.cakeVolumes[name] !== undefined
  }, [product.breadVolumes, product.cakeVolumes])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-500" />
            {t('settings.product.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('settings.product.titleDesc')}
          </p>
        </div>
      </div>

      {/* 비용적 설명 */}
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <div className="flex items-start gap-2 text-sm text-amber-700">
          <Info className="w-4 h-4 mt-0.5" />
          <div>
            <p className="font-medium">{t('settings.product.info.title')}</p>
            <p className="text-xs mt-1">
              {t('settings.product.info.desc')}
            </p>
            <p className="text-xs mt-1 text-amber-600">
              <strong>⚠️ {t('settings.product.info.warning')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveSection('bread')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'bread'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1">
            <Wheat className="w-4 h-4" />
            {t('settings.product.tabs.bread')} ({Object.keys(DEFAULT_BREAD_VOLUMES).length})
          </span>
        </button>
        <button
          onClick={() => setActiveSection('cake')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'cake'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1">
            <Cake className="w-4 h-4" />
            {t('settings.product.tabs.cake')} ({Object.keys(DEFAULT_CAKE_VOLUMES).length})
          </span>
        </button>
        <button
          onClick={() => setActiveSection('custom')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'custom'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('settings.product.tabs.custom')} ({product.customProducts.length})
        </button>
      </div>

      {/* 빵류 섹션 */}
      {activeSection === 'bread' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('settings.product.search.bread')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* 수정된 항목 표시 */}
          {Object.keys(product.breadVolumes).length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800">
                  {t('settings.product.modifiedCount', { count: Object.keys(product.breadVolumes).length })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(product.breadVolumes).map(([name, volume]) => {
                  const original = DEFAULT_BREAD_VOLUMES[name]
                  return (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs"
                    >
                      {getProductDisplayName(name)}: {volume} cm³/g
                      {original !== undefined && (
                        <span className="text-gray-400">({t('settings.product.default')} {original})</span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 빵 목록 */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredBreadProducts.map(([name]) => {
              const currentVolume = getBreadVolume(name)
              const modified = isOverridden('bread', name)

              return (
                <div
                  key={name}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    modified ? 'bg-amber-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🍞</span>
                    <span className="text-sm font-medium text-gray-800">{getProductDisplayName(name)}</span>
                    {modified && (
                      <span className="px-1.5 py-0.5 bg-amber-200 text-amber-700 text-xs rounded">{t('settings.product.modified')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editingVolumes[`bread:${name}`] ?? currentVolume}
                      onChange={(e) => handleVolumeInputChange('bread', name, e.target.value)}
                      onBlur={() => handleVolumeBlur('bread', name)}
                      className={`w-20 px-2 py-1 text-sm border rounded text-center font-mono ${
                        modified ? 'border-amber-300 bg-white' : ''
                      }`}
                      min="0.5"
                      max="10"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-500">cm³/g</span>
                    {modified && (
                      <button
                        onClick={() => deleteVolumeOverride('bread', name)}
                        className="p-1 text-amber-500 hover:bg-amber-100 rounded"
                        title={t('settings.product.resetToDefault')}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 케이크류 섹션 */}
      {activeSection === 'cake' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('settings.product.search.cake')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* 수정된 항목 표시 */}
          {Object.keys(product.cakeVolumes).length > 0 && (
            <div className="p-3 bg-pink-50 border border-pink-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-pink-800">
                  {t('settings.product.modifiedCount', { count: Object.keys(product.cakeVolumes).length })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(product.cakeVolumes).map(([name, volume]) => {
                  const original = DEFAULT_CAKE_VOLUMES[name]
                  return (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs"
                    >
                      {getProductDisplayName(name)}: {volume} cm³/g
                      {original !== undefined && (
                        <span className="text-gray-400">({t('settings.product.default')} {original})</span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 케이크 목록 */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredCakeProducts.map(([name]) => {
              const currentVolume = getCakeVolume(name)
              const modified = isOverridden('cake', name)

              return (
                <div
                  key={name}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    modified ? 'bg-pink-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🎂</span>
                    <span className="text-sm font-medium text-gray-800">{getProductDisplayName(name)}</span>
                    {modified && (
                      <span className="px-1.5 py-0.5 bg-pink-200 text-pink-700 text-xs rounded">{t('settings.product.modified')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editingVolumes[`cake:${name}`] ?? currentVolume}
                      onChange={(e) => handleVolumeInputChange('cake', name, e.target.value)}
                      onBlur={() => handleVolumeBlur('cake', name)}
                      className={`w-20 px-2 py-1 text-sm border rounded text-center font-mono ${
                        modified ? 'border-pink-300 bg-white' : ''
                      }`}
                      min="0.5"
                      max="10"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-500">cm³/g</span>
                    {modified && (
                      <button
                        onClick={() => deleteVolumeOverride('cake', name)}
                        className="p-1 text-pink-500 hover:bg-pink-100 rounded"
                        title={t('settings.product.resetToDefault')}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 커스텀 제품 섹션 */}
      {activeSection === 'custom' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {t('settings.product.custom.desc')}
            </p>
            <button
              onClick={() => setShowCustomForm(true)}
              className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('settings.product.custom.addProduct')}
            </button>
          </div>

          {/* 커스텀 제품 폼 */}
          {showCustomForm && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">{t('settings.product.custom.newProduct')}</h4>
                <button onClick={() => setShowCustomForm(false)} className="p-1 hover:bg-white rounded">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings.product.custom.productName')} *
                  </label>
                  <input
                    type="text"
                    value={customForm.name}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('settings.product.custom.productNamePlaceholder')}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings.product.custom.category')}
                  </label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm(prev => ({
                      ...prev,
                      category: e.target.value as ProductVolumeSettings['customProducts'][0]['category']
                    }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {t(`settings.product.categories.${cat.value}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings.product.custom.specificVolume')}
                  </label>
                  <input
                    type="number"
                    value={customForm.specificVolume}
                    onChange={(e) => setCustomForm(prev => ({
                      ...prev,
                      specificVolume: parseFloat(e.target.value) || 0
                    }))}
                    min="0.5"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 text-sm border rounded-lg text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveCustom}
                  className="flex items-center gap-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </button>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* 커스텀 제품 목록 */}
          {product.customProducts.length > 0 ? (
            <div className="space-y-2">
              {product.customProducts.map(prod => {
                const catInfo = PRODUCT_CATEGORIES.find(c => c.value === prod.category)
                return (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{catInfo?.icon || '🧁'}</span>
                      <div>
                        <div className="font-medium text-gray-800">{prod.name}</div>
                        <div className="text-xs text-gray-500">
                          {t(`settings.product.categories.${prod.category}`)} · {t('settings.product.custom.volumeLabel')} {prod.specificVolume} cm³/g
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(t('settings.product.alerts.deleteConfirm', { name: prod.name }))) {
                          deleteCustomProduct(prod.id)
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500 border border-dashed rounded-lg">
              <Scale className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('settings.product.custom.emptyState')}</p>
            </div>
          )}

          {/* 도움말 */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-medium">{t('settings.product.help.title')}</p>
                <ul className="text-xs mt-1 space-y-0.5">
                  <li>{t('settings.product.help.dense')}</li>
                  <li>{t('settings.product.help.medium')}</li>
                  <li>{t('settings.product.help.light')}</li>
                  <li>{t('settings.product.help.veryLight')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
