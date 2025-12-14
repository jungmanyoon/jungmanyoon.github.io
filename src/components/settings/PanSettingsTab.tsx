/**
 * 팬/틀 관리 설정 탭
 * 사용자가 보유한 팬을 등록하고 관리
 *
 * 적용: --persona-frontend (UX 전문가)
 */

import { useState, useMemo, useCallback } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'
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

// 팬 카테고리 목록 (실제 데이터 기준)
const PAN_CATEGORIES = [
  { value: '케이크팬', label: '케이크팬' },
  { value: '무스틀', label: '무스틀' },
  { value: '식빵틀', label: '식빵틀' },
  { value: '풀먼틀', label: '풀먼틀' },
  { value: '파운드틀', label: '파운드틀' },
  { value: '쉬폰틀', label: '쉬폰틀' },
  { value: '타르트틀', label: '타르트틀' },
  { value: '머핀틀', label: '머핀틀' },
  { value: '롤케이크팬', label: '롤케이크팬' },
  { value: '시트팬', label: '시트팬' },
  { value: '특수틀', label: '특수틀' },
  { value: '빵틀', label: '빵틀' }
]

// 팬 타입별 세부 종류 (한글 카테고리 기준)
const PAN_TYPES: Record<string, { value: string; label: string }[]> = {
  '케이크팬': [
    { value: 'round', label: '원형팬' },
    { value: 'square', label: '정사각팬' },
    { value: 'springform', label: '분리형팬' },
    { value: 'custom', label: '기타' }
  ],
  '무스틀': [
    { value: 'round', label: '무스링' },
    { value: 'square', label: '사각 무스틀' },
    { value: 'custom', label: '기타' }
  ],
  '식빵틀': [
    { value: 'loaf', label: '일반 식빵틀' },
    { value: 'mini_loaf', label: '미니 식빵틀' },
    { value: 'custom', label: '기타' }
  ],
  '풀먼틀': [
    { value: 'square', label: '풀먼틀 (뚜껑형)' },
    { value: 'custom', label: '기타' }
  ],
  '파운드틀': [
    { value: 'loaf', label: '파운드틀' },
    { value: 'custom', label: '기타' }
  ],
  '쉬폰틀': [
    { value: 'chiffon', label: '쉬폰틀 (중심관 있음)' },
    { value: 'custom', label: '기타' }
  ],
  '타르트틀': [
    { value: 'round', label: '원형 타르트틀' },
    { value: 'square', label: '사각 타르트틀' },
    { value: 'custom', label: '기타' }
  ],
  '머핀틀': [
    { value: 'round', label: '일반 머핀틀' },
    { value: 'mini', label: '미니 머핀틀' },
    { value: 'custom', label: '기타' }
  ],
  '롤케이크팬': [
    { value: 'square', label: '롤케이크팬' },
    { value: 'custom', label: '기타' }
  ],
  '시트팬': [
    { value: 'square', label: '시트팬' },
    { value: 'custom', label: '기타' }
  ],
  '특수틀': [
    { value: 'round', label: '마들렌/구겔호프 등' },
    { value: 'square', label: '피낭시에 등' },
    { value: 'custom', label: '기타' }
  ],
  '빵틀': [
    { value: 'loaf', label: '바게트/특수 빵틀' },
    { value: 'round', label: '브리오슈틀' },
    { value: 'custom', label: '기타' }
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
  const {
    pan,
    addPan,
    updatePan,
    deletePan,
    togglePanFavorite
  } = useSettingsStore()

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
      console.error('부피 계산 오류:', e)
    }
    return null
  }, [])

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
      alert('치수를 입력해주세요. 부피를 계산할 수 없습니다.')
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
  }, [formData, editingId, calculateVolume, updatePan, addPan, resetForm])

  // 팬 복제
  const duplicatePan = useCallback((panItem: UserPan) => {
    addPan({
      name: `${panItem.name} (복사)`,
      category: panItem.category,
      type: panItem.type,
      volume: panItem.volume,
      dimensions: panItem.dimensions,
      fillRatio: panItem.fillRatio,
      notes: panItem.notes,
      isFavorite: false
    })
  }, [addPan])

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
                {isChiffon ? '외경' : '지름'} (cm)
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
                <label className="block text-xs text-gray-500 mb-1">내경 (cm)</label>
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
              <label className="block text-xs text-gray-500 mb-1">높이 (cm)</label>
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
              <label className="block text-xs text-gray-500 mb-1">길이 (cm)</label>
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
              <label className="block text-xs text-gray-500 mb-1">너비 (cm)</label>
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
              <label className="block text-xs text-gray-500 mb-1">높이 (cm)</label>
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
              <span className="font-medium text-gray-800 truncate">{panItem.name}</span>
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
              title="즐겨찾기"
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
                {panItem.category}
              </span>

              {/* 충전율 (있으면) */}
              {panItem.fillRatio && (
                <span className="text-xs text-gray-500">
                  충전율: {(panItem.fillRatio * 100).toFixed(0)}%
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
                편집
              </button>
              <button
                onClick={() => duplicatePan(panItem)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
              >
                <Copy className="w-3 h-3" />
                복제
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${panItem.name}" 팬을 삭제하시겠습니까?`)) {
                    deletePan(panItem.id)
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3" />
                삭제
              </button>
            </div>
          </div>
        )}

        {/* 인라인 편집 폼 (해당 팬 편집 중일 때) */}
        {editingId === panItem.id && showForm && (
          <div className="p-4 border-t border-orange-200 bg-orange-50/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">팬 정보 수정</h4>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  팬 이름 (선택)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 우리집 식빵틀, 엄마 쉬폰팬"
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                />
              </div>

              {/* 종류 및 타입 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    팬 종류
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  >
                    {PAN_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    세부 타입
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  >
                    {(PAN_TYPES[formData.category] || PAN_TYPES['케이크팬']).map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 치수 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  치수
                </label>
                {renderDimensionInputs()}
              </div>

              {/* 계산된 부피 표시 */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Box className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-blue-700">
                    계산된 부피: {' '}
                    <span className="font-mono font-bold">
                      {calculatedVolume ? `${Math.round(calculatedVolume).toLocaleString()} ml` : '치수를 입력하세요'}
                    </span>
                  </div>
                  {!calculatedVolume && (
                    <div className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      필수 치수를 모두 입력해야 부피가 계산됩니다
                    </div>
                  )}
                </div>
              </div>

              {/* 충전율 (선택) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기본 충전율 (선택)
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
                  메모 (선택)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="예: 테프론 코팅, 살짝 찌그러짐 있음"
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
                <span className="text-sm text-gray-700">즐겨찾기에 추가</span>
              </label>

              {/* 저장 버튼 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!calculatedVolume}
                  className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  저장
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
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
          <h3 className="text-lg font-semibold text-gray-800">내 팬/틀 관리</h3>
          <p className="text-sm text-gray-500">
            보유한 팬을 등록하면 레시피 변환 시 빠르게 선택할 수 있습니다.
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
          팬 추가
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
            placeholder="팬 이름, 종류로 검색..."
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg"
          />
        </div>
        <select
          value={filterCategory || ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="px-3 py-2 text-sm border rounded-lg"
        >
          <option value="">모든 종류</option>
          {PAN_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
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
          즐겨찾기
        </button>
      </div>

      {/* 새 팬 추가 폼 (편집이 아닐 때만 상단에 표시) */}
      {showForm && !editingId && (
        <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800">
              {editingId ? '팬 정보 수정' : '새 팬 추가'}
            </h4>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                팬 이름 (선택)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="예: 우리집 식빵틀, 엄마 쉬폰팬"
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
            </div>

            {/* 종류 및 타입 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  팬 종류
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                >
                  {PAN_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  세부 타입
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                >
                  {(PAN_TYPES[formData.category] || PAN_TYPES.other).map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 치수 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                치수
              </label>
              {renderDimensionInputs()}
            </div>

            {/* 계산된 부피 표시 */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Box className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-blue-700">
                  계산된 부피: {' '}
                  <span className="font-mono font-bold">
                    {calculatedVolume ? `${Math.round(calculatedVolume).toLocaleString()} ml` : '치수를 입력하세요'}
                  </span>
                </div>
                {!calculatedVolume && (
                  <div className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    필수 치수를 모두 입력해야 부피가 계산됩니다
                  </div>
                )}
              </div>
            </div>

            {/* 충전율 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기본 충전율 (선택)
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
                팬에 반죽을 채우는 기본 비율 (제품별로 다르게 적용 가능)
              </p>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모 (선택)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="예: 테프론 코팅, 살짝 찌그러짐 있음"
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
              <span className="text-sm text-gray-700">즐겨찾기에 추가</span>
            </label>

            {/* 저장 버튼 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={!calculatedVolume}
                className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? '저장' : '추가'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
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
                <p className="font-medium">등록된 팬이 없습니다</p>
                <p className="text-sm mt-1">
                  자주 사용하는 팬을 등록해보세요!
                </p>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">검색 결과가 없습니다</p>
                <p className="text-sm mt-1">
                  다른 검색어나 필터를 사용해보세요.
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
          총 {pan.myPans.length}개 팬 등록됨
          {pan.myPans.filter(p => p.isFavorite).length > 0 && (
            <> · 즐겨찾기 {pan.myPans.filter(p => p.isFavorite).length}개</>
          )}
        </div>
      )}
    </div>
  )
}
