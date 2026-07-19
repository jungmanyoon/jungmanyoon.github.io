import { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'
import RecipeCard from './RecipeCard'
import { Recipe } from '@/types/recipe.types'
import { Plus, BookOpen } from 'lucide-react'

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
        ? 'bg-brand-500 text-white'
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
      {/* 헤더 툴바: 제목 + 카테고리 칩(주요 필터) + 새 레시피.
          데스크톱은 한 줄([제목][칩 flex-1][버튼]), 모바일은 [제목 .. 버튼] / [칩] 두 줄로
          자동 재배치(order + w-full)해 칩이 눌리지 않게 한다. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4">
        <h2 className="order-1 flex-none text-xl font-bold text-ink">{t('components.recipeList.myRecipes')}</h2>
        <Button
          onClick={handleNewRecipe}
          className="order-2 sm:order-3 flex-none flex items-center gap-2 px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          {t('components.recipeList.newRecipe')}
        </Button>
        {/* 카테고리 탭 - 주요 필터. 모바일: 전체 폭 별도 줄 / 데스크톱: 가운데 flex-1 */}
        <div className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 min-w-0 flex gap-2 overflow-x-auto pb-1">
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

      {displayRecipes.length === 0 ? (
        <div className="text-center py-16 mt-4 bg-surface-muted rounded-lg">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-ink-disabled" strokeWidth={1.5} />
          <p className="text-ink-muted mb-4 text-sm">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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