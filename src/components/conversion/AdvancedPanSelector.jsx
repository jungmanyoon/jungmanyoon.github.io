import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'
import { COMMON_PANS, PAN_CONVERSION_GUIDE } from '../../constants/pans.js'
import PanScaling from '../../utils/calculations/panScaling.js'
import MagicNumbers from '../../utils/calculations/magicNumbers.js'
import { useLocalization } from '@/hooks/useLocalization'

function AdvancedPanSelector({ recipe, onPanSelect }) {
  const { t } = useTranslation()
  const { getLocalizedPanName } = useLocalization()
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
        rating: suitability <= 0.1 ? 'optimal' : suitability <= 0.2 ? 'suitable' : 'possible'
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
      <h3 className="mb-4">{t('components.advancedPanSelector.title')}</h3>

      {/* 제품 정보 설정 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('components.advancedPanSelector.productType')}
          </label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md"
          >
            <optgroup label={t('components.advancedPanSelector.productGroups.bread')}>
              <option value="white_bread">{t('components.advancedPanSelector.products.white_bread')}</option>
              <option value="whole_wheat">{t('components.advancedPanSelector.products.whole_wheat')}</option>
              <option value="brioche">{t('components.advancedPanSelector.products.brioche')}</option>
              <option value="milk_bread">{t('components.advancedPanSelector.products.milk_bread')}</option>
              <option value="sourdough">{t('components.advancedPanSelector.products.sourdough')}</option>
            </optgroup>
            <optgroup label={t('components.advancedPanSelector.productGroups.cake')}>
              <option value="sponge_cake">{t('components.advancedPanSelector.products.sponge_cake')}</option>
              <option value="butter_cake">{t('components.advancedPanSelector.products.butter_cake')}</option>
              <option value="pound_cake">{t('components.advancedPanSelector.products.pound_cake')}</option>
              <option value="chiffon_cake">{t('components.advancedPanSelector.products.chiffon_cake')}</option>
              <option value="chocolate_cake">{t('components.advancedPanSelector.products.chocolate_cake')}</option>
            </optgroup>
            <optgroup label={t('components.advancedPanSelector.productGroups.other')}>
              <option value="muffin">{t('components.advancedPanSelector.products.muffin')}</option>
              <option value="cupcake">{t('components.advancedPanSelector.products.cupcake')}</option>
              <option value="banana_bread">{t('components.advancedPanSelector.products.banana_bread')}</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('components.advancedPanSelector.panMaterial')}
          </label>
          <select
            value={panMaterial}
            onChange={(e) => setPanMaterial(e.target.value)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md"
          >
            <option value="aluminum">{t('components.advancedPanSelector.materials.aluminum')}</option>
            <option value="dark_metal">{t('components.advancedPanSelector.materials.dark_metal')}</option>
            <option value="glass">{t('components.advancedPanSelector.materials.glass')}</option>
            <option value="ceramic">{t('components.advancedPanSelector.materials.ceramic')}</option>
            <option value="silicone">{t('components.advancedPanSelector.materials.silicone')}</option>
            <option value="carbon_steel">{t('components.advancedPanSelector.materials.carbon_steel')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('components.advancedPanSelector.altitude')}
          </label>
          <input
            type="number"
            value={altitude}
            onChange={(e) => setAltitude(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md"
            placeholder={t('components.advancedPanSelector.altitudePlaceholder')}
          />
        </div>
      </div>

      {/* 매직넘버 정보 */}
      <div className="bg-bread-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-bread-700">{t('components.advancedPanSelector.magicNumber.title')}</h4>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setCustomMagicNumber(customMagicNumber ? null :
              MagicNumbers.DEFAULT_MAGIC_NUMBERS[productType])}
          >
            {customMagicNumber ? t('components.advancedPanSelector.magicNumber.useDefault') : t('components.advancedPanSelector.magicNumber.customSetting')}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t('components.advancedPanSelector.magicNumber.currentValue')}</p>
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
            <p className="text-sm text-gray-600">{t('components.advancedPanSelector.magicNumber.adjustFactors')}</p>
            <p className="text-sm">
              {t('components.advancedPanSelector.magicNumber.material')}: ×{MagicNumbers.MATERIAL_ADJUSTMENTS[panMaterial]}<br/>
              {t('components.advancedPanSelector.magicNumber.altitude')}: ×{MagicNumbers.getAltitudeAdjustment(altitude).toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          {t('components.advancedPanSelector.magicNumber.formula')}
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
          <span className="text-sm font-medium">{t('components.advancedPanSelector.multiplePans')}</span>
        </label>
      </div>

      {/* 팬 추천 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-bread-700">{t('components.advancedPanSelector.panRecommendations.title')}</h4>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setShowRecommendations(!showRecommendations)}
          >
            {showRecommendations ? t('components.advancedPanSelector.panRecommendations.hideRec') : t('components.advancedPanSelector.panRecommendations.showRec')}
          </Button>
        </div>

        {showRecommendations && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t('components.advancedPanSelector.panRecommendations.currentDough')}: {totalDoughWeight.toFixed(0)}g
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
                    <h5 className="font-medium">{getLocalizedPanName(pan)}</h5>
                    <p className="text-sm text-gray-600">
                      {t('components.advancedPanSelector.panRecommendations.volume')}: {pan.volume}cm³ • {t('components.advancedPanSelector.panRecommendations.recommendedDough')}: {pan.actualDoughAmount}g
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('components.advancedPanSelector.panRecommendations.fillRate')}: {pan.fillPercentage}% • {t(`components.advancedPanSelector.panRecommendations.${pan.rating}`)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-bread-600">
                      {pan.adjustedTemp}°C / {pan.adjustedTime}{t('units.minute')}
                    </p>
                  </div>
                </div>

                {multiplePans && selectedPans.find(p => p.id === pan.id) && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm">{t('components.advancedPanSelector.panRecommendations.count')}:</label>
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
          <h4 className="font-medium mb-3">{t('components.advancedPanSelector.distribution.title')}</h4>
          <div className="space-y-2">
            {distribution.map((pan, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm">
                  {getLocalizedPanName(pan)} × {pan.count}
                </span>
                <span className="text-sm font-medium">
                  {t('components.advancedPanSelector.distribution.perPan')} {pan.perPan}g ({t('components.advancedPanSelector.distribution.total')} {pan.actualAmount}g)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between items-center font-medium">
              <span>{t('components.advancedPanSelector.distribution.totalDough')}:</span>
              <span>{totalDoughWeight.toFixed(0)}g</span>
            </div>
          </div>
        </div>
      )}

      {/* 대체 가능한 팬 정보 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">{t('components.advancedPanSelector.substitutionGuide.title')}</h5>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• {t('components.advancedPanSelector.substitutionGuide.line1')}</p>
          <p>• {t('components.advancedPanSelector.substitutionGuide.line2')}</p>
          <p>• {t('components.advancedPanSelector.substitutionGuide.line3')}</p>
        </div>
      </div>
    </div>
  )
}

export default AdvancedPanSelector