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
          if (state.filters.productType && state.filters.productType.length > 0) count++  // 🆕 제품 타입 필터 카운트
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
        version: 3,
        partialize: (state) => ({
          recipes: state.recipes,
          filters: state.filters,
          sortBy: state.sortBy,
          draftRecipe: state.draftRecipe  // 작성 중인 레시피 자동 저장
        }),
        migrate: (persistedState: any, version: number) => {
          let state = { ...persistedState }

          // v1 -> v2: draftRecipe 필드 추가
          if (version === 0 || version === 1) {
            state.draftRecipe = state.draftRecipe || null
          }

          // v2 -> v3: 제과 샘플 레시피 자동 추가
          // version 3인 경우에도 제과 레시피가 없으면 추가
          const existingRecipes = state.recipes || []
          const hasPastryRecipes = existingRecipes.some((r: any) => r.productType === 'pastry')

          if (!hasPastryRecipes) {
            const pastryRecipes = sampleRecipes.filter((r: any) => r.productType === 'pastry')
            state.recipes = [...existingRecipes, ...pastryRecipes]
          }

          return state
        },
        // 복원 시 createdAt/updatedAt를 Date로 정규화 (persist는 문자열로 직렬화함)
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.recipes)) {
            state.recipes = state.recipes.map((recipe: any) => ({
              ...recipe,
              createdAt: recipe.createdAt ? new Date(recipe.createdAt) : recipe.createdAt,
              updatedAt: recipe.updatedAt ? new Date(recipe.updatedAt) : recipe.updatedAt
            }))
          }
        }
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

  // 제품 타입 필터 (제빵/제과)
  if (state.filters.productType && state.filters.productType.length > 0) {
    filtered = filtered.filter(r =>
      state.filters.productType!.includes((r as any).productType || 'bread')
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
      (r.name ?? '').toLowerCase().includes(query) ||
      r.nameKo?.toLowerCase().includes(query) ||
      (r.tags ?? []).some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 태그 필터
  if (state.filters.tags && state.filters.tags.length > 0) {
    filtered = filtered.filter(r =>
      state.filters.tags!.some(tag => (r.tags ?? []).includes(tag))
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
        // persist 복원 후 문자열일 수 있으므로 방어적으로 Date 변환
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'updatedAt':
        // persist 복원 후 문자열일 수 있으므로 방어적으로 Date 변환
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'totalTime':
        return a.totalTime - b.totalTime
      default:
        return 0
    }
  })

  return filtered
}