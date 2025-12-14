/**
 * DashboardCompact.tsx
 * 컴팩트 대시보드 - 데스크탑/노트북용
 *
 * 설계 원칙:
 * - 한 화면에 모든 정보 (스크롤 없음)
 * - 키보드 단축키 지원 (밀가루 묻은 손으로도 Space, Enter)
 * - 큰 클릭 영역 (부정확한 클릭도 OK)
 * - 실시간 변환 결과 피드백
 *
 * 단축키:
 * - ← → : 레시피 이동
 * - 1,2,3 : 탭 전환 (팬/제법/수량)
 * - Space : 쿠킹모드 토글
 * - Ctrl+S : 저장
 * - Esc : 초기화/닫기
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Scale,
  Layers,
  Hash,
  RotateCcw,
  Save,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Keyboard,
} from 'lucide-react'
import { useDashboardStore, selectHasChanges } from '@/stores/useDashboardStore'
import { useRecipeStore } from '@/stores/useRecipeStore'
import type { Recipe, PanConfig, BreadMethod } from '@/types/recipe.types'

// 팬 프리셋
const PAN_PRESETS: { id: string; name: string; volume: number; icon: string }[] = [
  { id: 'round-15', name: '원형 15cm', volume: 884, icon: '🥧' },
  { id: 'round-18', name: '원형 18cm', volume: 1272, icon: '🥧' },
  { id: 'round-21', name: '원형 21cm', volume: 1732, icon: '🥧' },
  { id: 'loaf-1', name: '식빵틀 1근', volume: 1926, icon: '🍞' },
  { id: 'loaf-1.5', name: '식빵틀 1.5근', volume: 2625, icon: '🍞' },
  { id: 'pullman', name: '풀먼틀', volume: 2500, icon: '🍞' },
]

// 제법 프리셋
const METHOD_PRESETS: { id: BreadMethod; name: string; icon: string }[] = [
  { id: 'straight', name: '스트레이트', icon: '⚡' },
  { id: 'sponge', name: '중종법', icon: '🧪' },
  { id: 'poolish', name: '폴리쉬', icon: '💧' },
  { id: 'biga', name: '비가', icon: '🇮🇹' },
  { id: 'tangzhong', name: '탕종법', icon: '🍜' },
  { id: 'autolyse', name: '오토리즈', icon: '⏳' },
  { id: 'overnight', name: '저온숙성', icon: '❄️' },
  { id: 'sourdough', name: '사워도우', icon: '🫧' },
]

// 수량 프리셋
const QUANTITY_PRESETS = [0.5, 1, 1.5, 2, 3, 5]

const DashboardCompact: React.FC = () => {
  // Store
  const {
    sourceRecipe,
    convertedRecipe,
    conversionConfig,
    conversionSummary,
    selectSourceRecipe,
    updatePanConfig,
    updateMethodConfig,
    updateQuantity,
    resetConversion,
    saveAsNewRecipe,
  } = useDashboardStore()

  const hasChanges = useDashboardStore(selectHasChanges)
  const recipes = useRecipeStore((state) => state.recipes)

  // Local state
  const [activeTab, setActiveTab] = useState<'pan' | 'method' | 'quantity'>('pan')
  const [recipeIndex, setRecipeIndex] = useState(0)
  const [isCookingMode, setIsCookingMode] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 쿠킹모드에서는 별도 처리
      if (isCookingMode) return

      // Ctrl+S: 저장
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges) handleSave()
        return
      }

      // Esc: 초기화
      if (e.key === 'Escape') {
        resetConversion()
        return
      }

      // Space: 쿠킹모드 토글
      if (e.key === ' ' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        setIsCookingMode(true)
        return
      }

      // 화살표: 레시피 이동
      if (e.key === 'ArrowLeft') {
        handlePrevRecipe()
        return
      }
      if (e.key === 'ArrowRight') {
        handleNextRecipe()
        return
      }

      // 숫자키: 탭 전환
      if (e.key === '1') setActiveTab('pan')
      if (e.key === '2') setActiveTab('method')
      if (e.key === '3') setActiveTab('quantity')

      // ?: 단축키 도움말
      if (e.key === '?') setShowShortcuts(!showShortcuts)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCookingMode, hasChanges, showShortcuts])

  // 레시피 네비게이션
  const handlePrevRecipe = useCallback(() => {
    const newIndex = recipeIndex > 0 ? recipeIndex - 1 : recipes.length - 1
    setRecipeIndex(newIndex)
    if (recipes[newIndex]) {
      selectSourceRecipe(recipes[newIndex])
    }
  }, [recipeIndex, recipes, selectSourceRecipe])

  const handleNextRecipe = useCallback(() => {
    const newIndex = recipeIndex < recipes.length - 1 ? recipeIndex + 1 : 0
    setRecipeIndex(newIndex)
    if (recipes[newIndex]) {
      selectSourceRecipe(recipes[newIndex])
    }
  }, [recipeIndex, recipes, selectSourceRecipe])

  // 초기 레시피 로드
  useEffect(() => {
    if (recipes.length > 0 && !sourceRecipe) {
      selectSourceRecipe(recipes[0])
    }
  }, [recipes, sourceRecipe, selectSourceRecipe])

  // 팬 선택 핸들러
  const handlePanSelect = (pan: typeof PAN_PRESETS[0]) => {
    updatePanConfig({
      id: pan.id,
      name: pan.name,
      type: pan.id.includes('round') ? 'round' : 'loaf',
      volume: pan.volume,
      dimensions: {},
      material: 'aluminum',
      fillRatio: 0.7,
    } as PanConfig)
  }

  // 제법 선택 핸들러
  const handleMethodSelect = (method: BreadMethod) => {
    updateMethodConfig(method)
  }

  // 수량 선택 핸들러
  const handleQuantitySelect = (qty: number) => {
    updateQuantity(qty)
  }

  // 저장 핸들러
  const handleSave = async () => {
    if (hasChanges) {
      await saveAsNewRecipe()
    }
  }

  // 스케일 퍼센트 계산
  const scalePercent = Math.round((conversionConfig.panScaleFactor * conversionConfig.batchMultiplier - 1) * 100)

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gray-50 dark:bg-gray-900 p-2 gap-2">
      {/* ===== 상단: 레시피 선택 + 빠른 액션 ===== */}
      <div className="flex items-center gap-2 h-12 flex-shrink-0">
        {/* 레시피 네비게이션 */}
        <button
          onClick={handlePrevRecipe}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 h-10 px-4 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium truncate">
            {sourceRecipe?.name || '레시피 선택'}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            ({recipeIndex + 1}/{recipes.length})
          </span>
        </div>

        <button
          onClick={handleNextRecipe}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 쿠킹모드 토글 */}
        <button
          onClick={() => setIsCookingMode(!isCookingMode)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
            isCookingMode
              ? 'bg-green-500 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}
          title="쿠킹모드"
        >
          {isCookingMode ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* ===== 중앙: 메인 컨텐츠 ===== */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* 왼쪽: 변환 도구 */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* 탭 버튼 */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'pan' as const, icon: Scale, label: '팬' },
              { id: 'method' as const, icon: Layers, label: '제법' },
              { id: 'quantity' as const, icon: Hash, label: '수량' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="flex-1 p-2 overflow-y-auto">
            {activeTab === 'pan' && (
              <div className="grid grid-cols-2 gap-1.5">
                {PAN_PRESETS.map((pan) => (
                  <button
                    key={pan.id}
                    onClick={() => handlePanSelect(pan)}
                    className={`p-2 rounded-lg text-left transition-all active:scale-95 ${
                      conversionConfig.targetPan?.id === pan.id
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-lg">{pan.icon}</span>
                    <p className="text-xs font-medium mt-0.5 truncate">{pan.name}</p>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'method' && (
              <div className="grid grid-cols-2 gap-1.5">
                {METHOD_PRESETS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    disabled={sourceRecipe?.method?.method === method.id}
                    className={`p-2 rounded-lg text-left transition-all active:scale-95 ${
                      conversionConfig.targetMethod === method.id
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500'
                        : sourceRecipe?.method?.method === method.id
                        ? 'bg-gray-100 dark:bg-gray-800 opacity-50'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <p className="text-xs font-medium mt-0.5">{method.name}</p>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'quantity' && (
              <div className="grid grid-cols-3 gap-1.5">
                {QUANTITY_PRESETS.map((qty) => (
                  <button
                    key={qty}
                    onClick={() => handleQuantitySelect(qty)}
                    className={`py-3 rounded-lg text-center transition-all active:scale-95 ${
                      conversionConfig.batchMultiplier === qty
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-lg font-bold">×{qty}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 비교 뷰 */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* 변환 요약 바 */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">
                {scalePercent >= 0 ? '+' : ''}{scalePercent}%
              </span>
              {conversionSummary && (
                <span className="text-xs opacity-80">
                  {conversionSummary.totalOriginalWeight.toLocaleString()}g →{' '}
                  {conversionSummary.totalConvertedWeight.toLocaleString()}g
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {conversionConfig.panScaleFactor !== 1 && (
                <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded">🍳 팬</span>
              )}
              {conversionConfig.targetMethod && (
                <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded">📊 제법</span>
              )}
              {conversionConfig.batchMultiplier !== 1 && (
                <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded">×{conversionConfig.batchMultiplier}</span>
              )}
            </div>
          </div>

          {/* 재료 비교 테이블 */}
          <div className="flex-1 overflow-y-auto">
            {!sourceRecipe ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>← 레시피를 선택하세요</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-1.5 px-2 font-medium">재료</th>
                    <th className="text-right py-1.5 px-2 font-medium w-20">원본</th>
                    <th className="text-right py-1.5 px-2 font-medium w-20">변환</th>
                    <th className="text-right py-1.5 px-2 font-medium w-12">차이</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sourceRecipe.ingredients.map((ing, idx) => {
                    const converted = convertedRecipe?.ingredients[idx]
                    const diff = converted ? Math.round((converted.amount - ing.amount) / ing.amount * 100) : 0
                    return (
                      <tr key={ing.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-1.5 px-2 truncate max-w-[100px]">{ing.name}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-gray-500">{ing.amount}{ing.unit}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-medium">
                          {converted?.amount || ing.amount}{ing.unit}
                        </td>
                        <td className={`py-1.5 px-2 text-right font-mono text-xs ${
                          diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {diff !== 0 && (diff > 0 ? '+' : '')}{diff}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ===== 하단: 액션 바 ===== */}
      <div className="flex items-center gap-2 h-12 flex-shrink-0">
        <button
          onClick={resetConversion}
          disabled={!hasChanges}
          className={`h-10 px-4 flex items-center gap-2 rounded-lg transition-all active:scale-95 ${
            hasChanges
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">초기화</span>
        </button>

        <div className="flex-1" />

        {/* 적용된 변환 요약 */}
        {hasChanges && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {conversionSummary?.activeConversions.map((conv, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                {conv.icon} {conv.labelKo}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`h-10 px-6 flex items-center gap-2 rounded-lg font-medium transition-all active:scale-95 ${
            hasChanges
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span className="text-sm">저장</span>
        </button>
      </div>

      {/* ===== 단축키 힌트 바 ===== */}
      <div className="flex items-center justify-center gap-4 py-1 text-xs text-gray-400 flex-shrink-0">
        <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">←→</kbd> 레시피</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">1</kbd><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-0.5">2</kbd><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-0.5">3</kbd> 탭</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Space</kbd> 쿠킹모드</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> 저장</span>
        <button
          onClick={() => setShowShortcuts(true)}
          className="text-blue-500 hover:underline"
        >
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">?</kbd> 더보기
        </button>
      </div>

      {/* ===== 단축키 도움말 모달 ===== */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              키보드 단축키
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>레시피 이동</span>
                <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">←</kbd> <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">→</kbd></span>
              </div>
              <div className="flex justify-between">
                <span>탭 전환 (팬/제법/수량)</span>
                <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">1</kbd> <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">2</kbd> <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">3</kbd></span>
              </div>
              <div className="flex justify-between">
                <span>쿠킹모드 시작</span>
                <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Space</kbd></span>
              </div>
              <div className="flex justify-between">
                <span>저장</span>
                <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">S</kbd></span>
              </div>
              <div className="flex justify-between">
                <span>초기화 / 닫기</span>
                <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd></span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-200">
              💡 밀가루 묻은 손으로도 큰 키보드 키 하나로 조작 가능!
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              닫기 (Esc)
            </button>
          </div>
        </div>
      )}

      {/* ===== 쿠킹모드 오버레이 ===== */}
      {isCookingMode && sourceRecipe && (
        <CookingModeOverlay
          recipe={convertedRecipe || sourceRecipe}
          onClose={() => setIsCookingMode(false)}
        />
      )}
    </div>
  )
}

// 쿠킹모드 오버레이 컴포넌트
const CookingModeOverlay: React.FC<{
  recipe: Recipe
  onClose: () => void
}> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = recipe.steps || []

  // 쿠킹모드 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentStep(prev => Math.max(0, prev - 1))
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Enter') {
        setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, steps.length])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-bold">{recipe.name}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30"
        >
          닫기
        </button>
      </div>

      {/* 재료 요약 */}
      <div className="px-4 py-3 bg-white/10">
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.slice(0, 6).map((ing, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/20 rounded text-sm text-white">
              {ing.name}: {ing.amount}{ing.unit}
            </span>
          ))}
          {recipe.ingredients.length > 6 && (
            <span className="px-2 py-1 text-sm text-white/60">
              +{recipe.ingredients.length - 6}개
            </span>
          )}
        </div>
      </div>

      {/* 스텝 표시 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {steps.length > 0 ? (
          <>
            <p className="text-white/60 text-sm mb-4">
              단계 {currentStep + 1} / {steps.length}
            </p>
            <p className="text-white text-2xl text-center leading-relaxed max-w-2xl">
              {steps[currentStep]?.instruction || steps[currentStep]}
            </p>
          </>
        ) : (
          <p className="text-white/60">조리 단계가 없습니다</p>
        )}
      </div>

      {/* 네비게이션 버튼 - 큰 클릭 영역 */}
      <div className="flex p-4 gap-4">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex-1 py-6 bg-white/20 rounded-xl text-white text-lg font-medium disabled:opacity-30 hover:bg-white/30 transition-all"
        >
          ← 이전
          <span className="block text-xs opacity-60 mt-1">또는 ← 키</span>
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep >= steps.length - 1}
          className="flex-1 py-6 bg-blue-500 rounded-xl text-white text-lg font-medium disabled:opacity-30 hover:bg-blue-600 transition-all"
        >
          다음 →
          <span className="block text-xs opacity-60 mt-1">또는 → / Enter 키</span>
        </button>
      </div>

      {/* 키보드 힌트 */}
      <div className="pb-4 text-center text-white/50 text-sm">
        <kbd className="px-2 py-1 bg-white/20 rounded">Space</kbd> 또는{' '}
        <kbd className="px-2 py-1 bg-white/20 rounded">Esc</kbd> 로 쿠킹모드 종료
      </div>
    </div>
  )
}

export default DashboardCompact
