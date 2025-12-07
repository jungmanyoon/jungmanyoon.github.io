import { useState, useEffect, useRef } from 'react'
import { PanScaling } from '@utils/calculations/panScaling'
import { MagicNumbers } from '@utils/calculations/magicNumbers'
import { BakersPercentage } from '@utils/calculations/bakersPercentage'
import { usePanPresetStore } from '@stores/usePanPresetStore'
import { useRecipeStore } from '@stores/useRecipeStore'
import { useAppStore } from '@stores/useAppStore'
import PanVisualization from './PanVisualization'

/**
 * 향상된 빠른 팬 계산기
 * - 팬 프리셋 저장/불러오기
 * - 시각화 차트
 * - 인쇄 기능
 * - 레시피 자동 변환
 * - 고급 설정 (재질, 고도)
 */
export default function QuickPanCalculator() {
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
  const [showVisualization, setShowVisualization] = useState(true)
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
      alert('프리셋 이름을 입력하세요')
      return
    }
    addPreset(presetName, pans)
    setPresetName('')
    setShowPresetModal(false)
    alert('프리셋이 저장되었습니다!')
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
      if (confirm('레시피를 선택해주세요. 레시피 목록으로 이동하시겠습니까?')) {
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
      name: `${currentRecipe.name} (팬 변환 ${scalingFactor}x)`,
      ingredients: scaledIngredients,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: `${currentRecipe.notes || ''}\n\n[팬 계산 변환]\n총 ${results.totalPans}개 팬, ${results.totalDough}g 반죽`
    }

    // 확인 후 저장
    if (confirm(`${scalingFactor}배 변환된 레시피를 저장하시겠습니까?`)) {
      setCurrentRecipe(convertedRecipe)
      setActiveTab('recipes')
    }
  }

  // 결과 복사
  const copyResults = () => {
    const text = `
팬 계산 결과
─────────────────
총 팬 개수: ${results.totalPans}개
필요 반죽량: ${results.totalDough.toLocaleString()}g
손실 5% 적용: ${results.wastageAdjusted.toLocaleString()}g
레시피 배율: ${results.scalingFactor}x

팬별 상세:
${results.pans.map((pan, i) =>
  `#${i + 1}: ${pan.doughPerPan}g × ${pan.count}개 = ${pan.totalDough}g (${pan.bakingTemp}°C / ${pan.bakingTime}분)`
).join('\n')}
    `.trim()

    navigator.clipboard.writeText(text)
    alert('클립보드에 복사되었습니다!')
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
            <h1 className="text-2xl font-bold text-bread-800">🍞 전문가용 팬 계산기</h1>
            <p className="text-gray-600 mt-1">여러 팬의 반죽량을 정밀하게 계산합니다</p>
          </div>

          <div className="flex gap-2 flex-wrap print:hidden">
            <button
              onClick={() => setShowPresetModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              💾 저장
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              🖨️ 인쇄
            </button>
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              📥 내보내기
            </button>
            <button
              onClick={addPan}
              className="bg-bread-600 text-white px-4 py-2 rounded-lg hover:bg-bread-700 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              팬 추가
            </button>
          </div>
        </div>

        {/* 프리셋 빠른 선택 */}
        {presets.length > 0 && (
          <div className="print:hidden">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📌 저장된 프리셋</h3>
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
                  +{presets.length - 5} 더보기
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
          {showAdvanced ? '▼' : '▶'} 고급 설정 (재질, 고도 보정)
        </button>
      </div>

      {/* 팬 입력 섹션 */}
      <div className="space-y-4">
        {pans.map((pan, index) => (
          <div key={pan.id} className="bg-white rounded-lg shadow-sm p-6 print:break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-bread-800">
                팬 #{index + 1}
              </h3>
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => duplicatePan(pan.id)}
                  className="text-bread-600 hover:text-bread-800 text-sm px-3 py-1 border border-bread-300 rounded"
                  title="복제"
                >
                  복제
                </button>
                {pans.length > 1 && (
                  <button
                    onClick={() => removePan(pan.id)}
                    className="text-red-600 hover:text-red-800 text-xl px-2"
                    title="삭제"
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
                  팬 형태
                </label>
                <select
                  value={pan.type}
                  onChange={(e) => updatePan(pan.id, 'type', e.target.value)}
                  className="input w-full"
                >
                  <option value="rectangle">사각형/직사각형</option>
                  <option value="round">원형</option>
                  <option value="loaf">식빵틀</option>
                </select>
              </div>

              {/* 제품 종류 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제품 종류
                </label>
                <select
                  value={pan.productType}
                  onChange={(e) => updatePan(pan.id, 'productType', e.target.value)}
                  className="input w-full"
                >
                  <option value="white_bread">일반 식빵</option>
                  <option value="whole_wheat">통밀빵</option>
                  <option value="brioche">브리오슈</option>
                  <option value="milk_bread">우유식빵</option>
                  <option value="sandwich_loaf">샌드위치 식빵</option>
                  <option value="sourdough">사워도우</option>
                  <option value="sponge_cake">스펀지 케이크</option>
                  <option value="pound_cake">파운드 케이크</option>
                  <option value="chiffon_cake">쉬폰 케이크</option>
                </select>
              </div>

              {/* 치수 입력 */}
              {pan.type === 'rectangle' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      길이 (cm)
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
                      너비 (cm)
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
                    지름 (cm)
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
                  높이 (cm)
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
                  개수
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
                      팬 재질
                    </label>
                    <select
                      value={pan.material || 'aluminum'}
                      onChange={(e) => updatePan(pan.id, 'material', e.target.value)}
                      className="input w-full"
                    >
                      <option value="aluminum">알루미늄 (기준)</option>
                      <option value="dark_metal">어두운 금속 (5% ↓)</option>
                      <option value="carbon_steel">탄소강 (2% ↓)</option>
                      <option value="glass">유리 (5% ↑)</option>
                      <option value="ceramic">세라믹 (8% ↑)</option>
                      <option value="silicone">실리콘 (10% ↑)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      고도 (m)
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
                    <span className="text-gray-600">부피:</span>
                    <div className="font-semibold text-bread-800">
                      {results.pans[index].volume.toLocaleString()} cm³
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">팬당 반죽량:</span>
                    <div className="font-semibold text-bread-800">
                      {results.pans[index].doughPerPan.toLocaleString()}g
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">총 반죽량:</span>
                    <div className="font-bold text-bread-900 text-lg">
                      {results.pans[index].totalDough.toLocaleString()}g
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">권장 온도:</span>
                    <div className="font-semibold text-orange-600">
                      {results.pans[index].bakingTemp}°C
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">권장 시간:</span>
                    <div className="font-semibold text-orange-600">
                      {results.pans[index].bakingTime}분
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
          <h2 className="text-xl font-bold text-bread-900 mb-4">📋 총 요약</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">총 팬 개수</div>
              <div className="text-3xl font-bold text-bread-800">
                {results.totalPans}개
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">필요 반죽량</div>
              <div className="text-3xl font-bold text-bread-800">
                {results.totalDough.toLocaleString()}g
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">손실률 5% 적용</div>
              <div className="text-3xl font-bold text-green-600">
                {results.wastageAdjusted.toLocaleString()}g
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">레시피 배율</div>
              <div className="text-3xl font-bold text-blue-600">
                {results.scalingFactor}x
              </div>
            </div>
          </div>

          {/* 기준 레시피 설정 */}
          <div className="bg-white rounded-lg p-4 shadow mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기준 레시피 총량 (g):
            </label>
            <input
              type="number"
              value={baseRecipeWeight}
              onChange={(e) => setBaseRecipeWeight(parseFloat(e.target.value) || 1000)}
              className="input w-full max-w-xs"
              placeholder="예: 1200"
            />
            <p className="text-xs text-gray-500 mt-1">
              원래 레시피의 총 반죽량을 입력하면 정확한 배율이 계산됩니다
            </p>
          </div>

          {/* 팬별 상세 정보 테이블 */}
          <div className="bg-white rounded-lg p-4 shadow overflow-x-auto print:break-inside-avoid">
            <h3 className="font-semibold text-bread-800 mb-3">팬별 상세 정보</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2">팬</th>
                  <th className="text-left py-2 px-2">형태</th>
                  <th className="text-right py-2 px-2">치수</th>
                  <th className="text-right py-2 px-2">개수</th>
                  <th className="text-right py-2 px-2">팬당</th>
                  <th className="text-right py-2 px-2 font-semibold">총량</th>
                  <th className="text-right py-2 px-2">굽기</th>
                </tr>
              </thead>
              <tbody>
                {results.pans.map((pan, index) => (
                  <tr key={pan.id} className="border-b border-gray-100">
                    <td className="py-2 px-2">#{index + 1}</td>
                    <td className="py-2 px-2">
                      {pan.type === 'rectangle' ? '사각형' : pan.type === 'round' ? '원형' : '식빵틀'}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">
                      {pan.type === 'round'
                        ? `Ø${pan.length}×${pan.height}cm`
                        : `${pan.length}×${pan.width}×${pan.height}cm`
                      }
                    </td>
                    <td className="py-2 px-2 text-right">{pan.count}개</td>
                    <td className="py-2 px-2 text-right font-medium">
                      {pan.doughPerPan.toLocaleString()}g
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-bread-800">
                      {pan.totalDough.toLocaleString()}g
                    </td>
                    <td className="py-2 px-2 text-right text-orange-600">
                      {pan.bakingTemp}°C/{pan.bakingTime}분
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
              📋 결과 복사
            </button>
            <button
              onClick={convertRecipe}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              🔄 레시피 변환
            </button>
            <button
              onClick={() => setShowVisualization(!showVisualization)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              {showVisualization ? '📊 차트 숨기기' : '📊 차트 보기'}
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
                <h2 className="text-xl font-bold">프리셋 관리</h2>
                <button
                  onClick={() => setShowPresetModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 현재 구성 저장 */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">현재 구성 저장</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="프리셋 이름 (예: 주말 생산용)"
                    className="input flex-1"
                  />
                  <button
                    onClick={saveAsPreset}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    저장
                  </button>
                </div>
              </div>

              {/* 저장된 프리셋 목록 */}
              <div>
                <h3 className="font-semibold mb-2">저장된 프리셋</h3>
                {presets.length === 0 ? (
                  <p className="text-gray-500 text-sm">저장된 프리셋이 없습니다</p>
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
                            {preset.pans.length}개 팬 • {preset.usageCount}회 사용
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
                            불러오기
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('이 프리셋을 삭제하시겠습니까?')) {
                                deletePreset(preset.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            삭제
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

      {/* 시각화 섹션 */}
      {results && showVisualization && (
        <div className="print:break-before-page">
          <PanVisualization results={results} />
        </div>
      )}

      {/* 도움말 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
        <h3 className="font-semibold text-blue-900 mb-2">💡 사용 팁</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 팬 치수는 실제 내부 치수를 측정해서 입력하세요</li>
          <li>• 제품 종류에 따라 최적의 반죽량이 자동 계산됩니다</li>
          <li>• 고급 설정에서 팬 재질과 고도를 보정할 수 있습니다</li>
          <li>• 자주 사용하는 구성은 프리셋으로 저장하세요</li>
          <li>• 레시피 변환 버튼으로 배율이 적용된 레시피를 자동 생성합니다</li>
          <li>• 인쇄 버튼으로 작업지시서를 출력할 수 있습니다</li>
          <li>• 📊 차트 보기 버튼으로 시각화된 통계를 확인하세요</li>
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
