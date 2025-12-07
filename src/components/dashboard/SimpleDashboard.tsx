/**
 * SimpleDashboard - 엑셀 스타일 레시피 변환 대시보드
 *
 * 적용: --persona-frontend + --magic (UI 생성)
 *
 * 구조:
 * - 상단: 빠른 설정 바 (레시피 선택, 팬, 배수)
 * - 중앙: 원본 | 변환 분할 뷰
 * - 우측: 참조 데이터 사이드바 (토글)
 */

import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useRecipeStore } from '@/stores/useRecipeStore';
import { ChevronDown, ChevronRight, BookOpen, Scale, X, Plus, Minus, RotateCcw, Save, Download } from 'lucide-react';

// 팬 사이즈 데이터 (레시피계산기.xlsx 기반)
const PAN_SIZES = {
  사각팬: [
    { name: '오란다(소)', volume: 322, dimensions: '130×55×45' },
    { name: '오란다(대)', volume: 662, dimensions: '150×70×63' },
    { name: '옥수수식빵(3구)', volume: 1821, dimensions: '220×110×90' },
    { name: '우유식빵(4구)', volume: 2580, dimensions: '308×104×94' },
    { name: '풀먼식빵팬', volume: 2350, dimensions: '170×125×125' },
    { name: '큐브식빵팬', volume: 857, dimensions: '95×95×95' },
    { name: '파운드팬(중)', volume: 1456, dimensions: '260×80×70' },
    { name: '정사각틀 1호', volume: 820, dimensions: '135×135×45' },
    { name: '정사각틀 2호', volume: 1225, dimensions: '165×165×45' },
    { name: '정사각틀 3호', volume: 1711, dimensions: '195×195×45' },
    { name: '실리콘큐브', volume: 125, dimensions: '50×50×50' },
  ],
  원형팬: [
    { name: '낮은원형틀 미니', volume: 509, dimensions: 'ø120×45' },
    { name: '높은원형틀 미니', volume: 848, dimensions: 'ø120×75' },
    { name: '높은원형틀 1호', volume: 1325, dimensions: 'ø150×75' },
    { name: '높은원형틀 2호', volume: 1909, dimensions: 'ø180×75' },
    { name: '높은원형틀 3호', volume: 2598, dimensions: 'ø210×75' },
    { name: '원형무스링1호', volume: 1237, dimensions: 'ø150×70' },
    { name: '원형무스링2호', volume: 1781, dimensions: 'ø180×70' },
    { name: '원형무스링3호', volume: 2425, dimensions: 'ø210×70' },
    { name: '타르트팬1호', volume: 265, dimensions: 'ø130×20' },
    { name: '타르트팬2호', volume: 428, dimensions: 'ø165×20' },
  ],
  쉬폰팬: [
    { name: '쉬폰팬 1호', volume: 1253, dimensions: 'ø150×80' },
    { name: '쉬폰팬 2호', volume: 1990, dimensions: 'ø180×90' },
    { name: '쉬폰팬 3호', volume: 3175, dimensions: 'ø210×100' },
  ],
};

// 비용적 기준 데이터
const SPECIFIC_VOLUMES = [
  { name: '파운드케이크', value: 2.4 },
  { name: '레이어케이크', value: 2.96 },
  { name: '엔젤푸드케이크', value: 4.7 },
  { name: '스펀지케이크', value: 5.8 },
  { name: '풀먼식빵', value: 4.2, range: '3.3~4' },
  { name: '산형식빵', value: 3.4, range: '3.2~3.4' },
  { name: '버터톱식빵', value: 4.2 },
  { name: '옥수수식빵', value: 3.95 },
];

// 사전반죽 비율 데이터
const PREFERMENT_RATIOS = {
  폴리쉬: { flour: 0.6, water: 0.7 },
  비가: { flour: 0.5, water: 0.3 },
  중종법: { flour: 0.5, water: 1.0 },
};

// 재료별 수율 데이터
const INGREDIENT_YIELDS = {
  '계란(전란)': 0.75,
  노른자: 0.505,
  흰자: 0.88,
  우유: 0.875,
  버터: 0.16,
};

