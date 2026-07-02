import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import { DDTCalculator as DDTCalc, MixerType } from '@utils/calculations/ddtCalculator'
import { Recipe } from '@/types/recipe.types'
import { useCalculatorStore } from '@stores/useCalculatorStore'
import { useAppStore } from '@stores/useAppStore'

interface DDTCalculatorProps {
  recipe?: Recipe
  environment?: {
    temp: number
    humidity: number
  }
}

type Season = 'spring' | 'summer' | 'fall' | 'winter'
type BreadType = 'lean' | 'enriched' | 'sourdough' | 'pizza' | 'croissant'

// 추천 DDT 온도 상수
const RECOMMENDED_DDT: Record<Season, Record<BreadType, number>> = {
  spring: { lean: 25, enriched: 26, sourdough: 24, pizza: 24, croissant: 24 },
  summer: { lean: 23, enriched: 24, sourdough: 22, pizza: 22, croissant: 22 },
  fall: { lean: 25, enriched: 26, sourdough: 24, pizza: 24, croissant: 24 },
  winter: { lean: 27, enriched: 28, sourdough: 26, pizza: 26, croissant: 26 }
}

// 선택 옵션 컴포넌트 최적화
const SelectField = memo<{
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}>(({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-bread-300 rounded-md focus:ring-2 focus:ring-bread-500 focus:border-bread-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
))

SelectField.displayName = 'SelectField'

// 결과 표시 컴포넌트 최적화
const ResultDisplay = memo<{
  waterTemp: number | null
  useIce: boolean
  iceAmount: number
  waterAmount: number
  predictedTemp: number | null
  t: (key: string) => string
}>(({ waterTemp, useIce, iceAmount, waterAmount, predictedTemp, t }) => {
  if (!waterTemp) return null

  return (
    <div className="bg-bread-50 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-bread-700">{t('ddt.calculationResult')}</h4>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">{t('ddt.requiredWaterTemp')}:</span>
          <span className="font-semibold text-bread-700">
            {waterTemp.toFixed(1)}°C
          </span>
        </div>

        {useIce && (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">{t('ddt.ice')}:</span>
              <span className="font-semibold">{iceAmount}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">{t('ddt.coldWater')}:</span>
              <span className="font-semibold">{waterAmount}g</span>
            </div>
          </>
        )}

        {predictedTemp && (
          <div className="flex justify-between pt-2 border-t border-bread-200">
            <span className="text-sm text-gray-600">{t('ddt.labels.predictedTemp')}:</span>
            <span className="font-semibold text-bread-700">
              {predictedTemp.toFixed(1)}°C
            </span>
          </div>
        )}
      </div>

      {waterTemp < 5 && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          💡 {t('ddt.needsCooling')}
        </div>
      )}

      {waterTemp > 35 && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          ⚠️ {t('ddt.warnings.tooHot')}
        </div>
      )}
    </div>
  )
})

ResultDisplay.displayName = 'ResultDisplay'

