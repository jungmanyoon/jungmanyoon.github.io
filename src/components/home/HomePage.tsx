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
  TrendingUp,
  Lightbulb
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

// 난이도 색상 (정보 전달용 의미색: success/warning/brand/danger)
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-brand-100 text-brand-700',
  professional: 'bg-rose-100 text-rose-700'
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
    <div className="bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col h-full">
      {/* 히어로 섹션 - 컴팩트 */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('home.title')}</h1>
              <p className="text-brand-100 text-sm">{t('home.subtitle')}</p>
            </div>
          </div>

          {/* 통계 카드 - 인라인 컴팩트 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-brand-100 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                {t('home.savedRecipes')}
              </div>
              <div className="text-2xl font-bold">{stats.totalRecipes}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-brand-100 text-xs">
                <Wheat className="w-3.5 h-3.5" />
                {t('home.breadRecipes')}
              </div>
              <div className="text-2xl font-bold">{stats.categoryCount['bread'] || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-brand-100 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                {t('home.cakeRecipes')}
              </div>
              <div className="text-2xl font-bold">
                {(stats.categoryCount['cake'] || 0) + (stats.categoryCount['dessert'] || 0)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-brand-100 text-xs">
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
            <Sparkles className="w-4 h-4 text-brand-500" />
            {t('home.quickStart')}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleNewRecipe}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border-2 border-brand-200 hover:border-brand-400 hover:shadow transition-all group"
            >
              <div className="p-2 bg-brand-100 rounded-full group-hover:bg-brand-200 transition-colors">
                <Plus className="w-5 h-5 text-brand-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('home.newRecipe')}</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-brand-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                <BookOpen className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('home.recipeList')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-brand-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                <Calculator className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">{t('home.ddtCalculator')}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-brand-300 hover:shadow transition-all group"
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
                <Clock className="w-4 h-4 text-brand-500" />
                {t('home.recentRecipes')}
              </h2>
              <button
                onClick={() => setActiveTab('recipes')}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
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
                    className="text-left px-3 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-brand-300 hover:shadow transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-2xl flex-shrink-0">{categoryIcon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-brand-600 transition-colors">
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
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* 빈 상태 - 풍부한 콘텐츠 포함 (AdSense 정책 준수) */}
        {recipes.length === 0 && (
          <section className="py-6">
            {/* 시작 안내 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-3">
                <ChefHat className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {t('home.noRecipesYet')}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('home.createFirstRecipe')}
              </p>
              <button
                onClick={handleNewRecipe}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('home.createNew')}
              </button>
            </div>

            {/* 주요 기능 소개 - SEO & AdSense 콘텐츠 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                레시피북 주요 기능
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <strong className="text-gray-800">베이커스 퍼센트 계산</strong>
                    <p className="text-xs mt-0.5">모든 재료를 밀가루 중량 대비 백분율로 자동 변환합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <strong className="text-gray-800">DDT(반죽온도) 계산</strong>
                    <p className="text-xs mt-0.5">목표 반죽 온도에 맞는 물 온도를 자동 계산합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <strong className="text-gray-800">팬 크기 스케일링</strong>
                    <p className="text-xs mt-0.5">다양한 팬 크기에 맞춰 레시피를 자동 조정합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-600 text-xs font-bold">4</span>
                  </div>
                  <div>
                    <strong className="text-gray-800">제법 변환</strong>
                    <p className="text-xs mt-0.5">직접법, 스펀지법, 폴리시, 비가 등 제법 간 변환을 지원합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 베이킹 팁 - 추가 콘텐츠 */}
            <div className="bg-brand-50 rounded-lg p-4">
              <h4 className="font-semibold text-brand-800 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-brand-500" />
                베이킹 팁
              </h4>
              <p className="text-sm text-brand-700 leading-relaxed">
                베이커스 퍼센트는 제빵 업계 표준 레시피 표기법입니다. 밀가루를 100%로 기준 삼고
                다른 재료를 백분율로 표시하면, 어떤 양으로 만들어도 일관된 결과를 얻을 수 있습니다.
                레시피북은 이 계산을 자동으로 처리해 드립니다.
              </p>
            </div>
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
