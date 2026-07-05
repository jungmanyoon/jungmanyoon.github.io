import { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'
import RecipeCard from './RecipeCard'
import { Recipe } from '@/types/recipe.types'
import { Plus } from 'lucide-react'

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
}>(({ categoryName, count, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
      isSelected
        ? 'bg-bread-500 text-white'
        : 'bg-surface-muted text-ink-muted hover:bg-line'
    }`}
  >
    {categoryName} ({count})
  </button>
))

CategoryTab.displayName = 'CategoryTab'

// RecipeList 컴포넌트 최적화
const RecipeList = memo<RecipeListProps>(({ recipes, onSelect, onDelete, onEdit, onNew, onRestore }) => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 카테고리 이름 가져오기
  const getCategoryName = useCallback((key: string) => {
    return t(`components.recipeList.categories.${key}`)
  }, [t])

  // 카테고리별로 레시피 그룹화 및 정렬 - useMemo로 최적화
  const categorizedRecipes = useMemo<Record<string, CategoryData>>(() => {
    const categories: Record<string, CategoryData> = {
      bread: { name: getCategoryName('bread'), recipes: [] },
      cake: { name: getCategoryName('cake'), recipes: [] },
      cookie: { name: getCategoryName('cookie'), recipes: [] },
      pastry: { name: getCategoryName('pastry'), recipes: [] }
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
    <div className="max-w-7xl mx-auto px-4">
      {/* 헤더 툴바: (좌) 제목 + 카테고리 칩(주요 필터) / (우) 새 레시피 액션.
          세 줄로 흩어지지 않게 한 툴바로 묶고, 좁은 화면에선 자연스럽게 줄바꿈. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h2 className="text-xl font-bold text-ink flex-none">{t('components.recipeList.myRecipes')}</h2>
          {/* 카테고리 탭 - 주요 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-1 min-w-0">
            <CategoryTab
              categoryKey="all"
              categoryName={t('components.recipeList.allCategory')}
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
        </div>
        <Button
          onClick={handleNewRecipe}
          className="flex items-center gap-2 px-4 py-2 flex-none"
        >
          <Plus className="w-4 h-4" />
          {t('components.recipeList.newRecipe')}
        </Button>
      </div>

      {displayRecipes.length === 0 ? (
        <div className="text-center py-8 bg-surface-muted rounded-lg">
          <p className="text-ink-muted mb-3 text-sm">
            {selectedCategory === 'all'
              ? t('components.recipeList.noRecipes')
              : t('components.recipeList.noCategoryRecipes', { category: categorizedRecipes[selectedCategory]?.name })}
          </p>
          <Button
            onClick={handleNewRecipe}
            className="inline-flex items-center gap-2 px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            {selectedCategory === 'all'
              ? t('components.recipeList.createFirstRecipe')
              : t('components.recipeList.createCategoryRecipe', { category: categorizedRecipes[selectedCategory]?.name })}
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