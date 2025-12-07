import React, { useEffect, useCallback, useRef } from 'react'
import RecipeList from './RecipeList'
import SearchBar from '@components/common/SearchBar'
import FilterControls from './FilterControls'
import { useRecipeStore, selectFilteredRecipes } from '@stores/useRecipeStore'
import { useAppStore } from '@stores/useAppStore'
import sampleRecipes from '@data/sampleRecipes.js'
import { Download, Upload, RefreshCw } from 'lucide-react'
import { toast } from '@utils/toast'
import Button from '@components/common/Button'

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
    importRecipes,
    exportRecipes,
    resetToSampleRecipes
  } = useRecipeStore()
  const filteredRecipes = useRecipeStore(selectFilteredRecipes)
  const availableTags = useRecipeStore(getAvailableTags)
  const { setActiveTab } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Export recipes handler
  const handleExport = useCallback(async () => {
    try {
      const blob = await exportRecipes()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recipes-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`${recipes.length}개의 레시피를 성공적으로 내보냈습니다.`)
    } catch (error) {
      toast.error('레시피 내보내기에 실패했습니다.')
      console.error('Export error:', error)
    }
  }, [exportRecipes, recipes.length])

  // Import recipes handler
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedRecipes = JSON.parse(text)

      // Validate imported data
      if (!Array.isArray(importedRecipes)) {
        throw new Error('잘못된 파일 형식입니다.')
      }

      // Convert date strings to Date objects
      const recipesWithDates = importedRecipes.map((recipe: any) => ({
        ...recipe,
        createdAt: recipe.createdAt ? new Date(recipe.createdAt) : new Date(),
        updatedAt: recipe.updatedAt ? new Date(recipe.updatedAt) : new Date()
      }))

      await importRecipes(recipesWithDates)

      toast.success(`${importedRecipes.length}개의 레시피를 성공적으로 가져왔습니다.`, {
        duration: 4000
      })
    } catch (error) {
      toast.error('레시피 가져오기에 실패했습니다. 파일 형식을 확인해주세요.', {
        duration: 5000
      })
      console.error('Import error:', error)
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [importRecipes])

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // 샘플 레시피 다시 불러오기
  const handleResetToSamples = useCallback(() => {
    if (window.confirm('기존 레시피를 모두 삭제하고 샘플 레시피 10개로 교체합니다. 계속하시겠습니까?')) {
      resetToSampleRecipes()
      toast.success('샘플 레시피 10개를 불러왔습니다! (빵준서 5개 + 호야TV 5개)')
    }
  }, [resetToSampleRecipes])

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter Controls */}
      <div className="flex-none space-y-3 p-4 bg-bread-50 border-b border-bread-200">
        {/* Import/Export/Reset Buttons */}
        <div className="flex justify-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            aria-label="레시피 파일 선택"
          />
          <Button
            variant="secondary"
            onClick={handleResetToSamples}
            className="flex items-center gap-2"
            title="샘플 레시피 10개로 초기화 (빵준서 5개 + 호야TV 5개)"
          >
            <RefreshCw className="w-4 h-4" />
            샘플 불러오기
          </Button>
          <Button
            variant="secondary"
            onClick={handleImportClick}
            className="flex items-center gap-2"
            title="JSON 파일에서 레시피 가져오기"
          >
            <Upload className="w-4 h-4" />
            가져오기
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={recipes.length === 0}
            className="flex items-center gap-2"
            title="모든 레시피를 JSON 파일로 내보내기"
          >
            <Download className="w-4 h-4" />
            내보내기
          </Button>
        </div>

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

