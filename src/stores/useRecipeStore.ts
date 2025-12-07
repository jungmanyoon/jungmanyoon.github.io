/**
 * Zustand 레시피 스토어
 * 레시피 데이터 관리 및 CRUD 작업
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Recipe } from '@types/recipe.types'
import { RecipeStore, RecipeFilters, RecipeSortOption } from '@types/store.types'
import sampleRecipes from '@data/sampleRecipes.js'

const initialFilters: RecipeFilters = {
  category: [],
  difficulty: [],
  searchQuery: '',
  tags: [],
  timeRange: undefined
}

export const useRecipeStore = create<RecipeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 상태
        recipes: [],
        currentRecipe: null,
        draftRecipe: null,
        filters: initialFilters,
        sortBy: 'name',
        selectedRecipeIds: [],
        isEditing: false,

        // 액션
        addRecipe: (recipe: Recipe) => {
          set((state) => ({
            recipes: [...state.recipes, recipe],
            currentRecipe: recipe
          }))
        },

        updateRecipe: (id: string, updates: Partial<Recipe>) => {
          set((state) => ({
            recipes: state.recipes.map((recipe) =>
              recipe.id === id 
                ? { ...recipe, ...updates, updatedAt: new Date() }
                : recipe
            ),
            currentRecipe: state.currentRecipe?.id === id
              ? { ...state.currentRecipe, ...updates, updatedAt: new Date() }
              : state.currentRecipe
          }))
        },

        deleteRecipe: (id: string) => {
          set((state) => ({
            recipes: state.recipes.filter((recipe) => recipe.id !== id),
            currentRecipe: state.currentRecipe?.id === id 
              ? null 
              : state.currentRecipe,
            selectedRecipeIds: state.selectedRecipeIds.filter(
              (recipeId) => recipeId !== id
            )
          }))
        },

        setCurrentRecipe: (recipe: Recipe | null) => {
          set({ currentRecipe: recipe })
        },

        saveDraft: (draft: Partial<Recipe>) => {
          set({ draftRecipe: draft })
        },

        clearDraft: () => {
          set({ draftRecipe: null })
        },

        importRecipes: async (recipes: Recipe[]) => {
          return new Promise((resolve) => {
            set((state) => {
              // 중복 체크
              const existingIds = new Set(state.recipes.map(r => r.id))
              const newRecipes = recipes.filter(r => !existingIds.has(r.id))
              
              return {
                recipes: [...state.recipes, ...newRecipes]
              }
            })
            resolve()
          })
        },

        exportRecipes: async (ids?: string[]) => {
          const state = get()
          const recipesToExport = ids
            ? state.recipes.filter(r => ids.includes(r.id))
            : state.recipes

          const data = JSON.stringify(recipesToExport, null, 2)
          const blob = new Blob([data], { type: 'application/json' })

          return blob
        },

        setFilters: (filters: RecipeFilters) => {
          set({ filters })
        },

        setSortBy: (sortBy: RecipeSortOption) => {
          set({ sortBy })
        },

        clearFilters: () => {
          set({ filters: initialFilters })
        },

        getActiveFilterCount: () => {
          const state = get()
          let count = 0
          if (state.filters.difficulty && state.filters.difficulty.length > 0) count++
          if (state.filters.timeRange) count++
          if (state.filters.tags && state.filters.tags.length > 0) count++
          if (state.filters.category && state.filters.category.length > 0) count++
          return count
        },

        getAvailableTags: () => {
          const state = get()
          const allTags = new Set<string>()
          state.recipes.forEach(recipe => {
            if (recipe.tags && Array.isArray(recipe.tags)) {
              recipe.tags.forEach(tag => allTags.add(tag))
            }
          })
          return Array.from(allTags).sort()
        },

        resetToSampleRecipes: () => {
          const newRecipes = sampleRecipes.map((recipe: any, idx: number) => ({
            ...recipe,
            id: recipe.id || `sample-${Date.now()}-${idx}`,
            createdAt: new Date(recipe.createdAt || Date.now()),
            updatedAt: new Date(recipe.updatedAt || Date.now())
          }))
          set({
            recipes: newRecipes,
            currentRecipe: newRecipes[0] || null,
            selectedRecipeIds: []
          })
        }
      }),
      {
        name: 'recipe-store',
        partialize: (state) => ({
          recipes: state.recipes,
          filters: state.filters,
          sortBy: state.sortBy
        })
      }
    ),
    {
      name: 'RecipeStore'
    }
  )
)

// 선택자 (Selectors)
export const selectFilteredRecipes = (state: RecipeStore) => {
  let filtered = [...state.recipes]

  // 카테고리 필터
  if (state.filters.category && state.filters.category.length > 0) {
    filtered = filtered.filter(r => 
      state.filters.category!.includes(r.category)
    )
  }

  // 난이도 필터
  if (state.filters.difficulty && state.filters.difficulty.length > 0) {
    filtered = filtered.filter(r => 
      state.filters.difficulty!.includes(r.difficulty)
    )
  }

  // 검색어 필터
  if (state.filters.searchQuery) {
    const query = state.filters.searchQuery.toLowerCase()
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(query) ||
      r.nameKo?.toLowerCase().includes(query) ||
      r.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 태그 필터
  if (state.filters.tags && state.filters.tags.length > 0) {
    filtered = filtered.filter(r => 
      state.filters.tags!.some(tag => r.tags.includes(tag))
    )
  }

  // 시간 범위 필터
  if (state.filters.timeRange) {
    filtered = filtered.filter(r => 
      r.totalTime >= state.filters.timeRange!.min &&
      r.totalTime <= state.filters.timeRange!.max
    )
  }

  // 정렬
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'difficulty':
        const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'professional']
        return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
      case 'createdAt':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'updatedAt':
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      case 'totalTime':
        return a.totalTime - b.totalTime
      default:
        return 0
    }
  })

  return filtered
}