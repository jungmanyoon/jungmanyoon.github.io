/**
 * 재료 데이터베이스 설정 탭 (통합 테이블 뷰)
 * 모든 재료 속성을 Excel 스타일 테이블로 표시
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { CustomIngredient, IngredientSubstitution, CostOverride, NutritionOverride } from '@/types/settings.types'
import { INGREDIENT_DATABASE, IngredientInfo, PRIMARY_INGREDIENT_NAMES } from '@/data/ingredientDatabase'
import { nutritionDatabase, NutritionData } from '@/data/nutritionDatabase'
import { SUBSTITUTION_RULES, SubstitutionRule, getSubstitutionRules } from '@/data/substitutionRules'
import { findIngredientByKorean, translateBakingNote } from '@/data/ingredientTranslations'
import {
  Apple,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  ArrowRight,
  Edit3,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Filter
} from 'lucide-react'

// 재료 카테고리 (키와 아이콘만 정의, 라벨은 번역 사용)
const INGREDIENT_CATEGORIES: { value: IngredientInfo['category']; icon: string }[] = [
  { value: 'flour', icon: '🌾' },
  { value: 'liquid', icon: '💧' },
  { value: 'fat', icon: '🧈' },
  { value: 'sugar', icon: '🍬' },
  { value: 'egg', icon: '🥚' },
  { value: 'dairy', icon: '🥛' },
  { value: 'leavening', icon: '🫧' },
  { value: 'salt', icon: '🧂' },
  { value: 'flavoring', icon: '🍋' },
  { value: 'nut', icon: '🥜' },
  { value: 'fruit', icon: '🍎' },
  { value: 'chocolate', icon: '🍫' },
  { value: 'other', icon: '📦' }
]

const getCategoryInfo = (category: string) =>
  INGREDIENT_CATEGORIES.find(c => c.value === category) || { value: 'other', icon: '📦' }

interface IngredientSettingsTabProps {
  className?: string
}

// 통합 재료 정보 타입
interface UnifiedIngredient {
  name: string
  category: IngredientInfo['category']
  moisture: number | undefined
  moistureOverridden: boolean
  cost: CostOverride | undefined
  nutrition: NutritionOverride | undefined
  defaultNutrition: NutritionData | undefined  // 기본 영양정보
  substitutions: IngredientSubstitution[]
  defaultSubstitutions: SubstitutionRule[]     // 기본 대체규칙
  isCustom: boolean
  originalData?: IngredientInfo
}

export default function IngredientSettingsTab({ className = '' }: IngredientSettingsTabProps) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language === 'en' ? 'en' : 'ko'

  // 재료명 번역 헬퍼 함수 (기본 DB 재료 + 번역 데이터베이스 모두 검색)
  const getIngredientDisplayName = useCallback((name: string): string => {
    // 1. i18n 번역 시도 (PRIMARY_INGREDIENT_NAMES)
    if (PRIMARY_INGREDIENT_NAMES.includes(name)) {
      const translated = t(`settings.ingredient.ingredientNames.${name}`, { defaultValue: '' })
      if (translated) return translated
    }

    // 2. 영어 모드: ingredientTranslations 데이터베이스 검색
    if (currentLang === 'en') {
      const translationData = findIngredientByKorean(name)
      if (translationData) {
        return translationData.en
      }
    }

    return name
  }, [t, currentLang])

  // 재료 별칭을 현재 언어에 맞게 가져오기
  const getIngredientAlias = useCallback((name: string, aliases?: string[]): string | null => {
    // Try to find in translation database first
    const translationData = findIngredientByKorean(name)
    if (translationData?.aliases) {
      const langAliases = currentLang === 'en' ? translationData.aliases.en : translationData.aliases.ko
      if (langAliases && langAliases.length > 0) {
        return langAliases[0]
      }
    }
    // Fallback: filter aliases from database based on language
    if (aliases && aliases.length > 0) {
      const isEnglish = (str: string) => /^[a-zA-Z\s]+$/.test(str)
      if (currentLang === 'en') {
        const englishAlias = aliases.find(a => isEnglish(a))
        return englishAlias || null
      } else {
        const koreanAlias = aliases.find(a => !isEnglish(a))
        return koreanAlias || null
      }
    }
    return null
  }, [currentLang])

  const {
    ingredient,
    addCustomIngredient,
    deleteCustomIngredient,
    setMoistureOverride,
    addSubstitution,
    deleteSubstitution,
    setCostOverride,
    deleteCostOverride,
    setNutritionOverride,
    deleteNutritionOverride
  } = useSettingsStore()

  // 검색 및 필터
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showOnlyModified, setShowOnlyModified] = useState(false)

  // 편집 상태
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    moisture?: number
    cost?: CostOverride
    nutrition?: NutritionOverride
  }>({})

  // 커스텀 재료 폼
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm] = useState<Omit<CustomIngredient, 'id'>>({
    name: '',
    category: 'other',
    aliases: [],
    moisture: undefined,
    isFlour: false
  })

  // 대체재료 추가 폼
  const [showSubForm, setShowSubForm] = useState<string | null>(null)
  const [subForm, setSubForm] = useState<Omit<IngredientSubstitution, 'id'>>({
    original: '',
    substitute: '',
    ratio: 1,
    notes: ''
  })

  // 확장된 행 (대체재료 보기)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // 통합 재료 목록 생성
  const unifiedIngredients = useMemo((): UnifiedIngredient[] => {
    const result: UnifiedIngredient[] = []

    // 데이터베이스 재료
    for (const ing of INGREDIENT_DATABASE) {
      const moistureOverride = ingredient.moistureOverrides[ing.name]
      const cost = (ingredient.costOverrides || {})[ing.name]
      const nutrition = (ingredient.nutritionOverrides || {})[ing.name]
      const subs = ingredient.substitutions.filter(s => s.original === ing.name)

      // 기본 영양정보 조회
      const defaultNutrition = nutritionDatabase[ing.name]

      // 기본 대체규칙 조회
      const defaultSubs = SUBSTITUTION_RULES.filter(rule => rule.original === ing.name)

      result.push({
        name: ing.name,
        category: ing.category,
        moisture: moistureOverride ?? ing.moisture,
        moistureOverridden: moistureOverride !== undefined,
        cost,
        nutrition,
        defaultNutrition,
        substitutions: subs,
        defaultSubstitutions: defaultSubs,
        isCustom: false,
        originalData: ing
      })
    }

    // 커스텀 재료
    for (const custom of ingredient.customIngredients) {
      // 이미 데이터베이스에 있는지 확인
      if (result.some(r => r.name === custom.name)) continue

      const cost = (ingredient.costOverrides || {})[custom.name]
      const nutrition = (ingredient.nutritionOverrides || {})[custom.name]
      const subs = ingredient.substitutions.filter(s => s.original === custom.name)

      // 커스텀 재료도 기본 데이터 조회 시도
      const defaultNutrition = nutritionDatabase[custom.name]
      const defaultSubs = SUBSTITUTION_RULES.filter(rule => rule.original === custom.name)

      result.push({
        name: custom.name,
        category: custom.category,
        moisture: custom.moisture,
        moistureOverridden: false,
        cost,
        nutrition,
        defaultNutrition,
        substitutions: subs,
        defaultSubstitutions: defaultSubs,
        isCustom: true
      })
    }

    return result
  }, [ingredient])

  // 필터링된 목록
  const filteredIngredients = useMemo(() => {
    let list = unifiedIngredients

    // 검색 필터
    if (search) {
      const searchLower = search.toLowerCase()
      list = list.filter(ing => {
        const nameMatch = ing.name.toLowerCase().includes(searchLower)
        const aliasMatch = ing.originalData?.aliases?.some(a =>
          a.toLowerCase().includes(searchLower)
        )
        return nameMatch || aliasMatch
      })
    }

    // 카테고리 필터
    if (categoryFilter !== 'all') {
      list = list.filter(ing => ing.category === categoryFilter)
    }

    // 수정된 항목만
    if (showOnlyModified) {
      list = list.filter(ing =>
        ing.moistureOverridden ||
        ing.cost !== undefined ||
        ing.nutrition !== undefined ||
        ing.substitutions.length > 0 ||
        ing.isCustom
      )
    }

    return list
  }, [unifiedIngredients, search, categoryFilter, showOnlyModified])

  // 편집 시작
  const handleStartEdit = useCallback((name: string) => {
    const ing = unifiedIngredients.find(i => i.name === name)
    if (!ing) return

    setEditingRow(name)
    setEditForm({
      moisture: ing.moisture,
      cost: ing.cost ? { ...ing.cost } : {},
      nutrition: ing.nutrition ? { ...ing.nutrition } : {}
    })
  }, [unifiedIngredients])

  // 편집 저장
  const handleSaveEdit = useCallback(() => {
    if (!editingRow) return

    const ing = unifiedIngredients.find(i => i.name === editingRow)
    if (!ing) return

    // 수분함량 저장
    if (editForm.moisture !== undefined && editForm.moisture !== ing.originalData?.moisture) {
      setMoistureOverride(editingRow, editForm.moisture)
    }

    // 원가 저장
    if (editForm.cost && Object.keys(editForm.cost).length > 0) {
      const cleaned: CostOverride = {}
      if (editForm.cost.retailPrice && editForm.cost.retailPrice > 0) {
        cleaned.retailPrice = editForm.cost.retailPrice
      }
      if (editForm.cost.wholesalePrice && editForm.cost.wholesalePrice > 0) {
        cleaned.wholesalePrice = editForm.cost.wholesalePrice
      }
      if (editForm.cost.bulkPrice && editForm.cost.bulkPrice > 0) {
        cleaned.bulkPrice = editForm.cost.bulkPrice
      }
      if (Object.keys(cleaned).length > 0) {
        setCostOverride(editingRow, cleaned)
      }
    }

    // 영양정보 저장
    if (editForm.nutrition && Object.keys(editForm.nutrition).length > 0) {
      const cleaned: NutritionOverride = {}
      if (editForm.nutrition.calories !== undefined && editForm.nutrition.calories >= 0) {
        cleaned.calories = editForm.nutrition.calories
      }
      if (editForm.nutrition.protein !== undefined && editForm.nutrition.protein >= 0) {
        cleaned.protein = editForm.nutrition.protein
      }
      if (editForm.nutrition.carbohydrates !== undefined && editForm.nutrition.carbohydrates >= 0) {
        cleaned.carbohydrates = editForm.nutrition.carbohydrates
      }
      if (editForm.nutrition.fat !== undefined && editForm.nutrition.fat >= 0) {
        cleaned.fat = editForm.nutrition.fat
      }
      if (Object.keys(cleaned).length > 0) {
        setNutritionOverride(editingRow, cleaned)
      }
    }

    setEditingRow(null)
    setEditForm({})
  }, [editingRow, editForm, unifiedIngredients, setMoistureOverride, setCostOverride, setNutritionOverride])

  // 편집 취소
  const handleCancelEdit = useCallback(() => {
    setEditingRow(null)
    setEditForm({})
  }, [])

  // 커스텀 재료 저장
  const handleSaveCustom = useCallback(() => {
    if (!customForm.name.trim()) {
      alert(t('settings.ingredient.alerts.nameRequired'))
      return
    }
    addCustomIngredient(customForm)
    setCustomForm({
      name: '',
      category: 'other',
      aliases: [],
      moisture: undefined,
      isFlour: false
    })
    setShowCustomForm(false)
  }, [customForm, addCustomIngredient, t])

  // 대체재료 저장
  const handleSaveSubstitution = useCallback(() => {
    if (!subForm.original.trim() || !subForm.substitute.trim()) {
      alert(t('settings.ingredient.alerts.substituteRequired'))
      return
    }
    addSubstitution(subForm)
    setSubForm({
      original: '',
      substitute: '',
      ratio: 1,
      notes: ''
    })
    setShowSubForm(null)
  }, [subForm, addSubstitution, t])

  // 행 확장 토글
  const toggleRowExpand = useCallback((name: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }, [])

  // 데이터 초기화 (특정 재료)
  const handleResetIngredient = useCallback((name: string) => {
    const ing = unifiedIngredients.find(i => i.name === name)
    if (!ing) return

    if (ing.moistureOverridden) {
      // 수분함량 오버라이드 삭제 (원본 값으로 복원)
      if (ing.originalData?.moisture !== undefined) {
        setMoistureOverride(name, ing.originalData.moisture)
      }
    }
    if (ing.cost) {
      deleteCostOverride(name)
    }
    if (ing.nutrition) {
      deleteNutritionOverride(name)
    }
  }, [unifiedIngredients, setMoistureOverride, deleteCostOverride, deleteNutritionOverride])

  // 수정된 항목 수 계산
  const modifiedCount = useMemo(() => {
    return unifiedIngredients.filter(ing =>
      ing.moistureOverridden ||
      ing.cost !== undefined ||
      ing.nutrition !== undefined ||
      ing.substitutions.length > 0 ||
      ing.isCustom
    ).length
  }, [unifiedIngredients])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-500" />
            {t('settings.ingredient.title')}
            <span className="text-sm font-normal text-gray-500">
              ({t('settings.ingredient.databaseCount', { dbCount: INGREDIENT_DATABASE.length, customCount: ingredient.customIngredients.length })})
            </span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('settings.ingredient.titleDesc')}
          </p>
        </div>
        <button
          onClick={() => setShowCustomForm(true)}
          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('settings.ingredient.addIngredient')}
        </button>
      </div>

      {/* 커스텀 재료 추가 폼 */}
      {showCustomForm && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">{t('settings.ingredient.newIngredient')}</h4>
            <button onClick={() => setShowCustomForm(false)} className="p-1 hover:bg-white rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              value={customForm.name}
              onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('settings.ingredient.ingredientName')}
              className="px-3 py-2 text-sm border rounded-lg"
            />
            <select
              value={customForm.category}
              onChange={(e) => setCustomForm(prev => ({
                ...prev,
                category: e.target.value as IngredientInfo['category']
              }))}
              className="px-3 py-2 text-sm border rounded-lg"
            >
              {INGREDIENT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {t(`settings.ingredient.categories.${cat.value}`)}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={customForm.moisture ?? ''}
              onChange={(e) => setCustomForm(prev => ({
                ...prev,
                moisture: parseFloat(e.target.value) || undefined
              }))}
              placeholder={t('settings.ingredient.moisturePercent')}
              className="px-3 py-2 text-sm border rounded-lg"
              min="0"
              max="100"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveCustom}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                <Save className="w-4 h-4" />
                {t('settings.ingredient.buttons.save')}
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                {t('settings.ingredient.buttons.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('settings.ingredient.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">{t('settings.ingredient.allCategories')}</option>
          {INGREDIENT_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {t(`settings.ingredient.categories.${cat.value}`)}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowOnlyModified(!showOnlyModified)}
          className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm ${
            showOnlyModified
              ? 'bg-amber-100 border-amber-300 text-amber-700'
              : 'hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          {t('settings.ingredient.modified')} ({modifiedCount})
        </button>
      </div>

      {/* 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-10"></th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 min-w-[140px]">{t('settings.ingredient.table.name')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-24">{t('settings.ingredient.table.category')}</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-20">
                  <span className="flex items-center justify-center gap-1">💧 {t('settings.ingredient.table.moisture')}</span>
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-28">
                  <span className="flex items-center justify-center gap-1">💰 {t('settings.ingredient.table.cost')}</span>
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-24">
                  <span className="flex items-center justify-center gap-1">🔥 {t('settings.ingredient.table.calories')}</span>
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-20">
                  <span className="flex items-center justify-center gap-1">🔄 {t('settings.ingredient.table.substitutes')}</span>
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-16">{t('settings.ingredient.table.edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredIngredients.map(ing => {
                const catInfo = getCategoryInfo(ing.category)
                const isExpanded = expandedRows.has(ing.name)
                const isEditing = editingRow === ing.name
                const hasModifications = ing.moistureOverridden || ing.cost || ing.nutrition || ing.isCustom

                return (
                  <React.Fragment key={ing.name}>
                  <tr
                    className={`
                      ${hasModifications ? 'bg-amber-50' : 'hover:bg-gray-50'}
                      ${isEditing ? 'bg-blue-50' : ''}
                    `}
                  >
                    {/* 확장 토글 */}
                    <td className="px-2 py-2 text-center">
                      {(ing.substitutions.length > 0 || ing.defaultSubstitutions.length > 0) && (
                        <button
                          onClick={() => toggleRowExpand(ing.name)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      )}
                    </td>

                    {/* 재료명 */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span>{catInfo.icon}</span>
                        <div>
                          <span className="font-medium text-gray-800">{getIngredientDisplayName(ing.name)}</span>
                          {ing.isCustom && (
                            <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              {t('settings.ingredient.custom')}
                            </span>
                          )}
                          {(() => {
                            const alias = getIngredientAlias(ing.name, ing.originalData?.aliases)
                            return alias && (
                              <div className="text-xs text-gray-400 truncate max-w-[120px]">
                                {alias}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </td>

                    {/* 카테고리 */}
                    <td className="px-3 py-2 text-gray-600">
                      <span className="text-xs">{t(`settings.ingredient.categories.${ing.category}`)}</span>
                    </td>

                    {/* 수분함량 */}
                    <td className="px-3 py-2 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.moisture ?? ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            moisture: parseFloat(e.target.value) || undefined
                          }))}
                          className="w-16 px-2 py-1 text-center border rounded text-xs font-mono"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <span className={`font-mono text-xs ${ing.moistureOverridden ? 'text-amber-600 font-medium' : ''}`}>
                          {ing.moisture !== undefined ? `${ing.moisture}%` : '-'}
                        </span>
                      )}
                    </td>

                    {/* 원가 */}
                    <td className="px-3 py-2 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.cost?.retailPrice ?? ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            cost: { ...prev.cost, retailPrice: parseFloat(e.target.value) || undefined }
                          }))}
                          placeholder="₩/kg"
                          className="w-20 px-2 py-1 text-center border rounded text-xs font-mono"
                        />
                      ) : ing.cost ? (
                        <span className="text-xs font-mono text-emerald-600">
                          ₩{(ing.cost.retailPrice || ing.cost.wholesalePrice || ing.cost.bulkPrice || 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    {/* 열량 */}
                    <td className="px-3 py-2 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.nutrition?.calories ?? ing.defaultNutrition?.calories ?? ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            nutrition: { ...prev.nutrition, calories: parseFloat(e.target.value) || undefined }
                          }))}
                          placeholder="kcal"
                          className="w-16 px-2 py-1 text-center border rounded text-xs font-mono"
                        />
                      ) : ing.nutrition?.calories ? (
                        <span className="text-xs font-mono text-purple-600" title={t('settings.ingredient.userDefined')}>
                          {ing.nutrition.calories}
                        </span>
                      ) : ing.defaultNutrition?.calories ? (
                        <span className="text-xs font-mono text-gray-600" title={t('settings.ingredient.defaultTooltip', { protein: ing.defaultNutrition.protein, carbs: ing.defaultNutrition.carbohydrates, fat: ing.defaultNutrition.fat })}>
                          {ing.defaultNutrition.calories}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    {/* 대체재료 수 */}
                    <td className="px-3 py-2 text-center">
                      {(() => {
                        const totalSubs = ing.substitutions.length + ing.defaultSubstitutions.length
                        if (totalSubs > 0) {
                          return (
                            <button
                              onClick={() => toggleRowExpand(ing.name)}
                              className={`px-2 py-0.5 rounded text-xs font-medium hover:opacity-80 ${
                                ing.substitutions.length > 0
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                              title={t('settings.ingredient.subsTooltip', { defaultCount: ing.defaultSubstitutions.length, userCount: ing.substitutions.length })}
                            >
                              {t('settings.ingredient.subsCount', { count: totalSubs })}
                            </button>
                          )
                        }
                        return (
                          <button
                            onClick={() => {
                              setSubForm({ original: ing.name, substitute: '', ratio: 1, notes: '' })
                              setShowSubForm(ing.name)
                            }}
                            className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs hover:bg-gray-200"
                          >
                            +
                          </button>
                        )
                      })()}
                    </td>

                    {/* 편집 버튼 */}
                    <td className="px-3 py-2 text-center">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            title={t('settings.ingredient.buttons.save')}
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            title={t('settings.ingredient.buttons.cancel')}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleStartEdit(ing.name)}
                            className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                            title={t('settings.ingredient.buttons.edit')}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          {hasModifications && (
                            <button
                              onClick={() => handleResetIngredient(ing.name)}
                              className="p-1 text-amber-500 hover:bg-amber-100 rounded"
                              title={t('settings.ingredient.buttons.reset')}
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          )}
                          {ing.isCustom && (
                            <button
                              onClick={() => {
                                if (confirm(t('settings.ingredient.alerts.deleteConfirm', { name: getIngredientDisplayName(ing.name) }))) {
                                  const custom = ingredient.customIngredients.find(c => c.name === ing.name)
                                  if (custom) deleteCustomIngredient(custom.id)
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-100 rounded"
                              title={t('settings.ingredient.buttons.delete')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* 확장된 대체재료 행 */}
                  {isExpanded && (ing.substitutions.length > 0 || ing.defaultSubstitutions.length > 0) && (
                    <tr className="bg-orange-50/50">
                      <td colSpan={8} className="px-6 py-2">
                        <div className="space-y-2">
                          {/* 기본 대체규칙 */}
                          {ing.defaultSubstitutions.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-xs text-blue-600 font-medium mr-2">📚 {t('settings.ingredient.defaultRules')}</span>
                              {ing.defaultSubstitutions.map((rule, idx) => (
                                <div
                                  key={`default-${idx}`}
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs"
                                  title={currentLang === 'en' ? translateBakingNote(rule.notes || '', 'en') : (rule.notes || '')}
                                >
                                  <ArrowRight className="w-3 h-3 text-blue-400" />
                                  <span className="font-medium text-blue-700">{getIngredientDisplayName(rule.substitute)}</span>
                                  <span className="text-blue-500 font-mono">×{rule.ratio}</span>
                                  {rule.qualityImpact && rule.qualityImpact !== 'none' && (
                                    <span className={`px-1 py-0.5 rounded text-[10px] ${
                                      rule.qualityImpact === 'minor' ? 'bg-green-100 text-green-600' :
                                      rule.qualityImpact === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                                      'bg-red-100 text-red-600'
                                    }`}>
                                      {t(`settings.ingredient.qualityImpact.${rule.qualityImpact}`)} {t('settings.ingredient.impact')}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 사용자 정의 대체규칙 */}
                          <div className="flex flex-wrap gap-2 items-center">
                            {ing.substitutions.length > 0 && (
                              <>
                                <span className="text-xs text-orange-600 font-medium mr-2">✏️ {t('settings.ingredient.userRules')}</span>
                                {ing.substitutions.map(sub => (
                                  <div
                                    key={sub.id}
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-orange-200 rounded text-xs"
                                  >
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium text-orange-700">{getIngredientDisplayName(sub.substitute)}</span>
                                    <span className="text-gray-500 font-mono">×{sub.ratio}</span>
                                    {sub.notes && <span className="text-gray-400 italic">({currentLang === 'en' ? translateBakingNote(sub.notes, 'en') : sub.notes})</span>}
                                    <button
                                      onClick={() => {
                                        if (confirm(t('settings.ingredient.alerts.deleteSubConfirm'))) {
                                          deleteSubstitution(sub.id)
                                        }
                                      }}
                                      className="ml-1 p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSubForm({ original: ing.name, substitute: '', ratio: 1, notes: '' })
                                setShowSubForm(ing.name)
                              }}
                              className="px-2 py-1 text-orange-600 hover:bg-orange-100 rounded text-xs"
                            >
                              {t('settings.ingredient.addSub')}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 대체재료 추가 폼 (플로팅) */}
      {showSubForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 w-96 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">
                🔄 {t('settings.ingredient.substitution.title', { name: getIngredientDisplayName(showSubForm) })}
              </h4>
              <button onClick={() => setShowSubForm(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{getIngredientDisplayName(showSubForm)}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={subForm.substitute}
                  onChange={(e) => setSubForm(prev => ({ ...prev, substitute: e.target.value }))}
                  placeholder={t('settings.ingredient.substitution.substitute')}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">{t('settings.ingredient.substitution.ratio')}</label>
                  <input
                    type="number"
                    value={subForm.ratio}
                    onChange={(e) => setSubForm(prev => ({ ...prev, ratio: parseFloat(e.target.value) || 1 }))}
                    step="0.05"
                    min="0.1"
                    max="3"
                    className="w-full px-3 py-2 text-sm border rounded-lg font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">{t('settings.ingredient.substitution.notes')}</label>
                  <input
                    type="text"
                    value={subForm.notes || ''}
                    onChange={(e) => setSubForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={t('settings.ingredient.substitution.notesPlaceholder')}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveSubstitution}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Save className="w-4 h-4" />
                {t('settings.ingredient.buttons.save')}
              </button>
              <button
                onClick={() => setShowSubForm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('settings.ingredient.buttons.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결과 없음 */}
      {filteredIngredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t('settings.ingredient.noResults')}</p>
        </div>
      )}

      {/* 하단 안내 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">💡 {t('settings.ingredient.tips.title')}</p>
        <ul className="space-y-0.5">
          <li>• {t('settings.ingredient.tips.edit')}</li>
          <li>• {t('settings.ingredient.tips.subs')}</li>
          <li>• {t('settings.ingredient.tips.filter')}</li>
          <li>• {t('settings.ingredient.tips.reset')}</li>
        </ul>
      </div>
    </div>
  )
}