const SimpleDashboard = () => {
  const {
    sourceRecipe,
    convertedRecipe,
    conversionConfig,
    conversionDiffs,
    conversionSummary,
    selectSourceRecipe,
    updateQuantity,
    updatePanConfig,
    recalculate,
    resetConversion,
  } = useDashboardStore();

  const { recipes } = useRecipeStore();

  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedPanCategory, setSelectedPanCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    panSizes: true,
    specificVolumes: false,
    preferment: false,
    yields: false,
  });

  // 첫 로드시 레시피 선택
  useEffect(() => {
    if (!sourceRecipe && recipes.length > 0) {
      selectSourceRecipe(recipes[0]);
    }
  }, [recipes, sourceRecipe, selectSourceRecipe]);

  // 배수 조절
  const handleMultiplierChange = (delta: number) => {
    const current = conversionConfig.batchMultiplier;
    const newValue = Math.max(0.5, Math.min(10, current + delta));
    updateQuantity(newValue);
  };

  // 직접 입력
  const handleMultiplierInput = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0.1 && num <= 20) {
      updateQuantity(num);
    }
  };

  // 베이커스 퍼센트 계산
  const calculateBakersPercent = (amount: number, flourTotal: number) => {
    if (flourTotal === 0) return 0;
    return Math.round((amount / flourTotal) * 1000) / 10;
  };

  // 밀가루 총량 계산
  const getFlourTotal = (ingredients: any[]) => {
    return ingredients
      ?.filter(i => i.category === 'flour' || i.isFlour)
      .reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
  };

  const sourceFlourTotal = sourceRecipe ? getFlourTotal(sourceRecipe.ingredients) : 0;
  const convertedFlourTotal = convertedRecipe ? getFlourTotal(convertedRecipe.ingredients) : 0;

  // 카테고리별 재료 그룹화
  const groupIngredients = (ingredients: any[]) => {
    const groups: Record<string, any[]> = {
      밀가루: [],
      수분: [],
      유지: [],
      당류: [],
      기타: [],
    };

    ingredients?.forEach(ing => {
      if (ing.category === 'flour' || ing.isFlour) {
        groups['밀가루'].push(ing);
      } else if (ing.category === 'liquid') {
        groups['수분'].push(ing);
      } else if (ing.category === 'fat') {
        groups['유지'].push(ing);
      } else if (ing.category === 'sugar') {
        groups['당류'].push(ing);
      } else {
        groups['기타'].push(ing);
      }
    });

    return groups;
  };

  const sourceGroups = sourceRecipe ? groupIngredients(sourceRecipe.ingredients) : {};
  const convertedGroups = convertedRecipe ? groupIngredients(convertedRecipe.ingredients) : {};

  // 차이값 찾기
  const getDiff = (ingredientId: string) => {
    return conversionDiffs?.find(d => d.ingredientId === ingredientId);
  };

  // 사이드바 토글
  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!sourceRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">레시피를 선택해주세요</h2>
          <p className="text-gray-500 mb-4">상단에서 레시피를 선택하거나 새로운 레시피를 만들어보세요.</p>
          {recipes.length > 0 && (
            <button
              onClick={() => selectSourceRecipe(recipes[0])}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              첫 번째 레시피 불러오기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ===== 상단 컨트롤 바 ===== */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* 레시피 선택 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">레시피:</label>
              <select
                value={sourceRecipe?.id || ''}
                onChange={(e) => {
                  const recipe = recipes.find(r => r.id === e.target.value);
                  if (recipe) selectSourceRecipe(recipe);
                }}
                className="border rounded-lg px-3 py-2 text-sm min-w-[200px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* 배수 조절 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">배수:</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleMultiplierChange(-0.5)}
                  className="px-3 py-2 hover:bg-gray-100 border-r"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={conversionConfig.batchMultiplier}
                  onChange={(e) => handleMultiplierInput(e.target.value)}
                  className="w-16 text-center py-2 font-medium focus:outline-none"
                  step="0.5"
                  min="0.5"
                  max="20"
                />
                <button
                  onClick={() => handleMultiplierChange(0.5)}
                  className="px-3 py-2 hover:bg-gray-100 border-l"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">배</span>
            </div>

            {/* 빠른 배수 버튼 */}
            <div className="flex items-center gap-1">
              {[0.5, 1, 1.5, 2, 3].map(m => (
                <button
                  key={m}
                  onClick={() => updateQuantity(m)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    conversionConfig.batchMultiplier === m
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  ×{m}
                </button>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={resetConversion}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition ${
                  showSidebar
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                참조 데이터
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 메인 콘텐츠 ===== */}
      <div className="flex-1 flex">
        {/* 원본 + 변환 분할 영역 */}
        <div className={`flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all ${
          showSidebar ? 'mr-80' : ''
        }`}>

          {/* ===== 원본 레시피 패널 ===== */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="bg-gray-50 border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-800">📋 원본 레시피</h2>
                <span className="text-sm text-gray-500">
                  {sourceRecipe.yield.quantity} {sourceRecipe.yield.unit}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">{sourceRecipe.name}</span>
                {sourceRecipe.panConfig && (
                  <span className="ml-2 text-gray-400">
                    | 팬: {sourceRecipe.panConfig.name}
                  </span>
                )}
              </div>
            </div>

            {/* 재료 테이블 */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">분류</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">재료</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">비율(%)</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">중량(g)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sourceGroups).map(([category, items]) => (
                    items.length > 0 && (
                      <React.Fragment key={category}>
                        {items.map((ing, idx) => (
                          <tr key={ing.id} className="border-b hover:bg-gray-50">
                            {idx === 0 && (
                              <td
                                rowSpan={items.length}
                                className="px-4 py-2 font-medium text-gray-700 bg-gray-50 border-r"
                              >
                                {category}
                              </td>
                            )}
                            <td className="px-4 py-2 text-gray-800">{ing.name}</td>
                            <td className="px-4 py-2 text-right text-gray-600">
                              {calculateBakersPercent(ing.amount, sourceFlourTotal)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-gray-800">
                              {ing.amount}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  ))}
                </tbody>
              </table>
            </div>

            {/* 합계 */}
            <div className="bg-gray-50 border-t px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">밀가루 합계:</span>
                <span className="font-mono font-medium">{sourceFlourTotal}g</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">총 중량:</span>
                <span className="font-mono font-bold text-lg">
                  {conversionSummary?.totalOriginalWeight || 0}g
                </span>
              </div>
              {conversionSummary && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">수화율:</span>
                  <span className="font-mono">{conversionSummary.hydrationOriginal}%</span>
                </div>
              )}
            </div>
          </div>

          {/* ===== 변환 레시피 패널 ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden flex flex-col ring-2 ring-blue-100">
            {/* 헤더 */}
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-blue-800">🔄 변환 레시피</h2>
                {conversionSummary && conversionSummary.scaleFactor !== 1 && (
                  <span className="text-sm font-medium px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                    ×{conversionSummary.scaleFactor.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-blue-700">
                <span className="font-medium">
                  {convertedRecipe?.yield.quantity} {convertedRecipe?.yield.unit}
                </span>
                {conversionSummary?.activeConversions?.map((conv, idx) => (
                  <span key={idx} className="ml-2 px-2 py-0.5 bg-blue-100 rounded text-xs">
                    {conv.icon} {conv.labelKo}
                  </span>
                ))}
              </div>
            </div>

            {/* 재료 테이블 */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 sticky top-0">
                  <tr className="border-b border-blue-200">
                    <th className="text-left px-4 py-2 font-medium text-blue-700">분류</th>
                    <th className="text-left px-4 py-2 font-medium text-blue-700">재료</th>
                    <th className="text-right px-4 py-2 font-medium text-blue-700">비율(%)</th>
                    <th className="text-right px-4 py-2 font-medium text-blue-700">중량(g)</th>
                    <th className="text-right px-4 py-2 font-medium text-blue-700">차이</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(convertedGroups).map(([category, items]) => (
                    items.length > 0 && (
                      <React.Fragment key={category}>
                        {items.map((ing, idx) => {
                          const diff = getDiff(ing.id);
                          const originalIng = sourceRecipe?.ingredients.find(i => i.id === ing.id);
                          const diffAmount = originalIng ? ing.amount - originalIng.amount : 0;

                          return (
                            <tr key={ing.id} className="border-b border-blue-100 hover:bg-blue-50">
                              {idx === 0 && (
                                <td
                                  rowSpan={items.length}
                                  className="px-4 py-2 font-medium text-blue-700 bg-blue-50 border-r border-blue-200"
                                >
                                  {category}
                                </td>
                              )}
                              <td className="px-4 py-2 text-gray-800">{ing.name}</td>
                              <td className="px-4 py-2 text-right text-gray-600">
                                {calculateBakersPercent(ing.amount, convertedFlourTotal)}
                              </td>
                              <td className="px-4 py-2 text-right font-mono font-medium text-blue-800">
                                {ing.amount}
                              </td>
                              <td className={`px-4 py-2 text-right font-mono text-sm ${
                                diffAmount > 0 ? 'text-green-600' :
                                diffAmount < 0 ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                {diffAmount > 0 ? '+' : ''}{diffAmount !== 0 ? diffAmount.toFixed(1) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    )
                  ))}
                </tbody>
              </table>
            </div>

            {/* 합계 */}
            <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">밀가루 합계:</span>
                <span className="font-mono font-medium">{convertedFlourTotal}g</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-blue-700">총 중량:</span>
                <span className="font-mono font-bold text-lg text-blue-800">
                  {conversionSummary?.totalConvertedWeight || 0}g
                </span>
              </div>
              {conversionSummary && (
                <>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-blue-700">수화율:</span>
                    <span className="font-mono">{conversionSummary.hydrationConverted}%</span>
                  </div>
                  {conversionSummary.scaleFactor !== 1 && (
                    <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between items-center">
                      <span className="text-blue-600 text-sm">변환 비율:</span>
                      <span className="text-xl font-bold text-blue-700">
                        ×{conversionSummary.scaleFactor.toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== 참조 데이터 사이드바 ===== */}
        <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg transform transition-transform duration-300 z-30 overflow-y-auto ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
          {/* 사이드바 헤더 */}
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">📊 참조 데이터</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 팬 사이즈 */}
          <div className="border-b">
            <button
              onClick={() => toggleCategory('panSizes')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-700">🍳 팬 사이즈</span>
              {expandedCategories.panSizes ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedCategories.panSizes && (
              <div className="px-4 pb-3 space-y-2">
                {Object.entries(PAN_SIZES).map(([category, pans]) => (
                  <div key={category}>
                    <div className="text-xs font-medium text-gray-500 mb-1">{category}</div>
                    <div className="space-y-1">
                      {pans.map(pan => (
                        <div
                          key={pan.name}
                          className="flex justify-between text-sm py-1 px-2 hover:bg-amber-50 rounded cursor-pointer"
                        >
                          <span className="text-gray-700">{pan.name}</span>
                          <span className="text-gray-500 font-mono text-xs">{pan.volume}㎤</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 비용적 기준 */}
          <div className="border-b">
            <button
              onClick={() => toggleCategory('specificVolumes')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-700">📐 비용적 기준</span>
              {expandedCategories.specificVolumes ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedCategories.specificVolumes && (
              <div className="px-4 pb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="text-left py-1">제품</th>
                      <th className="text-right py-1">비용적</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPECIFIC_VOLUMES.map(item => (
                      <tr key={item.name} className="hover:bg-amber-50">
                        <td className="py-1 text-gray-700">{item.name}</td>
                        <td className="py-1 text-right font-mono text-gray-600">
                          {item.value} {item.range && <span className="text-xs text-gray-400">({item.range})</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 사전반죽 비율 */}
          <div className="border-b">
            <button
              onClick={() => toggleCategory('preferment')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-700">🥖 사전반죽 비율</span>
              {expandedCategories.preferment ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedCategories.preferment && (
              <div className="px-4 pb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="text-left py-1">방식</th>
                      <th className="text-right py-1">밀가루</th>
                      <th className="text-right py-1">수분</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PREFERMENT_RATIOS).map(([name, ratio]) => (
                      <tr key={name} className="hover:bg-amber-50">
                        <td className="py-1 text-gray-700">{name}</td>
                        <td className="py-1 text-right font-mono text-gray-600">{ratio.flour * 100}%</td>
                        <td className="py-1 text-right font-mono text-gray-600">{ratio.water * 100}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 재료별 수율 */}
          <div className="border-b">
            <button
              onClick={() => toggleCategory('yields')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-700">🥚 재료별 수율</span>
              {expandedCategories.yields ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedCategories.yields && (
              <div className="px-4 pb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="text-left py-1">재료</th>
                      <th className="text-right py-1">수율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(INGREDIENT_YIELDS).map(([name, yield_]) => (
                      <tr key={name} className="hover:bg-amber-50">
                        <td className="py-1 text-gray-700">{name}</td>
                        <td className="py-1 text-right font-mono text-gray-600">{yield_ * 100}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-xs text-gray-500">
                  * 수율: 실제 사용 가능한 비율<br/>
                  * 버터 수율: 수분 함량 기준
                </div>
              </div>
            )}
          </div>

          {/* 기타 정보 */}
          <div className="px-4 py-4 text-xs text-gray-500">
            <div className="mb-2">📝 제빵 기준</div>
            <div className="space-y-1">
              <div>• 계란 비율: 껍질 10%, 노른자 30%, 흰자 60%</div>
              <div>• 소금: 밀가루의 1.5~2.5%</div>
              <div>• 식빵 수분비율: 55~68%</div>
              <div>• 치아바타 수분비율: 68~80%</div>
              <div>• 바게트 수분비율: 60~70%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
