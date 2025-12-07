/**
 * DashboardLayout.tsx
 * 통합 대시보드 메인 레이아웃
 *
 * 구조:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                        Header                               │
 * ├──────────┬─────────────────────────────────┬───────────────┤
 * │ Selector │       ComparisonWorkspace       │    Tools      │
 * │  Panel   │   (Original vs Converted)       │    Panel      │
 * │          │                                 │               │
 * └──────────┴─────────────────────────────────┴───────────────┘
 * │                       ActionBar                             │
 * └─────────────────────────────────────────────────────────────┘
 */

import React, { useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { useDashboardStore, selectHasChanges } from '@/stores/useDashboardStore'
import { useRecipeStore } from '@/stores/useRecipeStore'
import RecipeSelectorPanel from './panels/RecipeSelectorPanel'
import ComparisonWorkspace from './panels/ComparisonWorkspace'
import ConversionToolbar from './panels/ConversionToolbar'
import ActionBar from './actions/ActionBar'
import type { DashboardLayoutProps } from '@/types/dashboard.types'

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ initialRecipeId }) => {
  // 스토어 상태
  const {
    sourceRecipe,
    convertedRecipe,
    conversionDiffs,
    conversionSummary,
    conversionConfig,
    selectorPanelState,
    toolsPanelState,
    activeToolTab,
    isCalculating,
    selectSourceRecipe,
    toggleSelectorPanel,
    toggleToolsPanel,
    setActiveToolTab,
    undo,
    redo,
    canUndo,
    canRedo,
    resetConversion,
    saveAsNewRecipe,
  } = useDashboardStore()

  const hasChanges = useDashboardStore(selectHasChanges)
  const recipes = useRecipeStore((state) => state.recipes)
  const addRecipe = useRecipeStore((state) => state.addRecipe)

  // 초기 레시피 로드
  useEffect(() => {
    if (initialRecipeId) {
      const recipe = recipes.find((r) => r.id === initialRecipeId)
      if (recipe) {
        selectSourceRecipe(recipe)
      }
    }
  }, [initialRecipeId, recipes, selectSourceRecipe])

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 's':
            e.preventDefault()
            if (hasChanges) {
              handleSave()
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, hasChanges])

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!convertedRecipe) return
    try {
      const newId = await saveAsNewRecipe()
      // TODO: 성공 토스트 표시
      console.log('Recipe saved:', newId)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }, [convertedRecipe, saveAsNewRecipe])

  // 내보내기 핸들러
  const handleExport = useCallback(() => {
    if (!convertedRecipe) return
    const data = JSON.stringify(convertedRecipe, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${convertedRecipe.name}_converted.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [convertedRecipe])

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectorPanel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            aria-label="Toggle recipe panel"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            🍞 RecipeBook
          </h1>
          {sourceRecipe && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / {sourceRecipe.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCalculating && (
            <span className="text-sm text-blue-500 animate-pulse">
              계산 중...
            </span>
          )}
          {conversionSummary && conversionSummary.activeConversions.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              {conversionSummary.activeConversions.map((conv, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {conv.icon} {conv.labelKo}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Recipe Selector */}
        <aside
          className={`
            ${selectorPanelState === 'collapsed' ? 'w-0' : 'w-72'}
            transition-all duration-300 ease-in-out
            bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            overflow-hidden flex-shrink-0
            hidden lg:block
          `}
        >
          {selectorPanelState === 'expanded' && (
            <RecipeSelectorPanel
              isCollapsed={false}
              onToggle={toggleSelectorPanel}
              onSelectRecipe={selectSourceRecipe}
              selectedRecipeId={sourceRecipe?.id || null}
            />
          )}
        </aside>

        {/* Toggle Button - Left */}
        <button
          onClick={toggleSelectorPanel}
          className="hidden lg:flex items-center justify-center w-5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-r border-gray-200 dark:border-gray-600"
          aria-label="Toggle selector panel"
        >
          {selectorPanelState === 'collapsed' ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Center - Comparison Workspace */}
        <main className="flex-1 overflow-auto">
          <ComparisonWorkspace
            sourceRecipe={sourceRecipe}
            convertedRecipe={convertedRecipe}
            diffs={conversionDiffs}
            summary={conversionSummary}
            isCalculating={isCalculating}
          />
        </main>

        {/* Toggle Button - Right */}
        <button
          onClick={toggleToolsPanel}
          className="hidden lg:flex items-center justify-center w-5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-l border-gray-200 dark:border-gray-600"
          aria-label="Toggle tools panel"
        >
          {toolsPanelState === 'collapsed' ? (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Right Panel - Conversion Tools */}
        <aside
          className={`
            ${toolsPanelState === 'collapsed' ? 'w-0' : 'w-80'}
            transition-all duration-300 ease-in-out
            bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
            overflow-hidden flex-shrink-0
            hidden lg:block
          `}
        >
          {toolsPanelState === 'expanded' && (
            <ConversionToolbar
              isCollapsed={false}
              onToggle={toggleToolsPanel}
              config={conversionConfig}
              sourceRecipe={sourceRecipe}
              activeTab={activeToolTab}
              onTabChange={setActiveToolTab}
            />
          )}
        </aside>
      </div>

      {/* Bottom Action Bar */}
      <ActionBar
        canUndo={canUndo()}
        canRedo={canRedo()}
        hasChanges={hasChanges}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onReset={resetConversion}
        onExport={handleExport}
      />

      {/* Mobile Bottom Sheet (for Tools) */}
      <div className="lg:hidden">
        {/* TODO: Mobile bottom sheet implementation */}
      </div>
    </div>
  )
}

export default DashboardLayout
