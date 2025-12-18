/**
 * RecipeListSidebar.tsx
 *
 * 레시피 목록 사이드바
 * - 빠른 레시피 전환
 * - 검색 기능
 * - 카테고리 필터
 */

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Recipe } from '@/types/recipe.types'
import './RecipeListSidebar.css'

interface RecipeListSidebarProps {
  recipes: Recipe[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function RecipeListSidebar({
  recipes,
  selectedId,
  onSelect,
}: RecipeListSidebarProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 카테고리 목록
  const categories = useMemo(() => {
    const cats = new Set(recipes.map((r) => r.category).filter(Boolean))
    return ['all', ...Array.from(cats)]
  }, [recipes])

  // 필터링된 레시피
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        !searchTerm ||
        recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.nameKo?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || recipe.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [recipes, searchTerm, selectedCategory])

  return (
    <aside className="recipe-list-sidebar">
      {/* 헤더 */}
      <div className="sidebar-header">
        <h2>{t('components.recipeListSidebar.title')}</h2>
        <span className="recipe-count">{t('components.recipeListSidebar.count', { count: filteredRecipes.length })}</span>
      </div>

      {/* 검색 */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder={t('components.recipeListSidebar.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 카테고리 필터 */}
      <div className="sidebar-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-button ${
              selectedCategory === cat ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? t('components.recipeListSidebar.allCategory') : cat}
          </button>
        ))}
      </div>

      {/* 레시피 목록 */}
      <div className="sidebar-list">
        {filteredRecipes.length === 0 ? (
          <div className="empty-list">
            <p>{t('components.recipeListSidebar.noRecipes')}</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              className={`recipe-item ${
                selectedId === recipe.id ? 'selected' : ''
              }`}
              onClick={() => onSelect(recipe.id)}
            >
              <div className="recipe-item-content">
                <div className="recipe-name">{recipe.nameKo || recipe.name}</div>
                <div className="recipe-meta">
                  {recipe.category && (
                    <span className="meta-category">{recipe.category}</span>
                  )}
                  {recipe.totalTime && (
                    <span className="meta-time">{recipe.totalTime}{t('components.recipeListSidebar.timeUnit')}</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
