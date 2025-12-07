import { lazy, Suspense } from 'react'
import { useAppStore } from '@stores/useAppStore'
import Header from '@components/common/Header.jsx'
import PWAStatus from '@components/pwa/PWAStatus.jsx'
import PWAInstallPrompt from '@components/pwa/PWAInstallPrompt.jsx'
import { ToastContainer } from '@components/common/ToastContainer'
import { useRecipeStore } from '@stores/useRecipeStore'

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
import AdvancedDashboardDirect from '@components/dashboard/AdvancedDashboard'
import RecipeListDirect from '@components/recipe/RecipeListPage'
import RecipeEditorDirect from '@components/recipe/RecipeEditor.jsx'
import DDTCalculatorDirect from '@components/conversion/DDTCalculator'
import ConversionConsoleDirect from '@components/conversion/ConversionConsole'
import MethodSelectorDirect from '@components/conversion/MethodSelector.jsx'
import PanSelectorDirect from '@components/conversion/PanSelector.jsx'
import QuickPanCalculatorDirect from '@components/calculator/QuickPanCalculator.jsx'
import RecipeExcelViewDirect from '@components/calculator/RecipeExcelView'
import SettingsDirect from '@components/settings/Settings.jsx'
import HelpDirect from '@components/help/Help.jsx'

// 프로덕션용 lazy import (사용하지 않지만 번들 최적화를 위해 유지)
const AdvancedDashboardLazy = lazy(() => import('@components/dashboard/AdvancedDashboard'))
const RecipeListLazy = lazy(() => import('@components/recipe/RecipeListPage'))
const RecipeEditorLazy = lazy(() => import('@components/recipe/RecipeEditor.jsx'))
const DDTCalculatorLazy = lazy(() => import('@components/conversion/DDTCalculator'))
const ConversionConsoleLazy = lazy(() => import('@components/conversion/ConversionConsole'))
const MethodSelectorLazy = lazy(() => import('@components/conversion/MethodSelector.jsx'))
const PanSelectorLazy = lazy(() => import('@components/conversion/PanSelector.jsx'))
const QuickPanCalculatorLazy = lazy(() => import('@components/calculator/QuickPanCalculator.jsx'))
const RecipeExcelViewLazy = lazy(() => import('@components/calculator/RecipeExcelView'))
const SettingsLazy = lazy(() => import('@components/settings/Settings.jsx'))
const HelpLazy = lazy(() => import('@components/help/Help.jsx'))

// 환경에 따른 컴포넌트 선택
const AdvancedDashboard = isDev ? AdvancedDashboardDirect : AdvancedDashboardLazy
const RecipeList = isDev ? RecipeListDirect : RecipeListLazy
const RecipeEditor = isDev ? RecipeEditorDirect : RecipeEditorLazy
const DDTCalculator = isDev ? DDTCalculatorDirect : DDTCalculatorLazy
const ConversionConsole = isDev ? ConversionConsoleDirect : ConversionConsoleLazy
const MethodSelector = isDev ? MethodSelectorDirect : MethodSelectorLazy
const PanSelector = isDev ? PanSelectorDirect : PanSelectorLazy
const QuickPanCalculator = isDev ? QuickPanCalculatorDirect : QuickPanCalculatorLazy
const RecipeExcelView = isDev ? RecipeExcelViewDirect : RecipeExcelViewLazy
const Settings = isDev ? SettingsDirect : SettingsLazy
const Help = isDev ? HelpDirect : HelpLazy

// 메인 앱 컴포넌트
function App() {
    const { activeTab, setActiveTab } = useAppStore()
    const { currentRecipe, addRecipe, setCurrentRecipe } = useRecipeStore()

    // 저장 핸들러: 변환 레시피를 새 레시피로 저장
    const handleSaveConverted = (converted: any) => {
        const saved = {
            id: `recipe-${Date.now()}`,
            name: converted?.name || (currentRecipe?.name ? `${currentRecipe.name} (변환)` : '변환 레시피'),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...converted
        }
        addRecipe(saved)
        setCurrentRecipe(saved)
        setActiveTab('recipes')
    }

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
            case 'dashboard':
            case 'workspace':
                return <AdvancedDashboard />
            case 'recipes':
                return <RecipeList />
            case 'converter':
                return (
                    <ConversionConsole
                        recipe={currentRecipe}
                        onUpdate={handleSaveConverted}
                        onBack={() => setActiveTab('recipes')}
                    />
                )
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
            case 'pan-calculator':
                return <QuickPanCalculator />
            case 'excel-calculator':
                return <RecipeExcelView />
            case 'pan-converter':
                return <PanSelector />
            case 'method-converter':
                return <MethodSelector />
            case 'settings':
                return <Settings />
            case 'help':
                return <Help />
            default:
                return <AdvancedDashboard />
        }
    }

    const isDashboard = activeTab === 'dashboard' || activeTab === 'workspace' || !activeTab;

    // 개발환경: Suspense 불필요 (직접 import 사용)
    // 프로덕션: Suspense 필요 (lazy loading 사용)
    const content = renderActive()

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <PWAStatus />
            <PWAInstallPrompt />
            <ToastContainer />

            <main className={isDashboard ? "" : "container mx-auto px-4 py-6"}>
                {isDev ? content : (
                    <Suspense fallback={<LoadingSpinner />}>
                        {content}
                    </Suspense>
                )}
            </main>
        </div>
    )
}

export default App
