/**
 * HomePage - 앱 메인 홈 화면
 *
 * 기능:
 * - 저장된 레시피 요약 통계
 * - 최근 레시피 빠른 접근
 * - 주요 기능 바로가기
 * - 빠른 시작 가이드
 */

import React, { useMemo } from 'react'
import { useRecipeStore } from '@/stores/useRecipeStore'
import { useAppStore } from '@/stores/useAppStore'
import {
  Plus,
  BookOpen,
  Calculator,
  Settings,
  Clock,
  ChefHat,
  Sparkles,
  ArrowRight,
  Wheat,
  Scale,
  Flame,
  TrendingUp
} from 'lucide-react'

// 카테고리별 아이콘
const CATEGORY_ICONS: Record<string, string> = {
  bread: '🍞',
  cake: '🎂',
  pastry: '🥐',
  cookie: '🍪',
  dessert: '🍰',
  confectionery: '🍬',
  savory: '🥧'
}

// 난이도 라벨
const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: '초급', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '중급', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: '고급', color: 'bg-orange-100 text-orange-700' },
  professional: { label: '전문가', color: 'bg-red-100 text-red-700' }
}

export default function HomePage() {
  const { recipes, setCurrentRecipe } = useRecipeStore()
  const { setActiveTab } = useAppStore()

  // 통계 계산
  const stats = useMemo(() => {
    const categoryCount: Record<string, number> = {}
    let totalIngredients = 0

    recipes.forEach(recipe => {
      const cat = recipe.category || 'other'
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
      totalIngredients += recipe.ingredients?.length || 0
    })

    return {
      totalRecipes: recipes.length,
      categoryCount,
      avgIngredients: recipes.length > 0
        ? Math.round(totalIngredients / recipes.length)
        : 0
    }
  }, [recipes])

  // 최근 레시피 (최대 6개)
  const recentRecipes = useMemo(() => {
    return [...recipes]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 6)
  }, [recipes])

  // 레시피 선택 핸들러
  const handleRecipeClick = (recipe: any) => {
    setCurrentRecipe(recipe)
    setActiveTab('dashboard')
  }

  // 새 레시피 시작
  const handleNewRecipe = () => {
    setCurrentRecipe(null)
    setActiveTab('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 히어로 섹션 */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <ChefHat className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">제과제빵 레시피 변환기</h1>
              <p className="text-amber-100 mt-1">
                전문가 수준의 레시피 스케일링과 제법 변환
              </p>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-200 text-sm">
                <BookOpen className="w-4 h-4" />
                저장된 레시피
              </div>
              <div className="text-3xl font-bold mt-1">{stats.totalRecipes}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-200 text-sm">
                <Wheat className="w-4 h-4" />
                빵 레시피
              </div>
              <div className="text-3xl font-bold mt-1">{stats.categoryCount['bread'] || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-200 text-sm">
                <Sparkles className="w-4 h-4" />
                케이크/디저트
              </div>
              <div className="text-3xl font-bold mt-1">
                {(stats.categoryCount['cake'] || 0) + (stats.categoryCount['dessert'] || 0)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-200 text-sm">
                <TrendingUp className="w-4 h-4" />
                평균 재료 수
              </div>
              <div className="text-3xl font-bold mt-1">{stats.avgIngredients}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 빠른 시작 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            빠른 시작
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleNewRecipe}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-amber-100 rounded-full group-hover:bg-amber-200 transition-colors">
                <Plus className="w-6 h-6 text-amber-600" />
              </div>
              <span className="font-medium text-gray-700">새 레시피</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">레시피 목록</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">DDT 계산기</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <span className="font-medium text-gray-700">설정</span>
            </button>
          </div>
        </section>

        {/* 최근 레시피 */}
        {recentRecipes.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                최근 레시피
              </h2>
              <button
                onClick={() => setActiveTab('recipes')}
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                전체 보기 <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentRecipes.map(recipe => {
                const categoryIcon = CATEGORY_ICONS[recipe.category || 'bread'] || '📦'
                const difficulty = DIFFICULTY_LABELS[recipe.difficulty || 'beginner']

                return (
                  <button
                    key={recipe.id}
                    onClick={() => handleRecipeClick(recipe)}
                    className="text-left p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{categoryIcon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate group-hover:text-amber-600 transition-colors">
                          {recipe.nameKo || recipe.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${difficulty.color}`}>
                            {difficulty.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {recipe.ingredients?.length || 0}개 재료
                          </span>
                        </div>
                        {recipe.source?.name && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            출처: {recipe.source.name}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* 주요 기능 소개 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">팬 기반 스케일링</h3>
              </div>
              <p className="text-sm text-gray-600">
                팬 크기와 비용적 계산으로 정확한 레시피 배율 자동 계산
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Wheat className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-800">제법 변환</h3>
              </div>
              <p className="text-sm text-gray-600">
                스트레이트, 중종법, 탕종법, 폴리쉬 등 다양한 제법 간 자동 변환
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">DDT 계산기</h3>
              </div>
              <p className="text-sm text-gray-600">
                목표 반죽 온도 달성을 위한 물 온도 자동 계산
              </p>
            </div>
          </div>
        </section>

        {/* 빈 상태 */}
        {recipes.length === 0 && (
          <section className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
              <ChefHat className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              아직 저장된 레시피가 없어요
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 레시피를 만들어 보세요!
            </p>
            <button
              onClick={handleNewRecipe}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              새 레시피 만들기
            </button>
          </section>
        )}
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>무료 제과제빵 레시피 변환기 v1.0</p>
          <p className="mt-1">베이커스 퍼센트 기반 전문가용 계산 도구</p>
        </div>
      </footer>
    </div>
  )
}
