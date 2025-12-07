import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import Button from '../common/Button'
import Input from '../common/Input'
import { DDTCalculator as DDTCalc, MixerType } from '@utils/calculations/ddtCalculator'
import { Recipe } from '@types/recipe.types'
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
}>(({ waterTemp, useIce, iceAmount, waterAmount, predictedTemp }) => {
  if (!waterTemp) return null

  return (
    <div className="bg-bread-50 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-bread-700">계산 결과</h4>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">필요한 물 온도:</span>
          <span className="font-semibold text-bread-700">
            {waterTemp.toFixed(1)}°C
          </span>
        </div>
        
        {useIce && (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">얼음:</span>
              <span className="font-semibold">{iceAmount}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">찬물:</span>
              <span className="font-semibold">{waterAmount}g</span>
            </div>
          </>
        )}
        
        {predictedTemp && (
          <div className="flex justify-between pt-2 border-t border-bread-200">
            <span className="text-sm text-gray-600">예상 반죽 온도:</span>
            <span className="font-semibold text-bread-700">
              {predictedTemp.toFixed(1)}°C
            </span>
          </div>
        )}
      </div>
      
      {waterTemp < 5 && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          💡 물 온도가 매우 낮습니다. 냉장 보관된 물을 사용하세요.
        </div>
      )}
      
      {waterTemp > 35 && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          ⚠️ 물 온도가 높습니다. 이스트 활성에 영향을 줄 수 있습니다.
        </div>
      )}
    </div>
  )
})

ResultDisplay.displayName = 'ResultDisplay'

// DDTCalculator 메인 컴포넌트 최적화
const DDTCalculatorComponent = memo<DDTCalculatorProps>(({ recipe, environment }) => {
  const { ddtCalculation, updateDDT } = useCalculatorStore()
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
    frictionFactor: 24,
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
  const recommendedFriction = useMemo(() => {
    return DDTCalc.recommendFrictionFactor(
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
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  // 예측 온도 - useMemo 최적화
  const predictedTemp = useMemo(() => predictFinalTemp(), [predictFinalTemp])

  // 선택 옵션들 - useMemo 최적화
  const seasonOptions = useMemo(() => [
    { value: 'spring', label: '봄' },
    { value: 'summer', label: '여름' },
    { value: 'fall', label: '가을' },
    { value: 'winter', label: '겨울' }
  ], [])

  const breadOptions = useMemo(() => [
    { value: 'lean', label: '린 도우 (바게트, 치아바타)' },
    { value: 'enriched', label: '리치 도우 (식빵, 브리오슈)' },
    { value: 'sourdough', label: '사워도우' },
    { value: 'pizza', label: '피자 도우' },
    { value: 'croissant', label: '크루아상' }
  ], [])

  const mixerOptions = useMemo(() => [
    { value: 'hand', label: '손반죽' },
    { value: 'stand', label: '스탠드 믹서' },
    { value: 'spiral', label: '스파이럴 믹서' },
    { value: 'planetary', label: '플래니터리 믹서' },
    { value: 'intensive', label: '고속 믹서' }
  ], [])

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-bread-700">
        DDT (목표 반죽 온도) 계산기
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽: 입력 필드 */}
        <div className="space-y-4">
          <SelectField
            label="계절"
            value={season}
            onChange={(value) => setSeason(value as Season)}
            options={seasonOptions}
          />
          
          <SelectField
            label="빵 종류"
            value={breadType}
            onChange={(value) => setBreadType(value as BreadType)}
            options={breadOptions}
          />
          
          <Input
            label="목표 반죽 온도 (°C)"
            type="number"
            value={localData.targetTemp}
            onValueChange={(value) => handleInputChange('targetTemp', Number(value))}
            min={20}
            max={30}
            step={0.5}
            placeholder="목표 반죽 온도"
          />
          
          <Input
            label="밀가루 온도 (°C)"
            type="number"
            value={localData.flourTemp}
            onValueChange={(value) => handleInputChange('flourTemp', Number(value))}
            min={-10}
            max={40}
            step={0.5}
            placeholder="밀가루 온도"
          />
          
          <Input
            label="실온 (°C)"
            type="number"
            value={localData.roomTemp}
            onValueChange={(value) => handleInputChange('roomTemp', Number(value))}
            min={-10}
            max={40}
            step={0.5}
            placeholder="실온"
          />
          
          <SelectField
            label="믹서 종류"
            value={localData.mixerType}
            onChange={(value) => handleInputChange('mixerType', value)}
            options={mixerOptions}
          />

          {/* Friction Factor with Auto-Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              마찰계수 (Friction Factor)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={localData.frictionFactor}
                onValueChange={(value) => handleInputChange('frictionFactor', Number(value))}
                min={0}
                max={50}
                step={1}
                placeholder="마찰계수"
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
                {useAutoFriction ? '수동' : 'Auto'}
              </Button>
            </div>
            {useAutoFriction && (
              <p className="mt-1 text-xs text-bread-600">
                권장값: {recommendedFriction}°C (믹싱시간 {localData.mixingTime}분, 수화율 {doughHydration.toFixed(0)}%)
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
              프리퍼먼트 사용
            </label>
          </div>
          
          {localData.prefermentTemp !== null && (
            <Input
              label="프리퍼먼트 온도 (°C)"
              type="number"
              value={localData.prefermentTemp}
              onValueChange={(value) => handleInputChange('prefermentTemp', Number(value))}
              min={0}
              max={40}
              step={0.5}
              placeholder="프리퍼먼트 온도"
            />
          )}
          
          <Button onClick={handleCalculate} variant="primary" fullWidth>
            물 온도 계산
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
          />
          
          {/* 마찰계수 참고 정보 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">마찰계수 참고:</p>
            <ul className="space-y-0.5">
              <li>• 손반죽: 0°C</li>
              <li>• 스탠드 믹서: 24°C</li>
              <li>• 스파이럴 믹서: 22°C</li>
              <li>• 플래니터리 믹서: 26°C</li>
              <li>• 고속 믹서: 30°C</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
})

DDTCalculatorComponent.displayName = 'DDTCalculator'

export default DDTCalculatorComponent