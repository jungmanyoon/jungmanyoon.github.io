import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PanScaling } from '@utils/calculations/panScaling'
import { MagicNumbers } from '@utils/calculations/magicNumbers'
import { BakersPercentage } from '@utils/calculations/bakersPercentage'
import { usePanPresetStore } from '@stores/usePanPresetStore'
import { useRecipeStore } from '@stores/useRecipeStore'
import { useAppStore } from '@stores/useAppStore'

/**
 * 향상된 빠른 팬 계산기
 * - 팬 프리셋 저장/불러오기
 * - 시각화 차트
 * - 인쇄 기능
 * - 레시피 자동 변환
 * - 고급 설정 (재질, 고도)
 */
export default function QuickPanCalculatorEnhanced() {
  const { t } = useTranslation()
  const [pans, setPans] = useState([
    {
      id: Date.now(),
      type: 'rectangle',
      length: 15.5,
      width: 7.5,
      height: 6.5,
      count: 1,
      productType: 'white_bread',
      material: 'aluminum',
      altitude: 0
    }
  ])

  const [results, setResults] = useState(null)
  const [baseRecipeWeight, setBaseRecipeWeight] = useState(1200)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState(null)

  // Zustand stores
  const { presets, addPreset, deletePreset, incrementUsage, toggleFavorite, getFavorites } = usePanPresetStore()
  const { recipes, currentRecipe, setCurrentRecipe } = useRecipeStore()
  const { setActiveTab } = useAppStore()

  const printRef = useRef()

  // 팬 추가
  const addPan = () => {
    setPans([...pans, {
      id: Date.now(),
      type: 'rectangle',
      length: 20,
      width: 10,
      height: 8,
      count: 1,
      productType: 'white_bread',
      material: 'aluminum',
      altitude: 0
    }])
  }

  // 팬 제거
  const removePan = (id) => {
    if (pans.length > 1) {
      setPans(pans.filter(pan => pan.id !== id))
    }
  }

  // 팬 정보 업데이트
  const updatePan = (id, field, value) => {
    setPans(pans.map(pan =>
      pan.id === id ? { ...pan, [field]: parseFloat(value) || value } : pan
    ))
  }

  // 팬 복제
  const duplicatePan = (id) => {
    const panToDuplicate = pans.find(pan => pan.id === id)
    if (panToDuplicate) {
      setPans([...pans, { ...panToDuplicate, id: Date.now() }])
    }
  }

  // 프리셋 저장
  const saveAsPreset = () => {
    if (!presetName.trim()) {
      alert(t('components.quickPanCalculatorEnhanced.enterPresetName'))
      return
    }
    addPreset(presetName, pans)
    setPresetName('')
    setShowPresetModal(false)
    alert(t('components.quickPanCalculatorEnhanced.presetSaved'))
  }

  // 프리셋 불러오기
  const loadPreset = (presetId) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      setPans(preset.pans.map(pan => ({ ...pan, id: Date.now() + Math.random() })))
      incrementUsage(presetId)
      setSelectedPresetId(presetId)
    }
  }

  // 계산 실행
  useEffect(() => {
    try {
      const calculatedPans = pans.map(pan => {
        // 팬 부피 계산
        const volume = pan.type === 'rectangle'
          ? PanScaling.calculateSquarePanVolume(pan.length, pan.width, pan.height)
          : pan.type === 'round'
          ? PanScaling.calculateRoundPanVolume(pan.length, pan.height)
          : pan.type === 'loaf'
          ? PanScaling.calculateLoafPanVolume(pan.length, pan.width, pan.width * 0.85, pan.height)
          : 0

        // 팬당 반죽량 계산 (고급 옵션 포함)
        const doughPerPan = MagicNumbers.calculateDoughWeight(
          volume,
          pan.productType,
          {
            material: pan.material || 'aluminum',
            altitude: pan.altitude || 0
          }
        )

        // 굽기 온도/시간 조정
        const scalingFactor = volume / 2000 // 기준 2000cm³
        const bakingTemp = PanScaling.adjustBakingTemperature(180, scalingFactor)
        const bakingTime = PanScaling.adjustBakingTime(35, scalingFactor, 'bread')

        return {
          ...pan,
          volume,
          doughPerPan,
          totalDough: doughPerPan * pan.count,
          bakingTemp,
          bakingTime
        }
      })

      // 전체 합계
      const totalDough = calculatedPans.reduce((sum, pan) => sum + pan.totalDough, 0)
      const totalPans = calculatedPans.reduce((sum, pan) => sum + pan.count, 0)
      const totalVolume = calculatedPans.reduce((sum, pan) => sum + (pan.volume * pan.count), 0)

      // 레시피 배율 계산
      const scalingFactor = (totalDough / baseRecipeWeight).toFixed(2)
      const wastageAdjusted = Math.round(totalDough * 1.05)

      setResults({
        pans: calculatedPans,
        totalDough,
        totalPans,
        totalVolume,
        scalingFactor,
        wastageAdjusted
      })
    } catch (error) {
      console.error('계산 오류:', error)
    }
  }, [pans, baseRecipeWeight])

  // 인쇄 기능
  const handlePrint = () => {
    window.print()
  }

  // 레시피 자동 변환
  const convertRecipe = () => {
    if (!currentRecipe) {
      if (confirm(t('components.quickPanCalculatorEnhanced.selectRecipePrompt'))) {
        setActiveTab('recipes')
      }
      return
    }

    const scalingFactor = parseFloat(results.scalingFactor)

    // 베이커스 퍼센트 기반 스케일링
    const scaledIngredients = currentRecipe.ingredients.map(ing => ({
      ...ing,
      amount: Math.round(ing.amount * scalingFactor * 10) / 10
    }))

    // 변환된 레시피 생성
    const convertedRecipe = {
      ...currentRecipe,
      id: `recipe-${Date.now()}`,
      name: `${currentRecipe.name} (${t('components.quickPanCalculatorEnhanced.panConversion')} ${scalingFactor}x)`,
      ingredients: scaledIngredients,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: `${currentRecipe.notes || ''}\n\n[${t('components.quickPanCalculatorEnhanced.panCalculation')}]\n${t('components.quickPanCalculatorEnhanced.totalPansNote', { pans: results.totalPans, dough: results.totalDough })}`
    }

    // 확인 후 저장
    if (confirm(t('components.quickPanCalculatorEnhanced.saveConvertedRecipe', { scale: scalingFactor }))) {
      setCurrentRecipe(convertedRecipe)
      setActiveTab('recipes')
    }
  }

  // 결과 복사
  const copyResults = () => {
    const text = `
${t('components.quickPanCalculatorEnhanced.copyResultsTitle')}
─────────────────
${t('components.quickPanCalculatorEnhanced.totalPanCount')}: ${results.totalPans}${t('components.quickPanCalculatorEnhanced.countUnit')}
${t('components.quickPanCalculatorEnhanced.requiredDough')}: ${results.totalDough.toLocaleString()}g
${t('components.quickPanCalculatorEnhanced.wastageApplied')}: ${results.wastageAdjusted.toLocaleString()}g
${t('components.quickPanCalculatorEnhanced.recipeScaling')}: ${results.scalingFactor}x

${t('components.quickPanCalculatorEnhanced.panDetails')}:
${results.pans.map((pan, i) =>
  `#${i + 1}: ${pan.doughPerPan}g × ${pan.count}${t('components.quickPanCalculatorEnhanced.countUnit')} = ${pan.totalDough}g (${pan.bakingTemp}°C / ${pan.bakingTime}${t('components.quickPanCalculatorEnhanced.minutesUnit')})`
).join('\n')}
    `.trim()

    navigator.clipboard.writeText(text)
    alert(t('components.quickPanCalculatorEnhanced.copiedToClipboard'))
  }

  // 데이터 내보내기
  const exportData = () => {
    const data = {
      pans,
      results,
      baseRecipeWeight,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pan-calculation-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* 헤더 & 액션 */}
      <div className="bg-white rounded-lg shadow-sm p-6 print:shadow-none">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-bread-800">🍞 {t('components.quickPanCalculatorEnhanced.title')}</h1>
            <p className="text-gray-600 mt-1">{t('components.quickPanCalculatorEnhanced.description')}</p>
          </div>

          <div className="flex gap-2 flex-wrap print:hidden">
            <button
              onClick={() => setShowPresetModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              💾 {t('common.save')}
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              🖨️ {t('components.quickPanCalculatorEnhanced.print')}
            </button>
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              📥 {t('common.export')}
            </button>
            <button
              onClick={addPan}
              className="bg-bread-600 text-white px-4 py-2 rounded-lg hover:bg-bread-700 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              {t('components.quickPanCalculatorEnhanced.addPan')}
            </button>
          </div>
        </div>

        {/* 프리셋 빠른 선택 */}
        {presets.length > 0 && (
          <div className="print:hidden">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📌 {t('components.quickPanCalculatorEnhanced.savedPresets')}</h3>
            <div className="flex gap-2 flex-wrap">
              {getFavorites().slice(0, 5).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className={`px-3 py-1 rounded-lg text-sm border-2 transition-colors ${
                    selectedPresetId === preset.id
                      ? 'bg-bread-100 border-bread-600 text-bread-800'
                      : 'bg-white border-gray-300 hover:border-bread-400'
                  }`}
                >
                  ⭐ {preset.name}
                </button>
              ))}
              {presets.length > 5 && (
                <button
                  onClick={() => setShowPresetModal(true)}
                  className="px-3 py-1 rounded-lg text-sm border-2 border-gray-300 hover:border-bread-400"
                >
                  +{presets.length - 5} {t('components.quickPanCalculatorEnhanced.more')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 고급 설정 토글 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-4 text-sm text-bread-600 hover:text-bread-800 print:hidden"
        >
          {showAdvanced ? '▼' : '▶'} {t('components.quickPanCalculatorEnhanced.advancedSettings')}
        </button>
      </div>

      {/* 팬 입력 섹션 */}
      <div className="space-y-4">
        {pans.map((pan, index) => (
          <div key={pan.id} className="bg-white rounded-lg shadow-sm p-6 print:break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-bread-800">
                {t('components.quickPanCalculatorEnhanced.panNumber', { number: index + 1 })}
              </h3>
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => duplicatePan(pan.id)}
                  className="text-bread-600 hover:text-bread-800 text-sm px-3 py-1 border border-bread-300 rounded"
                  title={t('common.copy')}
                >
                  {t('common.copy')}
                </button>
                {pans.length > 1 && (
                  <button
                    onClick={() => removePan(pan.id)}
                    className="text-red-600 hover:text-red-800 text-xl px-2"
                    title={t('common.delete')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 팬 형태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('components.quickPanCalculatorEnhanced.panShape')}
                </label>
                <select
                  value={pan.type}
                  onChange={(e) => updatePan(pan.id, 'type', e.target.value)}
                  className="input w-full"
                >
                  <option value="rectangle">{t('components.quickPanCalculatorEnhanced.shapes.rectangle')}</option>
                  <option value="round">{t('components.quickPanCalculatorEnhanced.shapes.round')}</option>
                  <option value="loaf">{t('components.quickPanCalculatorEnhanced.shapes.loaf')}</option>
                </select>
              </div>

              {/* 제품 종류 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('components.quickPanCalculatorEnhanced.productType')}
                </label>
                <select
                  value={pan.productType}
                  onChange={(e) => updatePan(pan.id, 'productType', e.target.value)}
                  className="input w-full"
                >
                  <option value="white_bread">{t('components.quickPanCalculatorEnhanced.products.whiteBread')}</option>
                  <option value="whole_wheat">{t('components.quickPanCalculatorEnhanced.products.wholeWheat')}</option>
                  <option value="brioche">{t('components.quickPanCalculatorEnhanced.products.brioche')}</option>
                  <option value="milk_bread">{t('components.quickPanCalculatorEnhanced.products.milkBread')}</option>
                  <option value="sandwich_loaf">{t('components.quickPanCalculatorEnhanced.products.sandwichLoaf')}</option>
                  <option value="sourdough">{t('components.quickPanCalculatorEnhanced.products.sourdough')}</option>
                  <option value="sponge_cake">{t('components.quickPanCalculatorEnhanced.products.spongeCake')}</option>
                  <option value="pound_cake">{t('components.quickPanCalculatorEnhanced.products.poundCake')}</option>
                  <option value="chiffon_cake">{t('components.quickPanCalculatorEnhanced.products.chiffonCake')}</option>
                </select>
              </div>

              {/* 치수 입력 */}
              {pan.type === 'rectangle' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.quickPanCalculatorEnhanced.length')} (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pan.length}
                      onChange={(e) => updatePan(pan.id, 'length', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.quickPanCalculatorEnhanced.width')} (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pan.width}
                      onChange={(e) => updatePan(pan.id, 'width', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </>
              )}

              {pan.type === 'round' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('components.quickPanCalculatorEnhanced.diameter')} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pan.length}
                    onChange={(e) => updatePan(pan.id, 'length', e.target.value)}
                    className="input w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('components.quickPanCalculatorEnhanced.height')} (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pan.height}
                  onChange={(e) => updatePan(pan.id, 'height', e.target.value)}
                  className="input w-full"
                />
              </div>

              {/* 개수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('components.quickPanCalculatorEnhanced.quantity')}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updatePan(pan.id, 'count', Math.max(1, pan.count - 1))}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={pan.count}
                    onChange={(e) => updatePan(pan.id, 'count', e.target.value)}
                    className="input w-20 text-center"
                  />
                  <button
                    onClick={() => updatePan(pan.id, 'count', pan.count + 1)}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 고급 설정 */}
              {showAdvanced && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.quickPanCalculatorEnhanced.panMaterial')}
                    </label>
                    <select
                      value={pan.material || 'aluminum'}
                      onChange={(e) => updatePan(pan.id, 'material', e.target.value)}
                      className="input w-full"
                    >
                      <option value="aluminum">{t('components.quickPanCalculatorEnhanced.materials.aluminum')}</option>
                      <option value="dark_metal">{t('components.quickPanCalculatorEnhanced.materials.darkMetal')}</option>
                      <option value="carbon_steel">{t('components.quickPanCalculatorEnhanced.materials.carbonSteel')}</option>
                      <option value="glass">{t('components.quickPanCalculatorEnhanced.materials.glass')}</option>
                      <option value="ceramic">{t('components.quickPanCalculatorEnhanced.materials.ceramic')}</option>
                      <option value="silicone">{t('components.quickPanCalculatorEnhanced.materials.silicone')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.quickPanCalculatorEnhanced.altitude')} (m)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={pan.altitude || 0}
                      onChange={(e) => updatePan(pan.id, 'altitude', e.target.value)}
                      className="input w-full"
                      placeholder="0"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 계산 결과 (팬별) */}
            {results && results.pans[index] && (
              <div className="mt-4 p-4 bg-bread-50 rounded-lg border border-bread-200">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('components.quickPanCalculatorEnhanced.volume')}:</span>
                    <div className="font-semibold text-bread-800">
                      {results.pans[index].volume.toLocaleString()} cm³
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('components.quickPanCalculatorEnhanced.doughPerPan')}:</span>
                    <div className="font-semibold text-bread-800">
                      {results.pans[index].doughPerPan.toLocaleString()}g
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('components.quickPanCalculatorEnhanced.totalDough')}:</span>
                    <div className="font-bold text-bread-900 text-lg">
                      {results.pans[index].totalDough.toLocaleString()}g
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('components.quickPanCalculatorEnhanced.recommendedTemp')}:</span>
                    <div className="font-semibold text-orange-600">
                      {results.pans[index].bakingTemp}°C
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('components.quickPanCalculatorEnhanced.recommendedTime')}:</span>
                    <div className="font-semibold text-orange-600">
                      {results.pans[index].bakingTime}{t('components.quickPanCalculatorEnhanced.minutesUnit')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 전체 요약 */}
      {results && (
        <div className="bg-gradient-to-br from-bread-100 to-bread-200 rounded-lg shadow-lg p-6 print:shadow-none print:break-inside-avoid">
          <h2 className="text-xl font-bold text-bread-900 mb-4">📋 {t('components.quickPanCalculatorEnhanced.totalSummary')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">{t('components.quickPanCalculatorEnhanced.totalPanCount')}</div>
              <div className="text-3xl font-bold text-bread-800">
                {results.totalPans}{t('components.quickPanCalculatorEnhanced.countUnit')}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">{t('components.quickPanCalculatorEnhanced.requiredDough')}</div>
              <div className="text-3xl font-bold text-bread-800">
                {results.totalDough.toLocaleString()}g
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">{t('components.quickPanCalculatorEnhanced.wastageApplied')}</div>
              <div className="text-3xl font-bold text-green-600">
                {results.wastageAdjusted.toLocaleString()}g
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">{t('components.quickPanCalculatorEnhanced.recipeScaling')}</div>
              <div className="text-3xl font-bold text-blue-600">
                {results.scalingFactor}x
              </div>
            </div>
          </div>

          {/* 기준 레시피 설정 */}
          <div className="bg-white rounded-lg p-4 shadow mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('components.quickPanCalculatorEnhanced.baseRecipeWeight')} (g):
            </label>
            <input
              type="number"
              value={baseRecipeWeight}
              onChange={(e) => setBaseRecipeWeight(parseFloat(e.target.value) || 1000)}
              className="input w-full max-w-xs"
              placeholder={t('components.quickPanCalculatorEnhanced.exampleWeight')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('components.quickPanCalculatorEnhanced.baseRecipeWeightHelp')}
            </p>
          </div>

          {/* 팬별 상세 정보 테이블 */}
          <div className="bg-white rounded-lg p-4 shadow overflow-x-auto print:break-inside-avoid">
            <h3 className="font-semibold text-bread-800 mb-3">{t('components.quickPanCalculatorEnhanced.panDetails')}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2">{t('components.quickPanCalculatorEnhanced.tableHeaders.pan')}</th>
                  <th className="text-left py-2 px-2">{t('components.quickPanCalculatorEnhanced.tableHeaders.shape')}</th>
                  <th className="text-right py-2 px-2">{t('components.quickPanCalculatorEnhanced.tableHeaders.dimensions')}</th>
                  <th className="text-right py-2 px-2">{t('components.quickPanCalculatorEnhanced.tableHeaders.count')}</th>
                  <th className="text-right py-2 px-2">{t('components.quickPanCalculatorEnhanced.tableHeaders.perPan')}</th>
                  <th className="text-right py-2 px-2 font-semibold">{t('components.quickPanCalculatorEnhanced.tableHeaders.total')}</th>
                  <th className="text-right py-2 px-2">{t('components.quickPanCalculatorEnhanced.tableHeaders.baking')}</th>
                </tr>
              </thead>
              <tbody>
                {results.pans.map((pan, index) => (
                  <tr key={pan.id} className="border-b border-gray-100">
                    <td className="py-2 px-2">#{index + 1}</td>
                    <td className="py-2 px-2">
                      {pan.type === 'rectangle' ? t('components.quickPanCalculatorEnhanced.shapes.rectangle') : pan.type === 'round' ? t('components.quickPanCalculatorEnhanced.shapes.round') : t('components.quickPanCalculatorEnhanced.shapes.loaf')}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">
                      {pan.type === 'round'
                        ? `Ø${pan.length}×${pan.height}cm`
                        : `${pan.length}×${pan.width}×${pan.height}cm`
                      }
                    </td>
                    <td className="py-2 px-2 text-right">{pan.count}{t('components.quickPanCalculatorEnhanced.countUnit')}</td>
                    <td className="py-2 px-2 text-right font-medium">
                      {pan.doughPerPan.toLocaleString()}g
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-bread-800">
                      {pan.totalDough.toLocaleString()}g
                    </td>
                    <td className="py-2 px-2 text-right text-orange-600">
                      {pan.bakingTemp}°C/{pan.bakingTime}{t('components.quickPanCalculatorEnhanced.minutesUnit')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-4 flex gap-2 flex-wrap print:hidden">
            <button
              onClick={copyResults}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              📋 {t('components.quickPanCalculatorEnhanced.copyResults')}
            </button>
            <button
              onClick={convertRecipe}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              🔄 {t('components.quickPanCalculatorEnhanced.convertRecipe')}
            </button>
          </div>
        </div>
      )}

      {/* 프리셋 모달 */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('components.quickPanCalculatorEnhanced.presetManagement')}</h2>
                <button
                  onClick={() => setShowPresetModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 현재 구성 저장 */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">{t('components.quickPanCalculatorEnhanced.saveCurrentConfig')}</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder={t('components.quickPanCalculatorEnhanced.presetNamePlaceholder')}
                    className="input flex-1"
                  />
                  <button
                    onClick={saveAsPreset}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>

              {/* 저장된 프리셋 목록 */}
              <div>
                <h3 className="font-semibold mb-2">{t('components.quickPanCalculatorEnhanced.savedPresets')}</h3>
                {presets.length === 0 ? (
                  <p className="text-gray-500 text-sm">{t('components.quickPanCalculatorEnhanced.noPresets')}</p>
                ) : (
                  <div className="space-y-2">
                    {presets.map(preset => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-sm text-gray-500">
                            {t('components.quickPanCalculatorEnhanced.presetInfo', { pans: preset.pans.length, usage: preset.usageCount })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFavorite(preset.id)}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            {preset.isFavorite ? '⭐' : '☆'}
                          </button>
                          <button
                            onClick={() => {
                              loadPreset(preset.id)
                              setShowPresetModal(false)
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-300 rounded"
                          >
                            {t('components.quickPanCalculatorEnhanced.load')}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t('components.quickPanCalculatorEnhanced.deletePresetConfirm'))) {
                                deletePreset(preset.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 도움말 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-blue-900 mb-2">💡 {t('components.quickPanCalculatorEnhanced.usageTips')}</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('components.quickPanCalculatorEnhanced.tips.measureInner')}</li>
          <li>• {t('components.quickPanCalculatorEnhanced.tips.autoDough')}</li>
          <li>• {t('components.quickPanCalculatorEnhanced.tips.advancedSettings')}</li>
          <li>• {t('components.quickPanCalculatorEnhanced.tips.savePresets')}</li>
          <li>• {t('components.quickPanCalculatorEnhanced.tips.recipeConvert')}</li>
          <li>• {t('components.quickPanCalculatorEnhanced.tips.printWorksheet')}</li>
        </ul>
      </div>

      {/* 인쇄용 CSS */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}
