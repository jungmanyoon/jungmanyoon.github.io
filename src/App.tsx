import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@stores/useAppStore'

// i18n 초기화 (앱 시작 시 로드)
import '@/i18n'
import Header from '@components/common/Header.jsx'
import Footer from '@components/common/Footer'
import PWAStatus from '@components/pwa/PWAStatus.jsx'
import PWAInstallPrompt from '@components/pwa/PWAInstallPrompt.jsx'
import { ToastContainer } from '@components/common/ToastContainer'
import { useRecipeStore } from '@stores/useRecipeStore'
import { useAutoSave } from '@/hooks/useAutoSave'

// 로딩 스피너 컴포넌트
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bread-600"></div>
        </div>
    )
}

// ============================================
// 개발환경: 직접 import (HMR 안정성)
// 프로덕션: lazy loading (번들 최적화)
// ============================================
const isDev = import.meta.env.DEV

// 개발환경용 직접 import
import HomePageDirect from '@components/home/HomePage'
import AdvancedDashboardDirect from '@components/dashboard/AdvancedDashboard'
import RecipeListDirect from '@components/recipe/RecipeListPage'
import RecipeEditorDirect from '@components/recipe/RecipeEditor.jsx'
import DDTCalculatorDirect from '@components/conversion/DDTCalculator'
import SettingsPageDirect from '@components/settings/SettingsPage'
import HelpDirect from '@components/help/Help.jsx'
// Legal 페이지
import { PrivacyPolicy, TermsOfService, UserGuide, Contact } from '@components/legal'

// 프로덕션용 lazy import (사용하지 않지만 번들 최적화를 위해 유지)
const HomePageLazy = lazy(() => import('@components/home/HomePage'))
const AdvancedDashboardLazy = lazy(() => import('@components/dashboard/AdvancedDashboard'))
const RecipeListLazy = lazy(() => import('@components/recipe/RecipeListPage'))
const RecipeEditorLazy = lazy(() => import('@components/recipe/RecipeEditor.jsx'))
const DDTCalculatorLazy = lazy(() => import('@components/conversion/DDTCalculator'))
const SettingsPageLazy = lazy(() => import('@components/settings/SettingsPage'))
const HelpLazy = lazy(() => import('@components/help/Help.jsx'))

// 환경에 따른 컴포넌트 선택
const HomePage = isDev ? HomePageDirect : HomePageLazy
const AdvancedDashboard = isDev ? AdvancedDashboardDirect : AdvancedDashboardLazy
const RecipeList = isDev ? RecipeListDirect : RecipeListLazy
const RecipeEditor = isDev ? RecipeEditorDirect : RecipeEditorLazy
const DDTCalculator = isDev ? DDTCalculatorDirect : DDTCalculatorLazy
const SettingsPage = isDev ? SettingsPageDirect : SettingsPageLazy
const Help = isDev ? HelpDirect : HelpLazy

// 유효한 탭 목록
const VALID_TABS = ['home', 'dashboard', 'workspace', 'recipes', 'editor', 'calculator', 'settings', 'help', 'privacy', 'terms', 'guide', 'contact']

// 페이지별 타이틀 매핑 (SEO 최적화)
const PAGE_TITLES: Record<string, string> = {
    home: 'seo.titles.home',
    dashboard: 'seo.titles.dashboard',
    workspace: 'seo.titles.dashboard',
    recipes: 'seo.titles.recipes',
    editor: 'seo.titles.editor',
    calculator: 'seo.titles.calculator',
    settings: 'seo.titles.settings',
    help: 'seo.titles.help',
    privacy: 'seo.titles.privacy',
    terms: 'seo.titles.terms',
    guide: 'seo.titles.guide',
    contact: 'seo.titles.contact'
}

const BASE_TITLE = '레시피북'

