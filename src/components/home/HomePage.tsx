/**
 * HomePage - 앱 메인 홈 화면 (컴팩트 버전)
 *
 * 기능:
 * - 저장된 레시피 요약 통계
 * - 최근 레시피 빠른 접근
 * - 주요 기능 바로가기
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecipeStore } from '@/stores/useRecipeStore'
import { useAppStore } from '@/stores/useAppStore'
import { useLocalization } from '@/hooks/useLocalization'
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

// 난이도 색상
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-orange-100 text-orange-700',
  professional: 'bg-red-100 text-red-700'
}

export default function HomePage() {
  const { t } = useTranslation()
  const { recipes, setCurrentRecipe } = useRecipeStore()
  const { setActiveTab } = useAppStore()
  const { getLocalizedRecipeName } = useLocalization()

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
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col h-full">
      {/* 히어로 섹션 - 컴팩트 */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('home.title')}</h1>
              <p className="text-amber-100 text-sm">{t('home.subtitle')}</p>
            </div>
          </div>

          {/* 통계 카드 - 인라인 컴팩트 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-amber-200 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                {t('home.savedRecipes')}
              </div>
              <div className="text-2xl font-bold">{stats.totalRecipes}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-amber-200 text-xs">
                <Wheat className="w-3.5 h-3.5" />
                {t('home.breadRecipes')}
              </div>
              <div className="text-2xl font-bold">{stats.categoryCount['bread'] || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-amber-200 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                {t('home.cakeRecipes')}
              </div>
              <div className="text-2xl font-bold">
                {(stats.categoryCount['cake'] || 0) + (stats.categoryCount['dessert'] || 0)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-amber-200 text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
                {t('home.avgIngredients')}
              </div>
              <div className="text-2xl font-bold">{stats.avgIngredients}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 flex-1">
        {/* 빠른 시작 - 컴팩트 가로 버튼 */}
        <section className="mb-4">
          <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t('home.quickStart')}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleNewRecipe}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border-2 border-amber-200 hover:border-amber-400 hover:shadow transition-all group"
            >
              <div className="p-2 bg-amber-100 rounded-full group-hover:bg-amber-200 transition-colors">
                <Plus className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('home.newRecipe')}</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('home.recipeList')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('home.ddtCalculator')}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('nav.settings')}</span>
            </button>
          </div>
        </section>

        {/* 최근 레시피 - 컴팩트 그리드 */}
        {recentRecipes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                {t('home.recentRecipes')}
              </h2>
              <button
                onClick={() => setActiveTab('recipes')}
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
              >
                {t('home.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {recentRecipes.map(recipe => {
                const categoryIcon = CATEGORY_ICONS[recipe.category || 'bread'] || '📦'
                const difficultyKey = recipe.difficulty || 'beginner'
                const difficultyColor = DIFFICULTY_COLORS[difficultyKey] || DIFFICULTY_COLORS.beginner

                return (
                  <button
                    key={recipe.id}
                    onClick={() => handleRecipeClick(recipe)}
                    className="text-left px-3 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-2xl flex-shrink-0">{categoryIcon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-amber-600 transition-colors">
                          {getLocalizedRecipeName(recipe)}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${difficultyColor}`}>
                            {t(`filter.${difficultyKey}`)}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {recipe.ingredients?.length || 0}{t('home.ingredients')}
                          </span>
                        </div>
                        {recipe.source?.name && (
                          <p className="text-[10px] text-gray-400 truncate">
                            {t('home.source')}: {recipe.source.name}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* 빈 상태 */}
        {recipes.length === 0 && (
          <section className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-3">
              <ChefHat className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {t('home.noRecipesYet')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('home.createFirstRecipe')}
            </p>
            <button
              onClick={handleNewRecipe}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('home.createNew')}
            </button>
          </section>
        )}
      </div>

      {/* 미니 푸터 */}
      <footer className="bg-gray-50 border-t border-gray-100 py-2">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          {t('home.version')} v1.0 · {t('home.tagline')}
        </div>
      </footer>
    </div>
  )
}
