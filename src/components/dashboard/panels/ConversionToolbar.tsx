/**
 * ConversionToolbar.tsx
 * 레시피 변환 도구 사이드바
 * 팬 크기, 제법, 수량, DDT, 환경 조정 도구 제공
 */

import React, { useState, useCallback } from 'react'
import {
  CakeSlice,
  Layers,
  Hash,
  Thermometer,
  Cloud,
  ChevronRight,
  Info,
  RotateCcw,
} from 'lucide-react'
import { useDashboardStore } from '@/stores/useDashboardStore'
import type { Recipe, PanConfig, BreadMethod } from '@/types/recipe.types'
import type { ConversionToolbarProps, ConversionConfig } from '@/types/dashboard.types'

// 팬 프리셋 데이터
const PAN_PRESETS: PanConfig[] = [
  {
    id: 'round-15',
    name: '원형 15cm (6인치)',
    type: 'round',
    dimensions: { diameter: 150, height: 50 },
    volume: 884,
    material: 'aluminum',
    fillRatio: 0.7,
  },
  {
    id: 'round-18',
    name: '원형 18cm (7인치)',
    type: 'round',
    dimensions: { diameter: 180, height: 50 },
    volume: 1272,
    material: 'aluminum',
    fillRatio: 0.7,
  },
  {
    id: 'round-21',
    name: '원형 21cm (8인치)',
    type: 'round',
    dimensions: { diameter: 210, height: 50 },
    volume: 1732,
    material: 'aluminum',
    fillRatio: 0.7,
  },
  {
    id: 'loaf-1',
    name: '식빵틀 1근 (22.5×9×9.5cm)',
    type: 'loaf',
    dimensions: { length: 225, width: 90, height: 95 },
    volume: 1926,
    material: 'steel',
    fillRatio: 0.8,
  },
  {
    id: 'loaf-1.5',
    name: '식빵틀 1.5근 (25×10×10.5cm)',
    type: 'loaf',
    dimensions: { length: 250, width: 100, height: 105 },
    volume: 2625,
    material: 'steel',
    fillRatio: 0.8,
  },
  {
    id: 'pullman',
    name: '풀먼틀 (25×10×10cm)',
    type: 'pullman',
    dimensions: { length: 250, width: 100, height: 100 },
    volume: 2500,
    material: 'steel',
    fillRatio: 0.85,
  },
]

// 제법 데이터
const METHODS: { id: BreadMethod; name: string; description: string }[] = [
  { id: 'straight', name: '스트레이트법', description: '모든 재료를 한번에 믹싱' },
  { id: 'sponge', name: '중종법', description: '종반죽 + 본반죽 (2-4시간 발효)' },
  { id: 'poolish', name: '폴리쉬법', description: '액종 사용 (12-16시간 발효)' },
  { id: 'biga', name: '비가법', description: '이탈리아 종반죽 (16-24시간)' },
  { id: 'overnight', name: '저온숙성법', description: '냉장 발효 (12-24시간)' },
  { id: 'sourdough', name: '사워도우', description: '천연발효종 (1-2일)' },
]

const ConversionToolbar: React.FC<ConversionToolbarProps> = ({
  isCollapsed,
  onToggle,
  config,
  sourceRecipe,
  activeTab,
  onTabChange,
}) => {
  const { updatePanConfig, updateMethodConfig, updateQuantity, updateDDT, updateEnvironment, resetConversion } =
    useDashboardStore()

  if (isCollapsed || !sourceRecipe) return null

  const tabs = [
    { id: 'pan' as const, icon: CakeSlice, label: '팬 크기' },
    { id: 'method' as const, icon: Layers, label: '제법' },
    { id: 'quantity' as const, icon: Hash, label: '수량' },
    { id: 'ddt' as const, icon: Thermometer, label: 'DDT' },
    { id: 'environment' as const, icon: Cloud, label: '환경' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            ⚡ 빠른 변환
          </h2>
          <button
            onClick={resetConversion}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="변환 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-0 px-3 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'pan' && (
          <PanScalingTool
            currentPan={sourceRecipe.panConfig}
            targetPan={config.targetPan}
            onPanChange={updatePanConfig}
          />
        )}
        {activeTab === 'method' && (
          <MethodConversionTool
            currentMethod={sourceRecipe.method?.method || 'straight'}
            targetMethod={config.targetMethod}
            onMethodChange={updateMethodConfig}
          />
        )}
        {activeTab === 'quantity' && (
          <QuantityScalerTool
            multiplier={config.batchMultiplier}
            onMultiplierChange={updateQuantity}
            sourceYield={sourceRecipe.yield}
          />
        )}
        {activeTab === 'ddt' && (
          <DDTCalculatorTool
            settings={config.ddtSettings}
            onSettingsChange={updateDDT}
          />
        )}
        {activeTab === 'environment' && (
          <EnvironmentTool
            settings={config.environment}
            onSettingsChange={updateEnvironment}
          />
        )}
      </div>
    </div>
  )
}

// ========== 도구 컴포넌트들 ==========

