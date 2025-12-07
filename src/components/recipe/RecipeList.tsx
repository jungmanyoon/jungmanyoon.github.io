import React, { useState, useMemo, useCallback, memo } from 'react'
import Button from '../common/Button'
import RecipeCard from './RecipeCard'
import { Recipe } from '@types/recipe.types'

interface RecipeListProps {
  recipes: Recipe[]
  onSelect: (recipe: Recipe) => void
  onDelete: (id: string) => void
  onEdit: (recipe: Recipe) => void
  onNew: () => void
  onRestore?: (recipe: Recipe) => void
}

interface CategoryData {
  name: string
  recipes: Recipe[]
}

// 카테고리 탭 버튼을 별도 컴포넌트로 분리하여 최적화
const CategoryTab = memo<{
  categoryKey: string
  categoryName: string
  count: number
  isSelected: boolean
  onClick: () => void
}>(({ categoryKey, categoryName, count, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
      isSelected
        ? 'bg-bread-500 text-white'
        : 'bg-bread-100 text-bread-700 hover:bg-bread-200'
    }`}
  >
    {categoryName} ({count})
  </button>
))

CategoryTab.displayName = 'CategoryTab'

// RecipeList 컴포넌트 최적화
const RecipeList = memo<RecipeListProps>(({ recipes, onSelect, onDelete, onEdit, onNew, onRestore }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // 카테고리별로 레시피 그룹화 및 정렬 - useMemo로 최적화
  const categorizedRecipes = useMemo<Record<string, CategoryData>>(() => {
    const categories: Record<string, CategoryData> = {
      bread: { name: '빵', recipes: [] },
      cake: { name: '케이크', recipes: [] },
      cookie: { name: '쿠키', recipes: [] },
      pastry: { name: '페이스트리', recipes: [] }
    }
    
    // 카테고리별로 분류
    recipes.forEach(recipe => {
      if (categories[recipe.category]) {
        categories[recipe.category].recipes.push(recipe)
      }
    })
    
    // 각 카테고리 내에서 이름순 정렬
    Object.values(categories).forEach(category => {
      category.recipes.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    })
    
    return categories
  }, [recipes])
  
  // 표시할 레시피 목록 - useMemo로 최적화
  const displayRecipes = useMemo(() => {
    if (selectedCategory === 'all') {
      return [...recipes].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    }
    return categorizedRecipes[selectedCategory]?.recipes || []
  }, [recipes, selectedCategory, categorizedRecipes])
  
  // 각 카테고리의 레시피 개수 - useMemo로 최적화
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recipes.length }
    Object.entries(categorizedRecipes).forEach(([key, category]) => {
      counts[key] = category.recipes.length
    })
    return counts
  }, [categorizedRecipes, recipes.length])

  // 카테고리 선택 핸들러 - useCallback으로 최적화
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  // 레시피 선택 핸들러 - useCallback으로 최적화
  const handleRecipeSelect = useCallback((recipe: Recipe) => {
    onSelect(recipe)
  }, [onSelect])

  // 레시피 삭제 핸들러 - useCallback으로 최적화
  const handleRecipeDelete = useCallback((id: string) => {
    onDelete(id)
  }, [onDelete])

  // 레시피 수정 핸들러 - useCallback으로 최적화
  const handleRecipeEdit = useCallback((recipe: Recipe) => {
    onEdit(recipe)
  }, [onEdit])

  // 레시피 복원 핸들러 - useCallback으로 최적화
  const handleRecipeRestore = useCallback((recipe: Recipe) => {
    onRestore?.(recipe)
  }, [onRestore])

  // 새 레시피 생성 핸들러 - useCallback으로 최적화
  const handleNewRecipe = useCallback(() => {
    onNew()
  }, [onNew])

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-bread-700">내 레시피</h2>
        <Button size="small" onClick={handleNewRecipe}>새 레시피</Button>
      </div>

      {/* 카테고리 탭 - 최적화된 컴포넌트 사용 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <CategoryTab
          categoryKey="all"
          categoryName="전체"
          count={categoryCounts.all}
          isSelected={selectedCategory === 'all'}
          onClick={() => handleCategorySelect('all')}
        />
        {Object.entries(categorizedRecipes).map(([key, category]) => (
          <CategoryTab
            key={key}
            categoryKey={key}
            categoryName={category.name}
            count={categoryCounts[key]}
            isSelected={selectedCategory === key}
            onClick={() => handleCategorySelect(key)}
          />
        ))}
      </div>

      {displayRecipes.length === 0 ? (
        <div className="text-center py-8 bg-bread-50 rounded-lg">
          <p className="text-gray-600 mb-3 text-sm">
            {selectedCategory === 'all' 
              ? '아직 저장된 레시피가 없습니다.'
              : `${categorizedRecipes[selectedCategory]?.name} 레시피가 없습니다.`}
          </p>
          <Button size="small" onClick={handleNewRecipe}>
            {selectedCategory === 'all' 
              ? '첫 레시피 만들기' 
              : `${categorizedRecipes[selectedCategory]?.name} 레시피 만들기`}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={() => handleRecipeSelect(recipe)}
              onDelete={() => handleRecipeDelete(recipe.id)}
              onEdit={() => handleRecipeEdit(recipe)}
              onRestore={onRestore ? () => handleRecipeRestore(recipe) : undefined}
              compact={true}
            />
          ))}
        </div>
      )}
    </div>
  )
})

RecipeList.displayName = 'RecipeList'

export default RecipeList