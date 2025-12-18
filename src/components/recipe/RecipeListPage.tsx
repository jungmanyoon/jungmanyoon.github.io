import React, { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import RecipeList from './RecipeList'
import SearchBar from '@components/common/SearchBar'
import FilterControls from './FilterControls'
import AdModal from '@components/ads/AdModal'
import { useRecipeStore, selectFilteredRecipes } from '@stores/useRecipeStore'
import { useAppStore } from '@stores/useAppStore'
import { toast } from '@utils/toast'

// 무료 레시피 개수 제한
const FREE_RECIPE_LIMIT = 10

const RecipeListPage: React.FC = () => {
  const { t } = useTranslation()
  const {
    recipes,
    filters,
    sortBy,
    addRecipe,
    deleteRecipe,
    setCurrentRecipe,
    setFilters,
    setSortBy,
    clearFilters,
    getAvailableTags,
    resetToSampleRecipes
  } = useRecipeStore()
  const filteredRecipes = useRecipeStore(selectFilteredRecipes)
  const availableTags = useRecipeStore(getAvailableTags)
  const { setActiveTab } = useAppStore()

  // 광고 모달 상태
  const [showAdModal, setShowAdModal] = useState(false)

  // 초기 진입 시 빈 경우 또는 출처 정보 없는 경우 샘플 레시피 주입
  useEffect(() => {
    // 레시피가 없으면 샘플 로드
    if (!recipes || recipes.length === 0) {
      resetToSampleRecipes()
      toast.success(t('message.sampleRecipesLoaded'))
      return
    }

    // 기존 레시피에 출처(source) 정보가 없으면 샘플로 교체
    // (이전 버전 데이터 마이그레이션)
    const hasRecipesWithoutSource = recipes.some(r => !r.source)
    if (hasRecipesWithoutSource && recipes.length > 0) {
      // 모든 레시피에 출처가 없으면 샘플로 교체
      const allWithoutSource = recipes.every(r => !r.source)
      if (allWithoutSource) {
        resetToSampleRecipes()
        toast.success(t('message.sampleRecipesUpdated'))
      }
    }
  }, [])

  const handleSelect = useCallback((recipe: any) => {
    setCurrentRecipe(recipe)
    // 대시보드로 이동 (converter 탭 삭제됨)
    setTimeout(() => setActiveTab('dashboard'), 0)
  }, [setCurrentRecipe, setActiveTab])

  const handleDelete = useCallback((id: string) => {
    deleteRecipe(id)
  }, [deleteRecipe])

  const handleRestore = useCallback((recipe: any) => {
    addRecipe(recipe)
  }, [addRecipe])

  const handleEdit = useCallback((recipe: any) => {
    setCurrentRecipe(recipe)
    setTimeout(() => setActiveTab('editor'), 0)
  }, [setCurrentRecipe, setActiveTab])

  // 실제 새 레시피 생성 함수
  const createNewRecipe = useCallback(() => {
    const newRecipe = {
      id: `recipe-${Date.now()}`,
      name: t('recipe.newRecipe'),
      description: '',
      category: 'bread',
      method: 'straight',
      servings: 1,
      ingredients: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    } as any
    addRecipe(newRecipe)
    setCurrentRecipe(newRecipe)
    setTimeout(() => setActiveTab('dashboard'), 0)
  }, [addRecipe, setCurrentRecipe, setActiveTab, t])

  // 새 레시피 버튼 핸들러 (광고 체크)
  const handleNew = useCallback(() => {
    // 무료 레시피 개수 초과 시 광고 모달 표시
    if (recipes.length >= FREE_RECIPE_LIMIT) {
      setShowAdModal(true)
    } else {
      createNewRecipe()
    }
  }, [recipes.length, createNewRecipe])

  // 광고 완료 후 레시피 생성
  const handleAdComplete = useCallback(() => {
    setShowAdModal(false)
    createNewRecipe()
    toast.success(t('message.adThanks'))
  }, [createNewRecipe, t])

  const handleSearchChange = useCallback((searchQuery: string) => {
    setFilters({ ...filters, searchQuery })
  }, [filters, setFilters])

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [setFilters])

  const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
  }, [setSortBy])

  const handleClearFilters = useCallback(() => {
    clearFilters()
  }, [clearFilters])

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter Controls */}
      <div className="flex-none space-y-3 p-4 bg-bread-50 border-b border-bread-200">
        <SearchBar
          value={filters.searchQuery || ''}
          onChange={handleSearchChange}
          placeholder={t('recipeList.searchPlaceholder')}
        />
        <FilterControls
          filters={filters}
          sortBy={sortBy}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          availableTags={availableTags}
        />
      </div>

      {/* Recipe List */}
      <div className="flex-1 overflow-auto">
        <RecipeList
          recipes={filteredRecipes}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onNew={handleNew}
          onRestore={handleRestore}
        />
      </div>

      {/* 광고 모달 (10개 초과 시) */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
      />
    </div>
  )
}

export default RecipeListPage