// 팬 크기 변환 도구
const PanScalingTool: React.FC<{
  currentPan: PanConfig | null | undefined
  targetPan: PanConfig | null
  onPanChange: (pan: PanConfig) => void
}> = ({ currentPan, targetPan, onPanChange }) => {
  const [customMode, setCustomMode] = useState(false)

  return (
    <div className="space-y-4">
      {/* Current Pan Info */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 팬</p>
        <p className="font-medium text-gray-900 dark:text-white">
          {currentPan?.name || '미지정'}
        </p>
      </div>

      {/* Pan Presets */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          변환할 팬 선택
        </p>
        <div className="space-y-2">
          {PAN_PRESETS.map((pan) => (
            <button
              key={pan.id}
              onClick={() => onPanChange(pan)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                targetPan?.id === pan.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {pan.name}
                </span>
                {targetPan?.id === pan.id && (
                  <span className="text-blue-500 text-xs">선택됨</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                용량: {pan.volume.toLocaleString()}ml
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Scale Factor Display */}
      {targetPan && currentPan && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">배율</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            ×{(targetPan.volume / (currentPan.volume || 1)).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}

// 제법 변환 도구
const MethodConversionTool: React.FC<{
  currentMethod: BreadMethod
  targetMethod: BreadMethod | null
  onMethodChange: (method: BreadMethod) => void
}> = ({ currentMethod, targetMethod, onMethodChange }) => {
  const currentMethodName =
    METHODS.find((m) => m.id === currentMethod)?.name || currentMethod

  return (
    <div className="space-y-4">
      {/* Current Method */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 제법</p>
        <p className="font-medium text-gray-900 dark:text-white">
          {currentMethodName}
        </p>
      </div>

      {/* Method Options */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          변환할 제법 선택
        </p>
        <div className="space-y-2">
          {METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              disabled={method.id === currentMethod}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                targetMethod === method.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : method.id === currentMethod
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {method.name}
                </span>
                {method.id === currentMethod && (
                  <span className="text-xs text-gray-500">(현재)</span>
                )}
                {targetMethod === method.id && (
                  <span className="text-blue-500 text-xs">선택됨</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {method.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// 수량 조절 도구
const QuantityScalerTool: React.FC<{
  multiplier: number
  onMultiplierChange: (multiplier: number) => void
  sourceYield: { quantity: number; unit: string } | undefined
}> = ({ multiplier, onMultiplierChange, sourceYield }) => {
  const presets = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5]

  return (
    <div className="space-y-4">
      {/* Current Yield */}
      {sourceYield && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            원본 생산량
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {sourceYield.quantity}
            {sourceYield.unit}
          </p>
        </div>
      )}

      {/* Multiplier Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            배수
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ×{multiplier}
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={multiplier}
          onChange={(e) => onMultiplierChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onMultiplierChange(preset)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              multiplier === preset
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
            }`}
          >
            ×{preset}
          </button>
        ))}
      </div>

      {/* Result */}
      {sourceYield && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
            변환 후 생산량
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {Math.round(sourceYield.quantity * multiplier)}
            {sourceYield.unit}
          </p>
        </div>
      )}
    </div>
  )
}

// DDT 계산기 도구
const DDTCalculatorTool: React.FC<{
  settings: any
  onSettingsChange: (settings: any) => void
}> = ({ settings, onSettingsChange }) => {
  const [targetTemp, setTargetTemp] = useState(settings?.targetTemp || 27)
  const [flourTemp, setFlourTemp] = useState(settings?.flourTemp || 20)
  const [roomTemp, setRoomTemp] = useState(settings?.roomTemp || 25)
  const [frictionFactor, setFrictionFactor] = useState(
    settings?.frictionFactor || 20
  )

  // DDT 계산: 물 온도 = (목표온도 × 3) - 밀가루온도 - 실온 - 마찰계수
  const waterTemp = targetTemp * 3 - flourTemp - roomTemp - frictionFactor

  const handleApply = () => {
    onSettingsChange({
      targetTemp,
      flourTemp,
      roomTemp,
      frictionFactor,
      includePreferment: false,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          DDT(반죽목표온도) 계산기로 물 온도를 자동 계산합니다.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            목표 반죽 온도 (°C)
          </label>
          <input
            type="number"
            value={targetTemp}
            onChange={(e) => setTargetTemp(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            밀가루 온도 (°C)
          </label>
          <input
            type="number"
            value={flourTemp}
            onChange={(e) => setFlourTemp(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            실내 온도 (°C)
          </label>
          <input
            type="number"
            value={roomTemp}
            onChange={(e) => setRoomTemp(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            마찰계수
          </label>
          <input
            type="number"
            value={frictionFactor}
            onChange={(e) => setFrictionFactor(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Result */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
          필요한 물 온도
        </p>
        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
          {waterTemp}°C
        </p>
        {waterTemp < 5 && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ 물 온도가 너무 낮습니다. 얼음물을 사용하세요.
          </p>
        )}
      </div>

      <button
        onClick={handleApply}
        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
      >
        적용
      </button>
    </div>
  )
}

// 환경 조정 도구
const EnvironmentTool: React.FC<{
  settings: any
  onSettingsChange: (settings: any) => void
}> = ({ settings, onSettingsChange }) => {
  const [temperature, setTemperature] = useState(settings?.temperature || 25)
  const [humidity, setHumidity] = useState(settings?.humidity || 60)
  const [altitude, setAltitude] = useState(settings?.altitude || 0)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          환경 조건에 따라 발효 시간과 굽기 시간이 조정됩니다.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            실내 온도 (°C)
          </label>
          <input
            type="range"
            min="15"
            max="35"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>15°C</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {temperature}°C
            </span>
            <span>35°C</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            습도 (%)
          </label>
          <input
            type="range"
            min="30"
            max="90"
            value={humidity}
            onChange={(e) => setHumidity(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>30%</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {humidity}%
            </span>
            <span>90%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            고도 (m)
          </label>
          <input
            type="number"
            value={altitude}
            onChange={(e) => setAltitude(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="해발 고도 (미터)"
          />
        </div>
      </div>

      <button
        onClick={() => onSettingsChange({ temperature, humidity, altitude })}
        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
      >
        적용
      </button>
    </div>
  )
}

export default ConversionToolbar
