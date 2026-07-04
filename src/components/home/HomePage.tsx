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

// 난이도 색상 (정보 전달용 의미색: 초급 emerald -> 중급 amber -> 상급 orange -> 전문가 rose)
// 4단계가 명확히 구분되도록 색상 단계를 벌림. 색만으로 구분되지 않게 텍스트 라벨은 항상 병기.
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-orange-100 text-orange-700',
  professional: 'bg-rose-100 text-rose-700'
}

export default function HomePage() {
  const { t } = useTranslation()
  const { recipes, setCurrentRecipe, addRecipe } = useRecipeStore()
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
    setActiveTab('view')
  }

  // 새 레시피 시작: 빈 레시피를 만들어 로드 (예시 자동주입 없이 빈 상태로 시작)
  // RecipeListPage.createNewRecipe와 동일 패턴 — 대시보드가 빈 재료 1행 + 안내배너로 시작
  const handleNewRecipe = () => {
    const newRecipe = {
      id: `recipe-${Date.now()}`,
      name: t('recipe.newRecipe'),
      description: '',
      category: 'bread',
      method: 'straight',
      servings: 1,
      ingredients: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    } as any
    addRecipe(newRecipe)
    setCurrentRecipe(newRecipe)
    setActiveTab('dashboard')
  }

  return (
    <div className="bg-surface-canvas flex flex-col h-full">
      {/* 히어로 섹션 - 화이트 베이스 + amber 액센트 (주황 그라디언트 워시 제거) */}
      <div className="border-b border-line">
        {/* 모바일은 패딩 축소(px-3 py-4), sm 이상에서 데스크톱 패딩(px-4 py-5) 보존 */}
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-5">
          <div className="flex items-center gap-3 mb-3">
            {/* 아이콘 배지: 브랜드색은 여기(작은 면적)에만 */}
            <div className="p-2 bg-brand-50 rounded-xl">
              <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink">{t('home.title')}</h1>
              <p className="text-ink-subtle text-xs sm:text-sm">{t('home.subtitle')}</p>
            </div>
          </div>

          {/* 통계 카드 - canvas 위 화이트 카드 + amber 아이콘, 뉴트럴 수치 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-surface-paper border border-line rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-ink-subtle text-xs">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                {t('home.savedRecipes')}
              </div>
              <div className="text-2xl font-bold text-ink">{stats.totalRecipes}</div>
            </div>
            <div className="bg-surface-paper border border-line rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-ink-subtle text-xs">
                <Wheat className="w-3.5 h-3.5 text-brand-500" />
                {t('home.breadRecipes')}
              </div>
              <div className="text-2xl font-bold text-ink">{stats.categoryCount['bread'] || 0}</div>
            </div>
            <div className="bg-surface-paper border border-line rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-ink-subtle text-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                {t('home.cakeRecipes')}
              </div>
              <div className="text-2xl font-bold text-ink">
                {(stats.categoryCount['cake'] || 0) + (stats.categoryCount['dessert'] || 0)}
              </div>
            </div>
            <div className="bg-surface-paper border border-line rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 text-ink-subtle text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                {t('home.avgIngredients')}
              </div>
              <div className="text-2xl font-bold text-ink">{stats.avgIngredients}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 본문: 모바일 px-3, sm 이상 기존 px-4 보존 */}
      <div className="container mx-auto px-3 py-4 sm:px-4 flex-1">
        {/* 빠른 시작 - 컴팩트 가로 버튼 */}
        <section className="mb-4">
          <h2 className="text-base font-bold text-ink mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-500" />
            {t('home.quickStart')}
          </h2>
          {/* 빠른 시작: 모바일 2열, sm 이상 기존 4열 보존 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={handleNewRecipe}
              className="flex flex-col items-center justify-center gap-1.5 min-h-[44px] py-3 px-2 bg-surface-paper rounded-lg shadow-sm border-2 border-brand-200 hover:border-brand-400 hover:shadow transition-all group"
            >
              <div className="p-2 bg-brand-100 rounded-full group-hover:bg-brand-200 transition-colors">
                <Plus className="w-5 h-5 text-brand-600" />
              </div>
              <span className="text-xs font-medium text-ink-muted">{t('home.newRecipe')}</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className="flex flex-col items-center justify-center gap-1.5 min-h-[44px] py-3 px-2 bg-surface-paper rounded-lg shadow-sm border border-line hover:border-brand-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-surface-muted rounded-full group-hover:bg-line transition-colors">
                <BookOpen className="w-5 h-5 text-ink-muted" />
              </div>
              <span className="text-xs font-medium text-ink-muted">{t('home.recipeList')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className="flex flex-col items-center justify-center gap-1.5 min-h-[44px] py-3 px-2 bg-surface-paper rounded-lg shadow-sm border border-line hover:border-brand-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-surface-muted rounded-full group-hover:bg-line transition-colors">
                <Calculator className="w-5 h-5 text-ink-muted" />
              </div>
              <span className="text-xs font-medium text-ink-muted">{t('home.ddtCalculator')}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center justify-center gap-1.5 min-h-[44px] py-3 px-2 bg-surface-paper rounded-lg shadow-sm border border-line hover:border-brand-300 hover:shadow transition-all group"
            >
              <div className="p-2 bg-surface-muted rounded-full group-hover:bg-line transition-colors">
                <Settings className="w-5 h-5 text-ink-muted" />
              </div>
              <span className="text-xs font-medium text-ink-muted">{t('nav.settings')}</span>
            </button>
          </div>
        </section>

        {/* 최근 레시피 - 컴팩트 그리드 */}
        {recentRecipes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-500" />
                {t('home.recentRecipes')}
              </h2>
              <button
                onClick={() => setActiveTab('recipes')}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5 min-h-[44px] px-1"
              >
                {t('home.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 최근 레시피: 모바일 1열, sm 2열, lg 이상 기존 3열 보존 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {recentRecipes.map(recipe => {
                const categoryIcon = CATEGORY_ICONS[recipe.category || 'bread'] || '📦'
                const difficultyKey = recipe.difficulty || 'beginner'
                const difficultyColor = DIFFICULTY_COLORS[difficultyKey] || DIFFICULTY_COLORS.beginner

                return (
                  <button
                    key={recipe.id}
                    onClick={() => handleRecipeClick(recipe)}
                    className="text-left min-h-[44px] px-3 py-2.5 bg-surface-paper rounded-lg shadow-sm border border-line hover:border-brand-300 hover:shadow transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-2xl flex-shrink-0" aria-hidden="true">{categoryIcon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-ink truncate group-hover:text-brand-600 transition-colors">
                          {getLocalizedRecipeName(recipe)}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${difficultyColor}`}>
                            {t(`filter.${difficultyKey}`)}
                          </span>
                          <span className="text-xs text-ink-subtle">
                            {recipe.ingredients?.length || 0}{t('home.ingredients')}
                          </span>
                        </div>
                        {recipe.source?.name && (
                          <p className="text-xs text-ink-subtle truncate">
                            {t('home.source')}: {recipe.source.name}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink-disabled group-hover:text-brand-500 transition-colors flex-shrink-0" />
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
              <h3 className="text-lg font-semibold text-ink mb-1">
                {t('home.noRecipesYet')}
              </h3>
              <p className="text-sm text-ink-subtle mb-4">
                {t('home.createFirstRecipe')}
              </p>
              <button
                onClick={handleNewRecipe}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('home.createNew')}
              </button>
            </div>

            {/* 주요 기능 소개 - SEO & AdSense 콘텐츠 */}
            <div className="bg-surface-paper rounded-lg shadow-sm border border-line p-4 mb-4">
              <h4 className="font-semibold text-ink mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                레시피북 주요 기능
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-ink-muted">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-surface-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-ink-muted text-xs font-bold">1</span>
                  </div>
                  <div>
                    <strong className="text-ink">베이커스 퍼센트 계산</strong>
                    <p className="text-xs mt-0.5">모든 재료를 밀가루 중량 대비 백분율로 자동 변환합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-surface-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-ink-muted text-xs font-bold">2</span>
                  </div>
                  <div>
                    <strong className="text-ink">DDT(반죽온도) 계산</strong>
                    <p className="text-xs mt-0.5">목표 반죽 온도에 맞는 물 온도를 자동 계산합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-surface-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-ink-muted text-xs font-bold">3</span>
                  </div>
                  <div>
                    <strong className="text-ink">팬 크기 스케일링</strong>
                    <p className="text-xs mt-0.5">다양한 팬 크기에 맞춰 레시피를 자동 조정합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-surface-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-ink-muted text-xs font-bold">4</span>
                  </div>
                  <div>
                    <strong className="text-ink">제법 변환</strong>
                    <p className="text-xs mt-0.5">직접법, 스펀지법, 폴리시, 비가 등 제법 간 변환을 지원합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 베이킹 팁 - 추가 콘텐츠 */}
            <div className="bg-surface-muted rounded-lg p-4">
              <h4 className="font-semibold text-ink mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-brand-500" />
                베이킹 팁
              </h4>
              <p className="text-sm text-ink-muted leading-relaxed">
                베이커스 퍼센트는 제빵 업계 표준 레시피 표기법입니다. 밀가루를 100%로 기준 삼고
                다른 재료를 백분율로 표시하면, 어떤 양으로 만들어도 일관된 결과를 얻을 수 있습니다.
                레시피북은 이 계산을 자동으로 처리해 드립니다.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* 미니 푸터 */}
      <footer className="bg-surface-muted border-t border-line-soft py-2">
        <div className="container mx-auto px-4 text-center text-xs text-ink-disabled">
          {t('home.version')} v1.0 · {t('home.tagline')}
        </div>
      </footer>
    </div>
  )
}
