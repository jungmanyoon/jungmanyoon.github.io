import React, { useState, useEffect } from 'react'
import Button from '../common/Button.jsx'
import { COMMON_PANS, PAN_CONVERSION_GUIDE } from '../../constants/pans.js'
import PanScaling from '../../utils/calculations/panScaling.js'
import MagicNumbers from '../../utils/calculations/magicNumbers.js'

function AdvancedPanSelector({ recipe, onPanSelect }) {
  const [selectedPans, setSelectedPans] = useState([])
  const [productType, setProductType] = useState('white_bread')
  const [panMaterial, setPanMaterial] = useState('aluminum')
  const [altitude, setAltitude] = useState(0)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [customMagicNumber, setCustomMagicNumber] = useState(null)
  const [multiplePans, setMultiplePans] = useState(false)
  
  // 현재 레시피의 총 반죽량 계산
  const totalDoughWeight = recipe ? 
    recipe.ingredients.reduce((sum, ing) => sum + parseFloat(ing.amount || 0), 0) : 0

  // 추천 팬 계산
  const calculateRecommendations = () => {
    if (!totalDoughWeight) return []
    
    const requiredVolume = MagicNumbers.calculateRequiredVolume(
      totalDoughWeight,
      productType,
      { material: panMaterial, altitude }
    )
    
    // 모든 팬을 적합도로 정렬
    const recommendations = Object.entries(COMMON_PANS).map(([id, pan]) => {
      const panVolume = pan.volume
      const suitability = Math.abs(1 - (panVolume / requiredVolume))
      const scalingFactor = panVolume / requiredVolume
      
      // 매직넘버로 계산한 실제 반죽량
      const actualDoughAmount = MagicNumbers.calculateDoughWeight(
        panVolume,
        productType,
        { material: panMaterial, altitude }
      )
      
      // 굽기 시간과 온도 조정
      const baseTime = productType.includes('bread') ? 35 : 30
      const baseTemp = productType.includes('bread') ? 180 : 170
      
      const adjustedTime = PanScaling.adjustBakingTime(baseTime, scalingFactor, 
        productType.includes('cake') ? 'cake' : 'bread')
      const adjustedTemp = PanScaling.adjustBakingTemperature(baseTemp, scalingFactor)
      
      return {
        ...pan,
        id,
        suitability,
        scalingFactor,
        actualDoughAmount,
        fillPercentage: (actualDoughAmount / totalDoughWeight * 100).toFixed(0),
        adjustedTime,
        adjustedTemp,
        rating: suitability <= 0.1 ? '최적' : suitability <= 0.2 ? '적합' : '가능'
      }
    })
    .filter(pan => pan.suitability <= 0.5)
    .sort((a, b) => a.suitability - b.suitability)
    
    return recommendations.slice(0, 6)
  }

  const recommendations = showRecommendations ? calculateRecommendations() : []

  // 다중 팬 선택 처리
  const handleMultiplePanSelect = (panId) => {
    setSelectedPans(prev => {
      const exists = prev.find(p => p.id === panId)
      if (exists) {
        return prev.filter(p => p.id !== panId)
      } else {
        return [...prev, { id: panId, count: 1 }]
      }
    })
  }

  const updatePanCount = (panId, count) => {
    setSelectedPans(prev => 
      prev.map(p => p.id === panId ? { ...p, count: parseInt(count) || 1 } : p)
    )
  }

  // 다중 팬 반죽 분배 계산
  const calculateMultiplePanDistribution = () => {
    if (selectedPans.length === 0) return []
    
    const pansData = selectedPans.map(sp => ({
      ...COMMON_PANS[sp.id],
      count: sp.count,
      volume: COMMON_PANS[sp.id].volume
    }))
    
    return MagicNumbers.distributeToMultiplePans(
      totalDoughWeight,
      pansData,
      productType
    )
  }

  const distribution = multiplePans ? calculateMultiplePanDistribution() : []

  return (
    <div>
      <h3 className="mb-4">고급 팬 선택기</h3>
      
      {/* 제품 정보 설정 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제품 종류
          </label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md"
          >
            <optgroup label="빵류">
              <option value="white_bread">일반 식빵</option>
              <option value="whole_wheat">통밀빵</option>
              <option value="brioche">브리오슈</option>
              <option value="milk_bread">우유식빵</option>
              <option value="sourdough">사워도우</option>
            </optgroup>
            <optgroup label="케이크류">
              <option value="sponge_cake">스펀지 케이크</option>
              <option value="butter_cake">버터 케이크</option>
              <option value="pound_cake">파운드 케이크</option>
              <option value="chiffon_cake">쉬폰 케이크</option>
              <option value="chocolate_cake">초콜릿 케이크</option>
            </optgroup>
            <optgroup label="기타">
              <option value="muffin">머핀</option>
              <option value="cupcake">컵케이크</option>
              <option value="banana_bread">바나나 브레드</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팬 재질
          </label>
          <select
            value={panMaterial}
            onChange={(e) => setPanMaterial(e.target.value)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md"
          >
            <option value="aluminum">알루미늄</option>
            <option value="dark_metal">어두운 금속</option>
            <option value="glass">유리</option>
            <option value="ceramic">세라믹</option>
            <option value="silicone">실리콘</option>
            <option value="carbon_steel">탄소강</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고도 (m)
          </label>
          <input
            type="number"
            value={altitude}
            onChange={(e) => setAltitude(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md"
            placeholder="해수면: 0"
          />
        </div>
      </div>

      {/* 매직넘버 정보 */}
      <div className="bg-bread-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-bread-700">매직넘버 정보</h4>
          <Button 
            size="small" 
            variant="secondary"
            onClick={() => setCustomMagicNumber(customMagicNumber ? null : 
              MagicNumbers.DEFAULT_MAGIC_NUMBERS[productType])}
          >
            {customMagicNumber ? '기본값 사용' : '커스텀 설정'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">현재 매직넘버:</p>
            {customMagicNumber ? (
              <input
                type="number"
                step="0.01"
                value={customMagicNumber}
                onChange={(e) => setCustomMagicNumber(parseFloat(e.target.value))}
                className="mt-1 px-2 py-1 border border-bread-300 rounded"
              />
            ) : (
              <p className="font-bold text-lg text-bread-700">
                {MagicNumbers.DEFAULT_MAGIC_NUMBERS[productType]}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">조정 요인:</p>
            <p className="text-sm">
              재질: ×{MagicNumbers.MATERIAL_ADJUSTMENTS[panMaterial]}<br/>
              고도: ×{MagicNumbers.getAltitudeAdjustment(altitude).toFixed(2)}
            </p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          팬 부피(cm³) ÷ 매직넘버 = 권장 반죽량(g)
        </p>
      </div>

      {/* 다중 팬 모드 */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={multiplePans}
            onChange={(e) => setMultiplePans(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium">여러 개의 팬 사용</span>
        </label>
      </div>

      {/* 팬 추천 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-bread-700">팬 추천</h4>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            {showRecommendations ? '추천 숨기기' : '추천 보기'}
          </Button>
        </div>

        {showRecommendations && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              현재 반죽량: {totalDoughWeight.toFixed(0)}g
            </p>
            
            {recommendations.map(pan => (
              <div
                key={pan.id}
                onClick={() => multiplePans ? 
                  handleMultiplePanSelect(pan.id) : 
                  onPanSelect(pan)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPans.find(p => p.id === pan.id)
                    ? 'border-bread-500 bg-bread-50'
                    : 'border-bread-200 hover:border-bread-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{pan.name}</h5>
                    <p className="text-sm text-gray-600">
                      부피: {pan.volume}cm³ • 권장 반죽량: {pan.actualDoughAmount}g
                    </p>
                    <p className="text-sm text-gray-500">
                      충전율: {pan.fillPercentage}% • {pan.rating}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-bread-600">
                      {pan.adjustedTemp}°C / {pan.adjustedTime}분
                    </p>
                  </div>
                </div>
                
                {multiplePans && selectedPans.find(p => p.id === pan.id) && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm">개수:</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedPans.find(p => p.id === pan.id).count}
                      onChange={(e) => updatePanCount(pan.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 px-2 py-1 border border-bread-300 rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 다중 팬 분배 결과 */}
      {multiplePans && distribution.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">반죽 분배 계획</h4>
          <div className="space-y-2">
            {distribution.map((pan, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">
                  {pan.name} × {pan.count}개
                </span>
                <span className="text-sm font-medium">
                  팬당 {pan.perPan}g (총 {pan.actualAmount}g)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between items-center font-medium">
              <span>총 반죽량:</span>
              <span>{totalDoughWeight.toFixed(0)}g</span>
            </div>
          </div>
        </div>
      )}

      {/* 대체 가능한 팬 정보 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">팬 대체 가이드</h5>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• 8인치 원형 = 8인치 정사각 = 1근 식빵틀</p>
          <p>• 9인치 원형 = 9인치 정사각</p>
          <p>• 9×13인치 직사각 = 10인치 원형 = 1/2 시트팬</p>
        </div>
      </div>
    </div>
  )
}

export default AdvancedPanSelector