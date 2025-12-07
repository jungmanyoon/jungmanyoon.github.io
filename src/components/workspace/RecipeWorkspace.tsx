/**
 * RecipeWorkspace.tsx
 *
 * 통합 워크스페이스 - 한 화면에 모든 정보
 * - 왼쪽: 레시피 목록 사이드바
 * - 오른쪽: 선택된 레시피 상세 (재료 + 공정)
 */

import React from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useRecipeStore } from '@/stores/useRecipeStore'
import RecipeListSidebar from './RecipeListSidebar'
import RecipeDetailPanel from './RecipeDetailPanel'
import './RecipeWorkspace.css'

export default function RecipeWorkspace() {
  const { selectedRecipeId, selectRecipe } = useWorkspaceStore()
  const recipes = useRecipeStore((state) => state.recipes)

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId)

  const handleSelectRecipe = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId)
    selectRecipe(recipe || null)
  }

  return (
    <div className="recipe-workspace">
      {/* 왼쪽: 레시피 목록 */}
      <RecipeListSidebar
        recipes={recipes}
        selectedId={selectedRecipeId}
        onSelect={handleSelectRecipe}
      />

      {/* 오른쪽: 선택된 레시피 상세 */}
      {selectedRecipe ? (
        <RecipeDetailPanel recipe={selectedRecipe} />
      ) : (
        <div className="workspace-empty">
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h2>레시피를 선택하세요</h2>
            <p>왼쪽 목록에서 레시피를 클릭하면 상세 정보가 표시됩니다</p>
          </div>
        </div>
      )}
    </div>
  )
}