// DDTCalculator 메인 컴포넌트 최적화
const DDTCalculatorComponent = memo<DDTCalculatorProps>(({ recipe, environment }) => {
  const { t } = useTranslation()
  const { updateDDT } = useCalculatorStore()
  const { addToHistory } = useAppStore()
  
  const [season, setSeason] = useState<Season>('spring')
  const [breadType, setBreadType] = useState<BreadType>('enriched')
  const [useAutoFriction, setUseAutoFriction] = useState(false)
  const [localData, setLocalData] = useState({
    targetTemp: 25,
    flourTemp: 20,
    roomTemp: environment?.temp || 22,
    prefermentTemp: null as number | null,
    mixerType: 'stand' as MixerType,
    mixingTime: 10,
    // 섭씨 물온도 DDT 공식 전용 기본 마찰계수 (스탠드 믹서 = 8°C)
    // 기존 화씨 기본값 24 를 섭씨 공식에 넣으면 물온도가 비현실적으로 낮아짐(C-5 결함)
    frictionFactor: 8,
    waterTemp: null as number | null,
    useIce: false,
    iceAmount: 0,
    waterAmount: 0
  })

  // 환경 온도 업데이트 - useEffect 최적화
  useEffect(() => {
    if (environment?.temp) {
      setLocalData(prev => ({ ...prev, roomTemp: environment.temp }))
    }
  }, [environment?.temp])

  // 추천 DDT 업데이트 - useEffect 최적화
  useEffect(() => {
    const recommendedDDT = RECOMMENDED_DDT[season][breadType]
    setLocalData(prev => ({ ...prev, targetTemp: recommendedDDT }))
  }, [season, breadType])

  // 액체 총량 계산 - useMemo 최적화
  const liquidTotal = useMemo(() => {
    if (!recipe) return 300 // 기본값
    return recipe.ingredients
      .filter(ing => ing.category === 'liquid' || ing.category === 'egg')
      .reduce((sum, ing) => sum + (ing.amount || 0), 0)
  }, [recipe])

  // 수화율 계산 - useMemo 최적화
  const doughHydration = useMemo(() => {
    if (!recipe) return 70 // 기본값
    const flourTotal = recipe.ingredients
      .filter(ing => ing.category === 'flour' || ing.isFlour)
      .reduce((sum, ing) => sum + (ing.amount || 0), 0)
    return flourTotal > 0 ? (liquidTotal / flourTotal) * 100 : 70
  }, [recipe, liquidTotal])

  // 권장 마찰계수 계산 - useMemo 최적화
  // 섭씨 물온도 DDT 공식 전용 추천값 사용 (C-5 결함 수정: 화씨 recommendFrictionFactor 사용 금지)
  const recommendedFriction = useMemo(() => {
    return DDTCalc.recommendFrictionFactorCelsius(
      localData.mixerType,
      localData.mixingTime,
      doughHydration
    )
  }, [localData.mixerType, localData.mixingTime, doughHydration])

  // Auto 모드일 때 마찰계수 업데이트
  useEffect(() => {
    if (useAutoFriction) {
      setLocalData(prev => ({ ...prev, frictionFactor: recommendedFriction }))
    }
  }, [useAutoFriction, recommendedFriction])

  // 계산 핸들러 - useCallback 최적화
  const handleCalculate = useCallback(() => {
    const { targetTemp, flourTemp, roomTemp, prefermentTemp, frictionFactor } = localData
    
    let calculatedWaterTemp: number
    
    if (prefermentTemp) {
      calculatedWaterTemp = DDTCalc.calculateWaterTempWithPreferment(
        targetTemp,
        { flour: flourTemp, room: roomTemp, preferment: prefermentTemp },
        frictionFactor
      )
    } else {
      calculatedWaterTemp = DDTCalc.calculateWaterTemp(
        targetTemp,
        flourTemp,
        roomTemp,
        frictionFactor
      )
    }

    // 얼음 필요량 계산
    if (calculatedWaterTemp < 0 || localData.useIce) {
      const currentWaterTemp = 20 // 일반 수돗물 온도
      const iceData = DDTCalc.calculateIceAmount(
        liquidTotal,
        currentWaterTemp,
        Math.max(calculatedWaterTemp, 0)
      )
      
      setLocalData(prev => ({
        ...prev,
        waterTemp: calculatedWaterTemp,
        iceAmount: iceData.ice,
        waterAmount: iceData.water,
        useIce: true
      }))
    } else {
      setLocalData(prev => ({
        ...prev,
        waterTemp: calculatedWaterTemp,
        iceAmount: 0,
        waterAmount: liquidTotal,
        useIce: false
      }))
    }

    // 스토어 업데이트
    updateDDT({
      targetTemp,
      flourTemp,
      roomTemp,
      prefermentTemp: prefermentTemp || undefined,
      frictionFactor,
      includePreferment: !!prefermentTemp,
      results: {
        waterTemp: calculatedWaterTemp,
        warnings: [],
        recommendations: []
      }
    })

    // 히스토리에 추가
    addToHistory({
      type: 'calculation',
      data: {
        type: 'ddt',
        targetTemp,
        waterTemp: calculatedWaterTemp,
        timestamp: new Date()
      },
      isFavorite: false
    })
  }, [localData, liquidTotal, updateDDT, addToHistory])

  // 최종 온도 예측 - useCallback 최적화
  const predictFinalTemp = useCallback(() => {
    if (!localData.waterTemp) return null
    
    const temps = {
      flour: localData.flourTemp,
      water: localData.waterTemp,
      room: localData.roomTemp,
      preferment: localData.prefermentTemp || undefined
    }
    
    return DDTCalc.predictDoughTemp(
      temps,
      localData.mixingTime,
      localData.mixerType
    )
  }, [localData])

  // 입력 변경 핸들러 - useCallback 최적화
  const handleInputChange = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const next = { ...prev, [field]: value }
      // 믹서 종류를 바꾸면 수동 모드에서 마찰계수를 해당 믹서의 섭씨 상수로 동기화 (C-5 결함 수정)
      // Auto 모드일 때는 recommendedFriction useEffect 가 덮어쓰므로 건드리지 않는다.
      if (field === 'mixerType' && !useAutoFriction) {
        next.frictionFactor = DDTCalc.FRICTION_FACTORS_CELSIUS[value as MixerType]
      }
      return next
    })
  }, [useAutoFriction])

  // 예측 온도 - useMemo 최적화
  const predictedTemp = useMemo(() => predictFinalTemp(), [predictFinalTemp])

  // 선택 옵션들 - useMemo 최적화
  const seasonOptions = useMemo(() => [
    { value: 'spring', label: t('ddt.seasons.spring') },
    { value: 'summer', label: t('ddt.seasons.summer') },
    { value: 'fall', label: t('ddt.seasons.fall') },
    { value: 'winter', label: t('ddt.seasons.winter') }
  ], [t])

  const breadOptions = useMemo(() => [
    { value: 'lean', label: t('ddt.breadTypes.lean') },
    { value: 'enriched', label: t('ddt.breadTypes.enriched') },
    { value: 'sourdough', label: t('ddt.breadTypes.sourdough') },
    { value: 'pizza', label: t('ddt.breadTypes.pizza') },
    { value: 'croissant', label: t('ddt.breadTypes.croissant') }
  ], [t])

  const mixerOptions = useMemo(() => [
    { value: 'hand', label: t('ddt.mixerTypes.hand') },
    { value: 'stand', label: t('ddt.mixerTypes.stand') },
    { value: 'spiral', label: t('ddt.mixerTypes.spiral') },
    { value: 'planetary', label: t('ddt.mixerTypes.planetary') },
    { value: 'intensive', label: t('ddt.mixerTypes.intensive') }
  ], [t])

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-bread-700">
        {t('ddt.title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽: 입력 필드 */}
        <div className="space-y-4">
          <SelectField
            label={t('ddt.labels.season')}
            value={season}
            onChange={(value) => setSeason(value as Season)}
            options={seasonOptions}
          />

          <SelectField
            label={t('ddt.labels.breadType')}
            value={breadType}
            onChange={(value) => setBreadType(value as BreadType)}
            options={breadOptions}
          />

          <Input
            label={`${t('ddt.labels.ddtValue')} (°C)`}
            type="number"
            value={localData.targetTemp}
            onValueChange={(value: string) => handleInputChange('targetTemp', Number(value))}
            min={20}
            max={30}
            step={0.5}
            placeholder={t('ddt.labels.ddtValue')}
          />

          <Input
            label={`${t('ddt.labels.flourTemp')} (°C)`}
            type="number"
            value={localData.flourTemp}
            onValueChange={(value: string) => handleInputChange('flourTemp', Number(value))}
            min={-10}
            max={40}
            step={0.5}
            placeholder={t('ddt.labels.flourTemp')}
          />

          <Input
            label={`${t('ddt.labels.roomTemp')} (°C)`}
            type="number"
            value={localData.roomTemp}
            onValueChange={(value: string) => handleInputChange('roomTemp', Number(value))}
            min={-10}
            max={40}
            step={0.5}
            placeholder={t('ddt.labels.roomTemp')}
          />

          <SelectField
            label={t('ddt.labels.mixerType')}
            value={localData.mixerType}
            onChange={(value) => handleInputChange('mixerType', value)}
            options={mixerOptions}
          />

          {/* Friction Factor with Auto-Recommendation (섭씨 °C 단위) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('ddt.labels.mixerFriction')} (°C)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={localData.frictionFactor}
                onValueChange={(value: string) => handleInputChange('frictionFactor', Number(value))}
                min={0}
                max={15}
                step={0.5}
                placeholder={t('ddt.labels.mixerFriction')}
                disabled={useAutoFriction}
              />
              <Button
                variant={useAutoFriction ? 'primary' : 'secondary'}
                onClick={() => {
                  setUseAutoFriction(!useAutoFriction)
                  if (!useAutoFriction) {
                    setLocalData(prev => ({ ...prev, frictionFactor: recommendedFriction }))
                  }
                }}
                className="whitespace-nowrap"
              >
                {useAutoFriction ? t('ddt.labels.manual') : 'Auto'}
              </Button>
            </div>
            {useAutoFriction && (
              <p className="mt-1 text-xs text-bread-600">
                {t('ddt.labels.recommendedValue')}: {recommendedFriction}°C ({t('ddt.labels.mixingTime')} {localData.mixingTime}{t('ddt.labels.minutes')}, {t('ddt.labels.hydration')} {doughHydration.toFixed(0)}%)
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-preferment"
              checked={localData.prefermentTemp !== null}
              onChange={(e) => {
                if (e.target.checked) {
                  handleInputChange('prefermentTemp', 20)
                } else {
                  handleInputChange('prefermentTemp', null)
                }
              }}
              className="rounded border-bread-300 text-bread-600 focus:ring-bread-500"
            />
            <label htmlFor="use-preferment" className="text-sm text-gray-700">
              {t('ddt.labels.usePreferment')}
            </label>
          </div>

          {localData.prefermentTemp !== null && (
            <Input
              label={`${t('ddt.labels.prefermentTemp')} (°C)`}
              type="number"
              value={localData.prefermentTemp}
              onValueChange={(value: string) => handleInputChange('prefermentTemp', Number(value))}
              min={0}
              max={40}
              step={0.5}
              placeholder={t('ddt.labels.prefermentTemp')}
            />
          )}

          <Button onClick={handleCalculate} variant="primary" fullWidth>
            {t('ddt.labels.calculate')}
          </Button>
        </div>
        
        {/* 오른쪽: 결과 표시 */}
        <div>
          <ResultDisplay
            waterTemp={localData.waterTemp}
            useIce={localData.useIce}
            iceAmount={localData.iceAmount}
            waterAmount={localData.waterAmount}
            predictedTemp={predictedTemp}
            t={t}
          />

          {/* 마찰계수 참고 정보 (섭씨 물온도 DDT 공식 기준값, C-5 결함 수정) */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">{t('ddt.frictionReference.title')} (°C):</p>
            <ul className="space-y-0.5">
              <li>• {t('ddt.mixerTypes.hand')}: {DDTCalc.FRICTION_FACTORS_CELSIUS['hand']}°C</li>
              <li>• {t('ddt.mixerTypes.spiral')}: {DDTCalc.FRICTION_FACTORS_CELSIUS['spiral']}°C</li>
              <li>• {t('ddt.mixerTypes.stand')}: {DDTCalc.FRICTION_FACTORS_CELSIUS['stand']}°C</li>
              <li>• {t('ddt.mixerTypes.planetary')}: {DDTCalc.FRICTION_FACTORS_CELSIUS['planetary']}°C</li>
              <li>• {t('ddt.mixerTypes.intensive')}: {DDTCalc.FRICTION_FACTORS_CELSIUS['intensive']}°C</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
})

DDTCalculatorComponent.displayName = 'DDTCalculator'

export default DDTCalculatorComponent