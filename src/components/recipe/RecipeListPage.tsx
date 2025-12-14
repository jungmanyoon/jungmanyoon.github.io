import React, { useEffect, useCallback } from 'react'
import RecipeList from './RecipeList'
import SearchBar from '@components/common/SearchBar'
import FilterControls from './FilterControls'
import { useRecipeStore, selectFilteredRecipes } from '@stores/useRecipeStore'
import { useAppStore } from '@stores/useAppStore'
import { toast } from '@utils/toast'

const RecipeListPage: React.FC = () => {
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

  // 초기 진입 시 빈 경우 또는 출처 정보 없는 경우 샘플 레시피 주입
  useEffect(() => {
    // 레시피가 없으면 샘플 로드
    if (!recipes || recipes.length === 0) {
      resetToSampleRecipes()
      toast.success('샘플 레시피 10개를 불러왔습니다.')
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
        toast.success('새로운 샘플 레시피로 업데이트했습니다! (출처 정보 포함)')
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

  const handleNew = useCallback(() => {
    const newRecipe = {
      id: `recipe-${Date.now()}`,
      name: '새 레시피',
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
    setTimeout(() => setActiveTab('converter'), 0)
  }, [addRecipe, setCurrentRecipe, setActiveTab])

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
          placeholder="레시피 검색..."
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
    </div>
  )
}

export default RecipeListPage