// 메인 앱 컴포넌트
function App() {
    const { t } = useTranslation()
    const { activeTab, setActiveTab } = useAppStore()
    const { currentRecipe, addRecipe, setCurrentRecipe } = useRecipeStore()

    // 로컬 폴더 자동 저장 (레시피/설정 변경 시 자동 동기화)
    useAutoSave()

    // 동적 페이지 타이틀 업데이트 (SEO 최적화)
    useEffect(() => {
        const titleKey = PAGE_TITLES[activeTab || 'home']
        const pageTitle = t(titleKey, { defaultValue: '' })
        document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE
    }, [activeTab, t])

    // 브라우저 히스토리 연동 (뒤로가기/앞으로가기 지원)
    useEffect(() => {
        // URL 해시에서 초기 탭 설정
        const initFromHash = () => {
            const hash = window.location.hash.slice(1) // '#' 제거
            if (hash && VALID_TABS.includes(hash)) {
                setActiveTab(hash as any, false) // 히스토리 푸시 안함
            } else if (!window.location.hash) {
                // 해시 없으면 현재 탭으로 초기화 (replaceState)
                const url = new URL(window.location.href)
                url.hash = activeTab || 'home'
                window.history.replaceState({ tab: activeTab || 'home' }, '', url.toString())
            }
        }

        // popstate 이벤트 핸들러 (뒤로가기/앞으로가기)
        const handlePopState = (event: PopStateEvent) => {
            const tab = event.state?.tab || window.location.hash.slice(1)
            if (tab && VALID_TABS.includes(tab)) {
                setActiveTab(tab as any, false) // 히스토리 푸시 안함
            } else {
                setActiveTab('home', false)
            }
        }

        initFromHash()
        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, []) // 최초 마운트시에만 실행

    // 수정 핸들러: 기존 레시피 업데이트
    const handleSaveEdit = (updated: any) => {
        if (currentRecipe?.id) {
            const saved = {
                ...currentRecipe,
                ...updated,
                updatedAt: new Date()
            }
            addRecipe(saved) // addRecipe는 같은 id면 업데이트됨
            setCurrentRecipe(null)
            setActiveTab('recipes')
        }
    }

    // 현재 탭에 해당하는 컴포넌트 렌더
    const renderActive = () => {
        switch (activeTab) {
            case 'home':
                return <HomePage />
            case 'dashboard':
            case 'workspace':
                return <AdvancedDashboard />
            case 'recipes':
                return <RecipeList />
            case 'editor':
                return (
                    <RecipeEditor
                        recipe={currentRecipe}
                        onSave={handleSaveEdit}
                        onCancel={() => {
                            setCurrentRecipe(null)
                            setActiveTab('recipes')
                        }}
                    />
                )
            case 'calculator':
                return <DDTCalculator recipe={currentRecipe as any} />
            case 'settings':
                return <SettingsPage onClose={() => setActiveTab('home')} />
            case 'help':
                return <Help />
            case 'privacy':
                return <PrivacyPolicy onBack={() => setActiveTab('home')} />
            case 'terms':
                return <TermsOfService onBack={() => setActiveTab('home')} />
            case 'guide':
                return <UserGuide onBack={() => setActiveTab('home')} onNavigate={(tab) => setActiveTab(tab as any)} />
            case 'contact':
                return <Contact onBack={() => setActiveTab('home')} />
            default:
                return <HomePage />
        }
    }

    const isFullWidth = activeTab === 'dashboard' || activeTab === 'workspace' || activeTab === 'home' || !activeTab;
    const showFooter = ['home', 'privacy', 'terms', 'guide', 'contact', 'help'].includes(activeTab || 'home');

    // 개발환경: Suspense 불필요 (직접 import 사용)
    // 프로덕션: Suspense 필요 (lazy loading 사용)
    const content = renderActive()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <PWAStatus />
            <PWAInstallPrompt />
            <ToastContainer />

            <main className={`flex-grow ${isFullWidth ? "" : "container mx-auto px-4 py-6"}`}>
                {isDev ? content : (
                    <Suspense fallback={<LoadingSpinner />}>
                        {content}
                    </Suspense>
                )}
            </main>

            {showFooter && <Footer />}
        </div>
    )
}

export default App
