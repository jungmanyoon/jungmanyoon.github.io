/**
 * 팬/틀 관리 설정 탭
 * 사용자가 보유한 팬을 등록하고 관리
 *
 * 적용: --persona-frontend (UX 전문가)
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore, DEFAULT_PAN_IDS } from '@/stores/useSettingsStore'
import { UserPan } from '@/types/settings.types'
import { PanScalingTS } from '@/utils/calculations/panScaling.ts'
import {
  Plus,
  Star,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Search,
  Box,
  AlertCircle
} from 'lucide-react'

// 팬 카테고리 목록 (value는 데이터 저장용, labelKey는 번역 키)
const PAN_CATEGORIES = [
  { value: '케이크팬', labelKey: 'cakePan' },
  { value: '무스틀', labelKey: 'mousseRing' },
  { value: '식빵틀', labelKey: 'breadPan' },
  { value: '풀먼틀', labelKey: 'pullmanPan' },
  { value: '파운드틀', labelKey: 'poundPan' },
  { value: '쉬폰틀', labelKey: 'chiffonPan' },
  { value: '타르트틀', labelKey: 'tartPan' },
  { value: '머핀틀', labelKey: 'muffinPan' },
  { value: '롤케이크팬', labelKey: 'rollCakePan' },
  { value: '시트팬', labelKey: 'sheetPan' },
  { value: '특수틀', labelKey: 'specialPan' },
  { value: '빵틀', labelKey: 'loafPan' }
]

// 팬 타입별 세부 종류 (value는 데이터 저장용, labelKey는 번역 키)
const PAN_TYPES: Record<string, { value: string; labelKey: string }[]> = {
  '케이크팬': [
    { value: 'round', labelKey: 'round' },
    { value: 'square', labelKey: 'square' },
    { value: 'springform', labelKey: 'springform' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '무스틀': [
    { value: 'round', labelKey: 'mousseRing' },
    { value: 'square', labelKey: 'squareMousse' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '식빵틀': [
    { value: 'loaf', labelKey: 'loaf' },
    { value: 'mini_loaf', labelKey: 'miniLoaf' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '풀먼틀': [
    { value: 'square', labelKey: 'pullman' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '파운드틀': [
    { value: 'loaf', labelKey: 'pound' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '쉬폰틀': [
    { value: 'chiffon', labelKey: 'chiffon' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '타르트틀': [
    { value: 'round', labelKey: 'roundTart' },
    { value: 'square', labelKey: 'squareTart' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '머핀틀': [
    { value: 'round', labelKey: 'muffin' },
    { value: 'mini', labelKey: 'miniMuffin' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '롤케이크팬': [
    { value: 'square', labelKey: 'rollCake' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '시트팬': [
    { value: 'square', labelKey: 'sheet' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '특수틀': [
    { value: 'round', labelKey: 'madeleine' },
    { value: 'square', labelKey: 'financier' },
    { value: 'custom', labelKey: 'custom' }
  ],
  '빵틀': [
    { value: 'loaf', labelKey: 'baguette' },
    { value: 'round', labelKey: 'brioche' },
    { value: 'custom', labelKey: 'custom' }
  ]
}

// 빈 팬 폼 데이터
const EMPTY_PAN_FORM = {
  name: '',
  category: '케이크팬',
  type: 'round',
  dimensions: {
    length: undefined as number | undefined,
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    diameter: undefined as number | undefined,
    innerDiameter: undefined as number | undefined
  },
  fillRatio: undefined as number | undefined,
  notes: '',
  isFavorite: false
}

type PanFormData = typeof EMPTY_PAN_FORM

interface PanSettingsTabProps {
  className?: string
}

export default function PanSettingsTab({ className = '' }: PanSettingsTabProps) {
  const { t } = useTranslation()
  const {
    pan,
    addPan,
    updatePan,
    deletePan,
    togglePanFavorite
  } = useSettingsStore()

  // 카테고리 라벨 번역 헬퍼
  const getCategoryLabel = useCallback((categoryValue: string) => {
    const cat = PAN_CATEGORIES.find(c => c.value === categoryValue)
    return cat ? t(`settings.pan.categories.${cat.labelKey}`) : categoryValue
  }, [t])

  // 팬 이름 번역 헬퍼 (기본 팬은 번역, 사용자 팬은 그대로)
  const getPanDisplayName = useCallback((panItem: UserPan) => {
    if (DEFAULT_PAN_IDS.includes(panItem.id)) {
      const translated = t(`settings.pan.panNames.${panItem.id}`, { defaultValue: '' })
      return translated || panItem.name
    }
    return panItem.name
  }, [t])

  // 타입 라벨 번역 헬퍼
  const getTypeLabel = useCallback((categoryValue: string, typeValue: string) => {
    const types = PAN_TYPES[categoryValue] || []
    const type = types.find(t => t.value === typeValue)
    return type ? t(`settings.pan.types.${type.labelKey}`) : typeValue
  }, [t])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PanFormData>(EMPTY_PAN_FORM)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [expandedPanId, setExpandedPanId] = useState<string | null>(null)

  // 필터링된 팬 목록
  const filteredPans = useMemo(() => {
    return pan.myPans.filter(p => {
      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(query)
        const matchCategory = p.category.toLowerCase().includes(query)
        const matchType = p.type.toLowerCase().includes(query)
        if (!matchName && !matchCategory && !matchType) return false
      }
      // 카테고리 필터
      if (filterCategory && p.category !== filterCategory) return false
      // 즐겨찾기 필터
      if (showFavoritesOnly && !p.isFavorite) return false
      return true
    })
  }, [pan.myPans, searchQuery, filterCategory, showFavoritesOnly])

  // 부피 계산 (한글 카테고리 지원)
  const calculateVolume = useCallback((data: PanFormData): number | null => {
    const { dimensions, category, type } = data

    // 원형 계열 카테고리 (지름 사용)
    const roundCategories = ['케이크팬', '무스틀', '타르트틀', '머핀틀']
    // 쉬폰 (내경 있음)
    const chiffonCategories = ['쉬폰틀']
    // 사각형 계열 (길이×너비×높이)
    const squareCategories = ['식빵틀', '풀먼틀', '파운드틀', '롤케이크팬', '시트팬', '특수틀', '빵틀']

    try {
      // type으로 형태 판단 (더 정확)
      if (type === 'chiffon' || chiffonCategories.includes(category)) {
        if (dimensions.diameter && dimensions.innerDiameter && dimensions.height) {
          return PanScalingTS.calculateChiffonPanVolume(
            dimensions.diameter,
            dimensions.innerDiameter,
            dimensions.height
          )
        }
      } else if (type === 'round' || (roundCategories.includes(category) && dimensions.diameter)) {
        if (dimensions.diameter && dimensions.height) {
          return PanScalingTS.calculateRoundPanVolume(dimensions.diameter, dimensions.height)
        }
      } else if (type === 'loaf' || type === 'square' || squareCategories.includes(category)) {
        if (dimensions.length && dimensions.width && dimensions.height) {
          return PanScalingTS.calculateSquarePanVolume(
            dimensions.length,
            dimensions.width,
            dimensions.height
          )
        }
      }
    } catch (e) {
      console.error(t('settings.pan.volumeCalcError'), e)
    }
    return null
  }, [t])

  // 폼 계산된 부피
  const calculatedVolume = useMemo(() => calculateVolume(formData), [formData, calculateVolume])

  // 폼 리셋
  const resetForm = useCallback(() => {
    setFormData(EMPTY_PAN_FORM)
    setEditingId(null)
    setShowForm(false)
  }, [])

  // 팬 편집 시작
  const startEditing = useCallback((panItem: UserPan) => {
    setFormData({
      name: panItem.name,
      category: panItem.category,
      type: panItem.type,
      dimensions: {
        length: panItem.dimensions?.length,
        width: panItem.dimensions?.width,
        height: panItem.dimensions?.height,
        diameter: panItem.dimensions?.diameter,
        innerDiameter: panItem.dimensions?.innerDiameter
      },
      fillRatio: panItem.fillRatio,
      notes: panItem.notes || '',
      isFavorite: panItem.isFavorite
    })
    setEditingId(panItem.id)
    setShowForm(true)
  }, [])

  // 팬 저장
  const handleSave = useCallback(() => {
    const volume = calculateVolume(formData)
    if (!volume) {
      alert(t('settings.pan.dimensionError'))
      return
    }

    const panData = {
      name: formData.name || `${formData.category} ${formData.type}`,
      category: formData.category,
      type: formData.type,
      volume,
      dimensions: formData.dimensions,
      fillRatio: formData.fillRatio,
      notes: formData.notes || undefined,
      isFavorite: formData.isFavorite
    }

    if (editingId) {
      updatePan(editingId, panData)
    } else {
      addPan(panData)
    }

    resetForm()
  }, [formData, editingId, calculateVolume, updatePan, addPan, resetForm, t])

  // 팬 복제
  const duplicatePan = useCallback((panItem: UserPan) => {
    addPan({
      name: `${getPanDisplayName(panItem)} ${t('settings.pan.copyText')}`,
      category: panItem.category,
      type: panItem.type,
      volume: panItem.volume,
      dimensions: panItem.dimensions,
      fillRatio: panItem.fillRatio,
      notes: panItem.notes,
      isFavorite: false
    })
  }, [addPan, t, getPanDisplayName])

  // 카테고리 변경 시 타입 리셋
  const handleCategoryChange = useCallback((category: string) => {
    const types = PAN_TYPES[category] || PAN_TYPES.other
    setFormData(prev => ({
      ...prev,
      category,
      type: types[0]?.value || 'custom',
      dimensions: {
        length: undefined,
        width: undefined,
        height: undefined,
        diameter: undefined,
        innerDiameter: undefined
      }
    }))
  }, [])

  // 치수 입력 필드 렌더링
  const renderDimensionInputs = () => {
    const { category, dimensions, type } = formData
    // 원형 계열 (지름 사용)
    const roundCategories = ['케이크팬', '무스틀', '타르트틀', '머핀틀']
    const isRound = type === 'round' || roundCategories.includes(category)
    const isChiffon = type === 'chiffon' || category === '쉬폰틀'

    return (
      <div className="grid grid-cols-3 gap-2">
        {(isRound || isChiffon) ? (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {isChiffon ? t('settings.pan.outerDiameter') : t('settings.pan.diameter')} (cm)
              </label>
              <input
                type="number"
                value={dimensions.diameter || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, diameter: parseFloat(e.target.value) || undefined }
                }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="15"
                step="0.5"
              />
            </div>
            {isChiffon && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('settings.pan.innerDiameter')} (cm)</label>
                <input
                  type="number"
                  value={dimensions.innerDiameter || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, innerDiameter: parseFloat(e.target.value) || undefined }
                  }))}
                  className="w-full px-2 py-1.5 text-sm border rounded"
                  placeholder="5"
                  step="0.5"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('settings.pan.height')} (cm)</label>
              <input
                type="number"
                value={dimensions.height || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || undefined }
                }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="7"
                step="0.5"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('settings.pan.length')} (cm)</label>
              <input
                type="number"
                value={dimensions.length || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || undefined }
                }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="20"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('settings.pan.width')} (cm)</label>
              <input
                type="number"
                value={dimensions.width || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || undefined }
                }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="10"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('settings.pan.height')} (cm)</label>
              <input
                type="number"
                value={dimensions.height || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || undefined }
                }))}
                className="w-full px-2 py-1.5 text-sm border rounded"
                placeholder="10"
                step="0.5"
              />
            </div>
          </>
        )}
      </div>
    )
  }

  // 치수 문자열 생성
  const getDimensionString = (panItem: UserPan): string => {
    const d = panItem.dimensions
    if (!d) return ''

    if (d.diameter) {
      if (d.innerDiameter) {
        // 쉬폰틀: 외경/내경×높이
        return `ø${d.diameter}/${d.innerDiameter}×${d.height}cm`
      }
      // 원형: 지름×높이
      return `ø${d.diameter}×${d.height}cm`
    }
    if (d.length && d.width) {
      // 사각형: 길이×너비×높이
      return `${d.length}×${d.width}×${d.height}cm`
    }
    return ''
  }

  // 팬 카드 렌더링
  const renderPanCard = (panItem: UserPan) => {
    const isExpanded = expandedPanId === panItem.id
    const dimensionStr = getDimensionString(panItem)

    return (
      <div
        key={panItem.id}
        className={`border rounded-lg overflow-hidden transition-all ${
          panItem.isFavorite ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200 bg-white'
        }`}
      >
        {/* 팬 헤더 - 모든 정보를 한 줄에 표시 */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setExpandedPanId(isExpanded ? null : panItem.id)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Box className="w-4 h-4 text-gray-400 flex-shrink-0" />

            {/* 팬 이름 */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-gray-800 truncate">{getPanDisplayName(panItem)}</span>
              {panItem.isFavorite && (
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>

            {/* 사이즈 정보 - 바로 표시 */}
            {dimensionStr && (
              <span className="text-sm text-gray-500 font-mono flex-shrink-0">
                {dimensionStr}
              </span>
            )}

            {/* 용량 */}
            <span className="text-sm text-blue-600 font-mono font-medium flex-shrink-0">
              {panItem.volume.toLocaleString()}ml
            </span>

            {/* 메모 (있으면) */}
            {panItem.notes && (
              <span className="text-xs text-gray-400 truncate hidden sm:inline">
                {panItem.notes}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePanFavorite(panItem.id)
              }}
              className={`p-1.5 rounded hover:bg-gray-100 ${
                panItem.isFavorite ? 'text-yellow-500' : 'text-gray-400'
              }`}
              title={t('settings.pan.favorites')}
            >
              <Star className={`w-4 h-4 ${panItem.isFavorite ? 'fill-current' : ''}`} />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* 팬 상세 (확장됨) - 편집/삭제 버튼만 */}
        {isExpanded && editingId !== panItem.id && (
          <div className="px-3 pb-3 border-t border-gray-100">
            <div className="pt-3 flex flex-wrap items-center gap-3">
              {/* 카테고리 뱃지 */}
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {getCategoryLabel(panItem.category)}
              </span>

              {/* 충전율 (있으면) */}
              {panItem.fillRatio && (
                <span className="text-xs text-gray-500">
                  {t('settings.pan.fillRatio')}: {(panItem.fillRatio * 100).toFixed(0)}%
                </span>
              )}

              {/* 메모 (모바일에서도 표시) */}
              {panItem.notes && (
                <span className="text-xs text-gray-500 italic sm:hidden">
                  {panItem.notes}
                </span>
              )}

              {/* 구분선 */}
              <div className="flex-1" />

              {/* 액션 버튼 */}
              <button
                onClick={() => startEditing(panItem)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                <Edit2 className="w-3 h-3" />
                {t('common.edit')}
              </button>
              <button
                onClick={() => duplicatePan(panItem)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
              >
                <Copy className="w-3 h-3" />
                {t('settings.pan.duplicate')}
              </button>
              <button
                onClick={() => {
                  if (confirm(t('settings.pan.deleteConfirm', { name: getPanDisplayName(panItem) }))) {
                    deletePan(panItem.id)
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3" />
                {t('common.delete')}
              </button>
            </div>
          </div>
        )}

        {/* 인라인 편집 폼 (해당 팬 편집 중일 때) */}
        {editingId === panItem.id && showForm && (
          <div className="p-4 border-t border-orange-200 bg-orange-50/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">{t('settings.pan.editPan')}</h4>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.pan.nameOptional')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('settings.pan.namePlaceholder')}
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                />
              </div>

              {/* 종류 및 타입 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings.pan.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  >
                    {PAN_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{t(`settings.pan.categories.${cat.labelKey}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings.pan.subType')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  >
                    {(PAN_TYPES[formData.category] || PAN_TYPES['케이크팬']).map(type => (
                      <option key={type.value} value={type.value}>{t(`settings.pan.types.${type.labelKey}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 치수 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.pan.dimensions')}
                </label>
                {renderDimensionInputs()}
              </div>

              {/* 계산된 부피 표시 */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Box className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-blue-700">
                    {t('settings.pan.calculatedVolume')}: {' '}
                    <span className="font-mono font-bold">
                      {calculatedVolume ? `${Math.round(calculatedVolume).toLocaleString()} ml` : t('settings.pan.enterDimensions')}
                    </span>
                  </div>
                  {!calculatedVolume && (
                    <div className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {t('settings.pan.dimensionsRequired')}
                    </div>
                  )}
                </div>
              </div>

              {/* 충전율 (선택) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.pan.fillRatioOptional')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={(formData.fillRatio || 0.7) * 100}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      fillRatio: parseInt(e.target.value) / 100
                    }))}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm text-gray-600 font-mono">
                    {formData.fillRatio ? `${(formData.fillRatio * 100).toFixed(0)}%` : '70%'}
                  </span>
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.pan.notesOptional')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('settings.pan.notesPlaceholder')}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg resize-none"
                />
              </div>

              {/* 즐겨찾기 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Star className={`w-4 h-4 ${formData.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-700">{t('settings.pan.addToFavorites')}</span>
              </label>

              {/* 저장 버튼 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!calculatedVolume}
                  className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{t('settings.pan.title')}</h3>
          <p className="text-sm text-gray-500">
            {t('settings.pan.titleDesc')}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('settings.pan.addPan')}
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('settings.pan.searchPlaceholder')}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg"
          />
        </div>
        <select
          value={filterCategory || ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="px-3 py-2 text-sm border rounded-lg"
        >
          <option value="">{t('settings.pan.allTypes')}</option>
          {PAN_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{t(`settings.pan.categories.${cat.labelKey}`)}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
            showFavoritesOnly
              ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
              : 'hover:bg-gray-50'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          {t('settings.pan.favorites')}
        </button>
      </div>

      {/* 새 팬 추가 폼 (편집이 아닐 때만 상단에 표시) */}
      {showForm && !editingId && (
        <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800">
              {editingId ? t('settings.pan.editPan') : t('settings.pan.newPan')}
            </h4>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.pan.nameOptional')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('settings.pan.namePlaceholder')}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
            </div>

            {/* 종류 및 타입 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.pan.category')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                >
                  {PAN_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{t(`settings.pan.categories.${cat.labelKey}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.pan.subType')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                >
                  {(PAN_TYPES[formData.category] || PAN_TYPES['케이크팬']).map(type => (
                    <option key={type.value} value={type.value}>{t(`settings.pan.types.${type.labelKey}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 치수 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.pan.dimensions')}
              </label>
              {renderDimensionInputs()}
            </div>

            {/* 계산된 부피 표시 */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Box className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-blue-700">
                  {t('settings.pan.calculatedVolume')}: {' '}
                  <span className="font-mono font-bold">
                    {calculatedVolume ? `${Math.round(calculatedVolume).toLocaleString()} ml` : t('settings.pan.enterDimensions')}
                  </span>
                </div>
                {!calculatedVolume && (
                  <div className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    {t('settings.pan.dimensionsRequired')}
                  </div>
                )}
              </div>
            </div>

            {/* 충전율 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.pan.fillRatioOptional')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="30"
                  max="95"
                  step="5"
                  value={(formData.fillRatio || 0.7) * 100}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fillRatio: parseInt(e.target.value) / 100
                  }))}
                  className="flex-1"
                />
                <span className="w-12 text-sm text-gray-600 font-mono">
                  {formData.fillRatio ? `${(formData.fillRatio * 100).toFixed(0)}%` : '70%'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('settings.pan.fillRatioDesc')}
              </p>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.pan.notesOptional')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('settings.pan.notesPlaceholder')}
                rows={2}
                className="w-full px-3 py-2 text-sm border rounded-lg resize-none"
              />
            </div>

            {/* 즐겨찾기 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Star className={`w-4 h-4 ${formData.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-700">{t('settings.pan.addToFavorites')}</span>
            </label>

            {/* 저장 버튼 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={!calculatedVolume}
                className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? t('common.save') : t('common.add')}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팬 목록 */}
      <div className="space-y-2">
        {filteredPans.length === 0 ? (
          <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg">
            {pan.myPans.length === 0 ? (
              <>
                <Box className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">{t('settings.pan.noPans')}</p>
                <p className="text-sm mt-1">
                  {t('settings.pan.noPansDesc')}
                </p>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">{t('settings.pan.noResults')}</p>
                <p className="text-sm mt-1">
                  {t('settings.pan.noResultsDesc')}
                </p>
              </>
            )}
          </div>
        ) : (
          filteredPans.map(renderPanCard)
        )}
      </div>

      {/* 통계 */}
      {pan.myPans.length > 0 && (
        <div className="text-xs text-gray-400 pt-2 border-t">
          {t('settings.pan.totalPans', { count: pan.myPans.length })}
          {pan.myPans.filter(p => p.isFavorite).length > 0 && (
            <> · {t('settings.pan.favoritesCount', { count: pan.myPans.filter(p => p.isFavorite).length })}</>
          )}
        </div>
      )}
    </div>
  )
}
