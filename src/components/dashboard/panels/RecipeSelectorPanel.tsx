/**
 * RecipeSelectorPanel.tsx
 * 레시피 선택 사이드바 패널
 * 검색, 필터, 최근 레시피 목록 제공
 */

import React, { useState, useMemo } from 'react'
import { Search, Filter, Clock, Star, ChevronDown, X } from 'lucide-react'
import { useRecipeStore, selectFilteredRecipes } from '@/stores/useRecipeStore'
import type { Recipe } from '@/types/recipe.types'
import type { RecipeSelectorPanelProps } from '@/types/dashboard.types'

const RecipeSelectorPanel: React.FC<RecipeSelectorPanelProps> = ({
  isCollapsed,
  onToggle,
  onSelectRecipe,
  selectedRecipeId,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 스토어에서 레시피 가져오기
  const recipes = useRecipeStore((state) => state.recipes)

  // 검색 및 필터링된 레시피
  const filteredRecipes = useMemo(() => {
    let result = [...recipes]

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.nameKo?.toLowerCase().includes(query) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // 카테고리 필터
    if (selectedCategory) {
      result = result.filter((r) => r.category === selectedCategory)
    }

    // 최신순 정렬
    result.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt)
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt)
      return dateB.getTime() - dateA.getTime()
    })

    return result
  }, [recipes, searchQuery, selectedCategory])

  // 카테고리 목록
  const categories = useMemo(() => {
    const categorySet = new Set(recipes.map((r) => r.category))
    return Array.from(categorySet)
  }, [recipes])

  // 카테고리 이름 매핑
  const categoryNames: Record<string, string> = {
    bread: '🍞 식빵',
    pastry: '🥐 페이스트리',
    cake: '🎂 케이크',
    cookie: '🍪 쿠키',
    dessert: '🍰 디저트',
    confectionery: '🍬 제과',
    savory: '🥧 세이보리',
  }

  if (isCollapsed) return null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          📋 레시피 선택
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="레시피 검색..."
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Filter className="w-4 h-4" />
          필터
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                !selectedCategory
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  cat === selectedCategory
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
              >
                {categoryNames[cat] || cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recipe List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRecipes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">레시피가 없습니다</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-500 hover:underline text-sm"
              >
                검색 초기화
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredRecipes.map((recipe) => (
              <RecipeListItem
                key={recipe.id}
                recipe={recipe}
                isSelected={recipe.id === selectedRecipeId}
                onClick={() => onSelectRecipe(recipe)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          총 {recipes.length}개 레시피 중 {filteredRecipes.length}개 표시
        </p>
      </div>
    </div>
  )
}

// Recipe List Item 컴포넌트
interface RecipeListItemProps {
  recipe: Recipe
  isSelected: boolean
  onClick: () => void
}

const RecipeListItem: React.FC<RecipeListItemProps> = ({
  recipe,
  isSelected,
  onClick,
}) => {
  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    professional: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const difficultyNames: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
    professional: '전문가',
  }

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
            : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {recipe.name}
            </h3>
            {recipe.nameKo && recipe.nameKo !== recipe.name && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {recipe.nameKo}
              </p>
            )}
          </div>
          <span
            className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
              difficultyColors[recipe.difficulty] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {difficultyNames[recipe.difficulty] || recipe.difficulty}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {recipe.totalTime}분
          </span>
          <span>
            {recipe.yield?.quantity}
            {recipe.yield?.unit}
          </span>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
              >
                #{tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </button>
    </li>
  )
}

export default RecipeSelectorPanel
